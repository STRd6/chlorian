Ajax = require "./lib/ajax"

clone = (obj) ->
  JSON.parse(JSON.stringify(obj))

module.exports = (context, Player) ->
  # How far ahead in seconds to pull events from the midi tracks
  # NOTE: Needs to be >1s for setInteval to populate enough to run in a background tab
  # We want it to be really short so that play/pause responsiveness feels quick
  # We want it to be long enough to cover up irregularities with setTimeout
  LOOKAHEAD = 0.25

  readFile = require "./lib/read_file"
  Drop = require "./lib/drop"

  Drop document, (e) ->
    file = e.dataTransfer.files[0]

    if file
      readFile(file, "readAsArrayBuffer")
      .then load

  # Midi loading
  MidiFile = require "./lib/midifile"
  MidiPlayer = require "./midi_player"

  # Bad Apple 36MB MIDI
  badApple = "http://whimsy.space/danielx/data/clOXhtZz4VcunDJZdCM8T5pjBPKQaLCYCzbDod39Vbg"
  waltz = "http://whimsy.space/danielx/data/qxIFNrVVEqhwmwUO5wWyZKk1IwGgQIxqvLQ9WX0X20E"
  jordan = "http://whimsy.space/danielx/data/FhSh0qeVTMu9Xwd4vihF6shaPJsD_rM8t1OSKGl-ir4"
  aquarius = "http://whimsy.space/danielx/data/ZZXoIXhXFbo0pWGn-m938Vgox_NmJiYkZ9g3UkR0PrU"
  slunk = "http://whimsy.space/danielx/data/EtME8Imvk8eE8MXc7jlwJOVotKM2KVmxXd8QiJtBbPc"

  {allNotesOff, playNote, releaseNote, programChange, pitchBend} = Player()

  meta = {}

  handleEvent = (event, state) ->
    {time, timeOffset} = state
    {channel, deltaTime, noteNumber, subtype, type, velocity} = event

    # TODO: Should we just pass through the raw midi event data buffers directly
    # rather than switch and dispatch known subsets here?
    switch "#{type}:#{subtype}"
      when "channel:controller"
        ; # TODO
      when "channel:noteOn"
        playNote time + timeOffset, channel, noteNumber, velocity
      when "channel:noteOff"
        releaseNote time + timeOffset, channel, noteNumber
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

  initialState = null
  currentState = null
  playing = false
  player = null

  consumeEventsUntilTime = (t) ->
    count = 0

    while currentState.time < t
      [event, nextState] = player.readEvent(currentState, true)
      break unless event
      currentState = handleEvent(event, nextState)
      count += 1

    return count

  load = (buffer) ->
    allNotesOff(0)

    array = new Uint8Array(buffer)
    midiFile = MidiFile(array)
    console.log midiFile

    player = MidiPlayer(midiFile)

    initialState = clone(player.initialState)
    
    currentState = clone(initialState)
    currentState.timeOffset = context.currentTime

  loadURL = (url) ->
    Ajax.getBuffer(url)
    .then load

  setInterval ->
    if playing && currentState
      t = context.currentTime - currentState.timeOffset
      consumed = consumeEventsUntilTime(t + LOOKAHEAD)
      # console.log "Consumed:", consumed
  , 4
  
  loadURL(waltz)

  play: ->
    playing = true

  pause: ->
    playing = !playing

  stop: ->
    playing = false

  currentState: ->
    currentState

  handleEvent: handleEvent
