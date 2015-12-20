do ->
  styleNode = document.createElement("style")
  styleNode.innerHTML = require "./style"

  document.head.appendChild(styleNode)

TouchCanvas = require "touch-canvas"
Gainer = require "./gainer"
Osc = require "./noise"

{width, height} = require "./pixie"

canvas = TouchCanvas
  width: width
  height: height

document.body.appendChild canvas.element()

handleResize =  ->
  canvas.width(window.innerWidth)
  canvas.height(window.innerHeight)

handleResize()
window.addEventListener "resize", handleResize, false

context = new AudioContext

Track = require "./track"
Viz = require "./lib/viz"

track = Track()

masterGain = context.createGain()
masterGain.gain.value = 0.5
masterGain.connect(context.destination)

analyser = context.createAnalyser()
analyser.smoothingTimeConstant = 0

masterGain.connect(analyser)

viz = Viz(analyser)

osc = Gainer Osc(context, 'square')
osc.connect(masterGain)
# osc.width.value = 0.5

lfo = context.createOscillator()
lfo.start()
lfo.type = "square"
lfo.frequency = 7
# lfo.connect osc.width

t = 0
dt = 1/60

state =
  activeLine: 0
  moveNext: 0

updateViz = ->
  viz.draw(canvas)

  # trackTime = (t / 4) % 1
  # track.draw(canvas, trackTime, state)

  requestAnimationFrame updateViz

update = ->
  t += 1/60

  trackTime = (t / 4) % 1

  invariants()

  # TODO: This should be done in terms of context.currentTime
  track.update(osc.frequency, osc.gain, trackTime, dt, state)

  state.activeLine += state.moveNext
  state.moveNext = 0

invariants = ->
  state.activeLine = state.activeLine % 16
  if state.activeLine < 0
    state.activeLine += 16

# setInterval update, 1000/60

requestAnimationFrame updateViz

document.addEventListener "keydown", (e) ->
  keyCode = e.keyCode

  switch
    when keyCode is 8
      state.toSet = 255
      state.moveNext = 1
    when keyCode is 32
      state.moveNext = 1
    when keyCode is 38
      state.activeLine -= 1
    when keyCode is 40
      state.activeLine += 1
    when keyCode is 46
      state.toSet = null
      state.moveNext = 1
    when 48 <= keyCode <= 57
      state.toSet = keyCode - 48 + 4 * 12
      state.moveNext = 1
, false

document.addEventListener "mousedown", (e) ->
  y = Math.floor e.pageY / 20

  state.activeLine = y
, false

piano = require('./piano')()

# document.body.appendChild piano.element()

updatePiano = ->
  piano.draw()
  requestAnimationFrame updatePiano

requestAnimationFrame updatePiano

noteFrequencies = require "./note_frequencies"
noteToFreq = (note) ->
  noteFrequencies[note]

Track = ->
  notes = {}
  playNote = (note, velocity, id, time=context.currentTime) ->
    freq = noteToFreq(note - 12)
    volume = velocity / 128
  
    osco = context.createOscillator()
    osco.type = "square"
    osco.frequency.value = freq
  
    osco = Gainer(osco)
    osco.gain.linearRampToValueAtTime(volume, time)
    osco.connect(masterGain)

    osco.start(time)

    notes[id] = [osco, osco.gain, volume]

  releaseNote = (id, time=context.currentTime) ->
    [osco, gain, volume] = notes[id]
    # Wow this is nutz!
    # Need to ramp to the current value because linearRampToValueAtTime
    # uses the previous ramp time to create the next ramp, yolo!
    gain.linearRampToValueAtTime(volume, time)
    gain.linearRampToValueAtTime(0.0, time + 0.125)
    osco.stop(time + 0.25)
    # delete notes[id]

  return {
    playNote: playNote
    releaseNote: releaseNote
  }

do -> # Live Keyboard
  {playNote, releaseNote} = Track()

  require("./midi_access")()
  .handle (event) ->
    data = event.data
  
    [msg, note, velocity] = data
  
    cmd = msg >> 4
    channel = msg & 0xf
    type = msg & 0xf0
  
    console.log event.data
  
    switch type
      when 144 # Note on
        state.toSet = note
        state.moveNext = 2
  
        playNote(note, velocity, note)
      when 128 # Note off
        releaseNote(note)

do ->
  # Midi loading
  MidiFile = require "./lib/midifile"

  micrcosecondsPerBeat = 500000

  Ajax = require "./lib/ajax"
  Ajax.getBuffer("https://s3.amazonaws.com/whimsyspace-databucket-1g3p6d9lcl6x1/danielx/data/qxIFNrVVEqhwmwUO5wWyZKk1IwGgQIxqvLQ9WX0X20E")
  .then (buffer) ->
    array = new Uint8Array(buffer)
    midifile = MidiFile(array)
    
    ticksPerBeat = midifile.header.ticksPerBeat

    console.log buffer, midifile

    midifile.tracks.forEach (track, i) ->
      # findStuckNotes(track) if i is 2

      # return unless i is 1
      {playNote, releaseNote} = Track()

      handleEvent = (event) ->
        {deltaTime, noteNumber, subtype, velocity} = event

        timeInTicks += deltaTime
        atTime = time + (micrcosecondsPerBeat / 1000000) * (timeInTicks / ticksPerBeat)

        if subtype is "noteOn"
          playNote noteNumber, velocity, noteNumber, atTime

        if subtype is "noteOff"
          releaseNote noteNumber, atTime

      timeInTicks = 0
      time = context.currentTime

      track.forEach (event, j) ->
        if j < 200
          handleEvent(event)

      console.log timeInTicks

(midiFile) -> # Player
  microsecondsPerSecond = 1000000

  tracks = midiFile.tracks
  # Process events in batches
  # Keep data for each track and overall player
  playerData =
    currentTick: 0 # ticks
    microsecondsPerBeat: 500000 # us/beat
    nextEventTrackIndex: null
    ticksPerBeat: midifile.header.ticksPerBeat # ticks/beat
    time: 0 # seconds
    trackData: tracks.map (track, i) ->
      nextEvent = track[0]
      ticksUntilNextEvent = nextEvent?.deltaTime

      id: i
      length: track.length
      nextEventIndex: 0
      ticksUntilNextEvent: ticksUntilNextEvent

  # When we consume an event from a track we need to update the track data
  advanceTrackData = (trackData) ->
    nextEventIndex = trackData.nextEventIndex + 1
    nextEvent = tracks[trackData.id][nextEventIndex]

    id: trackData.id
    length: trackData.length
    nextEventIndex: nextEventIndex
    ticksUntilNextEvent: nextEvent?.deltaTime

  advanceTrackTicks = (trackData) ->

  # Read next event and update state
  readEvent = (playerData) ->
    # Get earliest next event
    trackData = playerData.trackData
    eventTrackIndex = playerData.nextEventTrackIndex
    eventTrack = trackData[eventTrackIndex]

    nextEvent = tracks[eventTrack.id][eventTrack.nextEventIndex]
    return [undefined, playerData] unless nextEvent

    ticksUntilNextEvent = eventTrack.ticksUntilNextEvent
    ticksPerBeat = playerData.ticksPerBeat

    # Update ticksUntil and time
    currentTick = playerData.currentTick + ticksUntilNextEvent
    timeAdvance = (ticksUntilNextEvent / ticksPerBeat) * (microsecondsPerBeat / microsecondsPerSecond)
    time = playerData.currentTime + timeAdvance

    # Advance pointer on track that event was consumed from
    # TODO: Copy eventTrack data
    

    # Advance other track pointers
    trackData.map (data, index) ->
      if index is eventTrackIndex
        advanceTrackData(data)
      else
        

    # Find next event track
    nextEventTrackIndex

    # Update event tracks
    

    newState =
      currentTick: currentTick
      microsecondsPerBeat: microsecondsPerBeat
      nextEventTrackIndex: nextEventTrackIndex
      ticksPerBeat: ticksPerBeat
      time: time
      trackData: newTrackData

    return [nextEvent, newState]

  eventsUntil = (time, state) ->
    
    [results, newState]

findStuckNotes = (events) ->
  checkingNotes = {}
  t = 0

  events.forEach (event) ->
    {deltaTime, noteNumber, subtype, velocity} = event

    t += deltaTime

    if subtype is "noteOn"
      checkingNotes[noteNumber] = t

    if subtype is "noteOff"
      oldT = checkingNotes[noteNumber]
      console.log t - oldT
      checkingNotes[noteNumber] = false

  console.log checkingNotes
