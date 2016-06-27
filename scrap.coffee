  # consumeSequencer()

sequencerState = null
consumeSequencer = ->
  return unless sequencer and player

  now = context.currentTime

  if !sequencerState
    console.log "START", now
    sequencerState =
      time: 0
      offset: now

  t = sequencerState.time
  offset = sequencerState.offset

  timeSlice = (now - offset) - t

  if timeSlice > 0
    sequencerState.time += timeSlice

    sequencer.notesAfter(t).filter ([time]) ->
      time < timeSlice
    .forEach ([time, note]) ->
      console.log now + time, note

      noteOnEvent =
        channel: 0
        type: "channel"
        subtype: "noteOn"
        noteNumber: note
        velocity: 64

      noteOffEvent =
        channel: 0
        type: "channel"
        subtype: "noteOff"
        noteNumber: note

      player.handleEvent noteOnEvent, time: now + time
      player.handleEvent noteOffEvent, time: now + time + 0.25


#---

-> #TODO Offline rendering
  offlineContext = new OfflineAudioContext(2, 44100*40, 44100)

  Recorder = require "./lib/recorder"
  console.log Recorder

  {saveAs} = require "./lib/filesaver"

  # TODO: Render midi to an offline context
  # Pass offline channel data to web worker from recorder.js
  # Download wav

sequencer = null

do ->
  Sequencer = require "./sequencer"

  sequencer = Sequencer()

  console.log sequencer.notesAfter(0)
  console.log sequencer.notesAfter(0.5)