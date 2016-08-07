do ->
  styleNode = document.createElement("style")
  styleNode.innerHTML = require "/style"

  document.head.appendChild(styleNode)
  document.body.classList.add "no-select"

TouchCanvas = require "touch-canvas"
Ajax = require "ajax"
ajax = Ajax().ajax
Synth = require "/sf2_synth"

context = new AudioContext

{width, height} = require "/pixie"
canvas = TouchCanvas
  width: width
  height: height


document.body.appendChild canvas.element()
canvas.fill('blue')

Viz = require "../lib/viz"

analyser = context.createAnalyser()
analyser.smoothingTimeConstant = 0

masterGain = context.createGain()
masterGain.connect(context.destination)
masterGain.connect(analyser)

beats = 4
trackEvents = [0...8].map (n) ->
  # TODO: Store pattern position in beats rather than seconds so we can modify tempo
  t: n/2
  note: 36
  velocity: 100

addNote = (t, note, velocity) ->
  t = t % secondsPerPattern

  console.log t

  trackEvents.push {t, note, velocity}

trackPosition = 0
bpm = 120
patternLength = 8
secondsPerBeat = 60 / bpm
secondsPerPattern = secondsPerBeat * patternLength

upcomingEvents = (events, start, end) ->
  events.filter ({t}) ->
    start <= t < end

cursor = 0
noteOn = ->
noteOff = ->
scheduleUpcomingEvents = ->
  lookahead = 0.125
  currentTime = context.currentTime
  patternTime = currentTime % secondsPerPattern
  channel = 9

  start = cursor
  end = (currentTime + lookahead) % secondsPerPattern

  handle = (time, channel, note, velocity) ->
    if velocity > 0
      noteOn(time, channel, note, velocity)
    else
      noteOff(time, channel, note)

  if start <= end
    events = upcomingEvents(trackEvents, start, end).map ({t, note, velocity}) ->
      delta = t - patternTime

      handle(currentTime + delta, channel, note, velocity)
  else
    events = upcomingEvents(trackEvents, start, secondsPerPattern).map ({t, note, velocity}) ->
      delta = t - patternTime

      handle(currentTime + delta, channel, note, velocity)

    events = upcomingEvents(trackEvents, 0, end).map ({t, note, velocity}) ->
      delta = t - patternTime + secondsPerPattern

      handle(currentTime + delta, channel, note, velocity)

  cursor = end

viz = Viz(analyser)
updateViz = ->
  viz.draw(canvas)
  scheduleUpcomingEvents()

  time = context.currentTime

  [0...patternLength].forEach (p, i) ->
    p = p / patternLength

    alpha = (i % 4 is 0) * 0.125 + 0.25
    canvas.drawRect
      x: p * canvas.width()
      y: 0
      width: 2
      height: canvas.height()
      color: "rgba(222, 238, 214, #{alpha})"

  patternPosition = canvas.width() * (time % secondsPerPattern) / secondsPerPattern
  canvas.drawRect
    x: patternPosition
    y: 0
    width: 2
    height: canvas.height()
    color: "rgba(222, 238, 214, 0.75)"

  noteHeight = canvas.height() / 128

  # Draw events
  trackEvents.forEach ({t, note}) ->
    canvas.drawRect
      x: canvas.width() * t / secondsPerPattern # TODO: Convert to beats
      y: noteHeight * note
      width: 40
      height: noteHeight
      color: "blue"

  requestAnimationFrame updateViz
requestAnimationFrame updateViz

ajax "https://whimsy.space/danielx/data/bEKepHacjexwXm92b2GU_BTj2EYjaClrAaB2jWaescU",
  responseType: "arraybuffer"
.progress ({loaded, total}) ->
  console.log loaded / total
.then (buffer) ->
  synth = Synth buffer

  console.log synth
  destination = masterGain

  channelId = 0
  state =
    channels: [0..15].map ->
      fx:
        panpot: 0 # [-1, 1]
        pitchBend: 8192 # [0, 16383]
        pitchBendSensitivity: 1
        volume: 1 # [0, 1]
      program: 0

  nextProgram = (channel) ->
    state.channels[channel].program += 1

  previousProgram = (channel) ->
    state.channels[channel].program -= 1

  noteOn = (time, channel, note, velocity) ->
    synth.noteOn time, channel, note, velocity, state, destination

  noteOff = (time, channel, note, velocity) ->
    synth.noteOff time, channel, note

  prevNotes = []
  canvas.on 'touch', (p) ->
    {x, y, identifier} = p
    console.log "T", p
    time = context.currentTime
    range = 108 - 21
    note = Math.floor(x * range) + 21

    prevNotes[identifier] = note
    velocity = 64

    synth.noteOn(time, channelId, note, velocity, state, destination)
  canvas.on 'release', (p) ->
    {identifier} = p
    console.log "R", p
    time = context.currentTime
    note = prevNotes[identifier]

    synth.noteOff(time, channelId, note)

  Stream = require "../lib/stream"
  {readEvent} = require "../lib/midifile"

  require("../midi_access") ({data}) ->
    event = readEvent Stream(data), true

    console.log event

    {subtype, noteNumber:note, channel, velocity} = event
    channel = 9

    time = context.currentTime
    switch subtype
      when "noteOn"
        synth.noteOn(time, channel, note, velocity, state, destination)
      when "noteOff"
        synth.noteOff(time, channel, note)

  mapping = """
    AWSEDFTGYHUJKOLP
  """

  recording = false
  toggleRecording = ->
    recording = !recording

  do ->
    getNote = (code) ->
      n = mapping.indexOf code.substr(-1)
      if n >= 0
        n + 60

    isDown = {}

    channel = 9
    document.addEventListener "keydown", (e) ->
      code = e.code
      note = getNote code
      time = context.currentTime

      if note
        unless isDown[code]
          isDown[code] = note

          velocity = 100
          addNote(time, note, velocity)
          synth.noteOn(time, channel, note, velocity, state, destination)
      else
        switch code
          when "BracketLeft"
            previousProgram(channel)
          when "BracketRight"
            nextProgram(channel)
          when "Space"
            toggleRecording()

    document.addEventListener "keyup", (e) ->
      code = e.code
      time = context.currentTime
      note = isDown[code]

      if note
        delete isDown[code]
        addNote(time, note, 0)
        synth.noteOff(time, channel, note)
