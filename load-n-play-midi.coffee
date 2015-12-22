Ajax = require "./lib/ajax"

module.exports = (context, Player) ->
  readFile = require "./lib/read_file"
  Drop = require "./lib/drop"

  Drop document, (e) ->
    file = e.dataTransfer.files[0]

    if file
      readFile(file, "readAsArrayBuffer")

  loadFile = (file) ->

  # Midi loading
  MidiFile = require "./lib/midifile"
  MidiPlayer = require "./midi_player"

  badApple = "http://whimsy.space/danielx/data/clOXhtZz4VcunDJZdCM8T5pjBPKQaLCYCzbDod39Vbg"
  waltz = "http://whimsy.space/danielx/data/qxIFNrVVEqhwmwUO5wWyZKk1IwGgQIxqvLQ9WX0X20E"
  jordan = "http://whimsy.space/danielx/data/FhSh0qeVTMu9Xwd4vihF6shaPJsD_rM8t1OSKGl-ir4"
  # Bad Apple 36MB MIDI

  require("./sample")().then (buffer) ->
    context.decodeAudioData buffer, (audioBuffer) ->
      global.sample = audioBuffer
    , (err) ->
      console.error 'Iam error'

  Ajax.getBuffer(jordan)
  .then (buffer) ->
    array = new Uint8Array(buffer)
    midiFile = MidiFile(array)
    console.log midiFile

    player = MidiPlayer(midiFile)

    {playNote, releaseNote} = Player()

    meta = {}

    handleEvent = (event, state) ->
      {time} = state
      {deltaTime, noteNumber, subtype, type, velocity} = event

      switch "#{type}:#{subtype}"
        when "channel:controller"
          ; # TODO
        when "channel:noteOn"
          playNote noteNumber, velocity, time + timeOffset
        when "channel:noteOff"
          releaseNote noteNumber, time + timeOffset
        when "channel:programChange"
          ;# console.log "PROG CH", event  
        when "meta:copyrightNotice"
          if meta.copyrightNotice
            meta.copyrightNotice += "/n#{event.text}"
          else
            meta.copyrightNotice = event.text
        when "meta:keySignature"
          meta.keySignature =
            scale: event.scale
            key: event.key
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

    timeOffset = context.currentTime

    currentState = player.initialState

    consumeEventsUntilTime = (t) ->
      count = 0

      while currentState.time < t
        [event, nextState] = player.readEvent(currentState, true)
        break unless event
        currentState = handleEvent(event, nextState)
        count += 1

      return count

    setInterval ->
      consumed = consumeEventsUntilTime(context.currentTime - timeOffset + 0.025)
      # console.log "Consumed:", consumed
    , 15
