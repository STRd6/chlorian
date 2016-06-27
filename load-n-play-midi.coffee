MidiReader = require "./midi_reader"

clone = (obj) ->
  JSON.parse(JSON.stringify(obj))

defaultChannelState = ->
  channels = [0..15].map ->
    fx:
      panpot: 0 # [-1, 1]
      pitchBend: 8192 # [0, 16383]
      pitchBendSensitivity: 1
      volume: 0.5 # [0, 1]
    program: 0

handlers =
  # IMPORTANT: This modifies the state.microsecondsPerBeat on setTempo events
  # This is how the player reacts to tempo changes.
  # All the other meta stuff is pretty optional
  meta: (event, state) ->
    {subtype, type, text, microsecondsPerBeat} = event
  
    state.meta ?= {}
    meta = state.meta
  
    switch subtype
      when "setTempo"
        state.microsecondsPerBeat = microsecondsPerBeat
      when "copyrightNotice"
        if meta.copyrightNotice
          meta.copyrightNotice += "/n#{text}"
        else
          meta.copyrightNotice = text
      when "meta:endOfTrack"
        ; # TODO
      when "meta:keySignature"
        meta.keySignature =
          scale: event.scale
          key: event.key
      when "meta:lyrics"
        ; # TODO
      when "meta:text"
        if meta.text
          meta.text += "/n#{text}"
        else
          meta.text = text
      when "meta:timeSignature"
        meta.timeSignature =
          denominator: event.denominator
          metronome: event.metronome
          numerator: event.numerator
          thirtyseconds: event.thirtySeconds
      when "meta:trackName"
        # TODO: This needs to be per track
        meta.trackName = text
      when "meta:unknown"
        ;

module.exports = (buffer) ->
  reader = MidiReader(buffer)
  initialState = clone(reader.initialState)
  initialState.channels = defaultChannelState()
  currentState = clone(initialState)

  handleEvent = (event, state) ->
    {time} = state
    {channel, deltaTime, noteNumber, subtype, type, velocity} = event

    switch type
      when "meta"
        handlers["meta"](event, state)
      when "channel"
        switch subtype
          when "programChange"
            state.channels[channel].program = event.programNumber
      else
        console.log "Unknown", event

    return state

  consumeEventsUntilTime = (t, handler) ->
    count = 0

    while currentState.time < t and count <= 10000
      event = reader.readEvent(currentState, true)
      break unless event
      handleEvent(event, currentState) # Internal Handler
      handler?(event, currentState) # External Handler
      count += 1

    return count

  self =
    consumeEventsUntilTime: consumeEventsUntilTime

    reset: ->
      currentState = clone initialState

    currentState: (newState) ->
      if arguments.length is 1
        currentState = newState
      else
        currentState

    handleEvent: handleEvent

    initialState: initialState
