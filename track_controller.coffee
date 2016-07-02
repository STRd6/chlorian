# Reads events out of a MIDI file and updates channel state
# passes events to an external device for processing or output

MidiReader = require "./midi_reader"

clone = (obj) ->
  JSON.parse(JSON.stringify(obj))

defaultChannelState = ->
  channels = [0..15].map ->
    fx:
      panpot: 0 # [-1, 1]
      pitchBend: 8192 # [0, 16383]
      pitchBendSensitivity: 1
      volume: 1 # [0, 1]
    program: 0

handlers =
  # IMPORTANT: This modifies the state.microsecondsPerBeat on setTempo events
  # This is how the player reacts to tempo changes.
  # All the other meta stuff is pretty optional
  meta: (event, state) ->
    {subtype, type, text, microsecondsPerBeat, track} = event
    {meta} = state

    switch subtype
      when "setTempo"
        state.microsecondsPerBeat = microsecondsPerBeat
      when "copyrightNotice"
        if meta.copyrightNotice
          meta.copyrightNotice += "/n#{text}"
        else
          meta.copyrightNotice = text
      when "endOfTrack"
        meta.duration = state.time
      when "keySignature"
        meta.keySignature =
          scale: event.scale
          key: event.key
      when "lyrics"
        if meta.lyrics
          meta.lyrics += " #{text}"
        else
          meta.lyrics = text
      when "text"
        if meta.text
          meta.text += "/n#{text}"
        else
          meta.text = text
      when "timeSignature"
        meta.timeSignature =
          denominator: event.denominator
          metronome: event.metronome
          numerator: event.numerator
          thirtyseconds: event.thirtySeconds
      when "trackName"
        meta.tracks[track] ?= {}
        meta.tracks[track].name = text
      else
        console.log "Unknown", event

module.exports = (buffer) ->
  reader = MidiReader(buffer)
  initialState = clone(reader.initialState)
  initialState.channels = defaultChannelState()
  initialState.meta =
    tracks: []
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

    initialState: initialState
    duration: ->
      finalState.meta.duration

  # Read through all the events to find the song duration and meta data
  finalState = null
  preload = ->
    consumeEventsUntilTime(900)
    console.log finalState = currentState
    self.reset()
  preload()

  # Gather an array of state snapshots so we can seek to any time
  duration = finalState.meta.duration
  snapshots = 100
  seekStates = [0...snapshots].map (i) ->
    consumeEventsUntilTime(duration * i / snapshots)
    clone currentState

  console.log seekStates

  self.reset()

  return self
