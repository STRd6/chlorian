clone = (obj) ->
  JSON.parse(JSON.stringify(obj))

module.exports = (buffer, adapter) ->
  # Midi loading
  MidiFile = require "./lib/midifile"
  MidiPlayer = require "./midi_player"

  {playNote, releaseNote, programChange, pitchBend} = adapter

  initialState = null
  currentState = null
  player = null

  do ->
    array = new Uint8Array(buffer)
    midiFile = MidiFile(array)
    console.log midiFile

    player = MidiPlayer(midiFile)

    initialState = clone(player.initialState)

    currentState = clone(initialState)

  meta = {}

  handleEvent = (event, state) ->
    {time} = state
    {channel, deltaTime, noteNumber, subtype, type, velocity} = event

    # TODO: Should we just pass through the raw midi event data buffers directly
    # rather than switch and dispatch known subsets here?
    switch "#{type}:#{subtype}"
      when "channel:controller"
        ; # TODO
      when "channel:noteOn"
        playNote time, channel, noteNumber, velocity
      when "channel:noteOff"
        releaseNote time, channel, noteNumber
      when "channel:pitchBend"
        pitchBend time, channel, event.value
      when "channel:programChange"
        programChange time, channel, event.programNumber
      when "meta:copyrightNotice"
        if meta.copyrightNotice
          meta.copyrightNotice += "/n#{event.text}"
        else
          meta.copyrightNotice = event.text
      when "meta:endOfTrack"
        ; # TODO
      when "meta:keySignature"
        meta.keySignature =
          scale: event.scale
          key: event.key
      when "meta:lyrics"
        ; # TODO
      when "meta:setTempo"
        state.microsecondsPerBeat = event.microsecondsPerBeat
      when "meta:text"
        if meta.text
          meta.text += "/n#{event.text}"
        else
          meta.text = event.text
      when "meta:timeSignature"
        meta.timeSignature =
          denominator: event.denominator
          metronome: event.metronome
          numerator: event.numerator
          thirtyseconds: event.thirtySeconds
      when "meta:trackName"
        # TODO: This needs to be per track
        meta.trackName = event.text
      when "meta:unknown"
        ;
      else
        console.log "Unknown", event

    return state

  consumeEventsUntilTime = (t) ->
    count = 0

    while currentState.time < t
      event = player.readEvent(currentState, true)
      break unless event
      handleEvent(event, currentState)
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
