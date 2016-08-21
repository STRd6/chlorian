do ->
  styleNode = document.createElement("style")
  styleNode.innerHTML = require "/style"

  document.head.appendChild(styleNode)
  document.body.classList.add "no-select"

TouchCanvas = require "touch-canvas"
Ajax = require "ajax"
ajax = Ajax().ajax
Synth = require "/sf2_synth"

{assert} = require("../util")

ControlsTemplate = require "../templates/controls"
Controls = require "../presenters/controls"

context = new AudioContext

{width, height} = require "/pixie"
canvas = TouchCanvas
  width: width
  height: height

document.body.appendChild canvas.element()
canvas.fill('blue')

controls = Controls
  patternLength:
    min: 1
    max: 32
    value: 8
    step: 1
    type: "numeric"

  bpm:
    min: 1
    max: 999
    step: 1
    value: 120
    type: "numeric"

document.body.appendChild ControlsTemplate controls

Viz = require "../lib/viz"

analyser = context.createAnalyser()
analyser.smoothingTimeConstant = 0

masterGain = context.createGain()
masterGain.connect(context.destination)
masterGain.connect(analyser)

arp = [0, 4, 7, 12, 16, 19]

trackEvents = [0...16].map (n) ->
  i = Math.floor n / 2
  a = i % arp.length

  t: n/2 # beats
  note: 36 + arp[a]
  velocity: ((n % 2) - 1) * -100

quantize = (t, snap=0.25) ->
  n = Math.round t / snap

  return n * snap

addNote = (t, note, velocity) ->
  t = (t % secondsPerPattern()) / secondsPerBeat() # beats

  t = quantize(t)

  assert 0 <= t < patternLength()

  trackEvents.push {t, note, velocity}


{bpm, patternLength} = controls
secondsPerBeat = ->
  60 / bpm()
secondsPerPattern = ->
  secondsPerBeat() * patternLength()

upcomingEvents = (events, start, end) ->
  events.filter ({t}) ->
    start <= t < end # beats

cursor = 0 # beats
trackBeat = 0 # beats
lastTime = context.currentTime
noteOn = ->
noteOff = ->
scheduleUpcomingEvents = ->
  lookahead = 0.05 # seconds
  lookaheadBeats = lookahead / secondsPerBeat()
  currentTime = context.currentTime
  deltaTime = currentTime - lastTime
  lastTime = currentTime

  # Accumulate track time, wrapping around pattern
  trackBeat = (trackBeat + deltaTime / secondsPerBeat()) % patternLength() # beats
  patternBeat = trackBeat
  channel = 0

  start = cursor # beats
  end = (trackBeat + lookaheadBeats) % patternLength() # beats

  handle = (time, channel, note, velocity) ->
    if velocity > 0
      noteOn(time, channel, note, velocity)
    else
      noteOff(time, channel, note)

  if start <= end
    events = upcomingEvents(trackEvents, start, end).map ({t, note, velocity}) ->
      delta = (t - patternBeat) * secondsPerBeat()

      handle(currentTime + delta, channel, note, velocity)
  else
    events = upcomingEvents(trackEvents, start, secondsPerPattern()).map ({t, note, velocity}) ->
      delta = (t - patternBeat) * secondsPerBeat()

      handle(currentTime + delta, channel, note, velocity)

    events = upcomingEvents(trackEvents, 0, end).map ({t, note, velocity}) ->
      delta = (t - patternBeat + patternLength()) * secondsPerBeat()

      handle(currentTime + delta, channel, note, velocity)

  cursor = end

viz = Viz(analyser)
gamut =
  min: 32
  max: 96

drawEvents = (canvas, trackEvents) ->
  gamutWidth = gamut.max - gamut.min
  noteHeight = canvas.height() / gamutWidth
  width = canvas.width()
  length = patternLength()

  noteTimings = trackEvents.reduce (hash, {t, note, velocity}) ->
    hash[note] ?= []
    hash[note].push [t, velocity]

    return hash
  , {}

  Object.keys(noteTimings).forEach (note) ->
    start = null
    noteTimings[note].forEach ([t, velocity]) ->
      # TODO: Handle wrap around
      if velocity
        start = t
      else
        canvas.drawRect
          x: width * start / length
          y: noteHeight * (gamut.max - note)
          width: width * (t - start) / length
          height: noteHeight
          color: "blue"

updateViz = ->
  viz.draw(canvas)
  scheduleUpcomingEvents()

  length = patternLength()

  # Draw measure lines
  [0...length].forEach (p, i) ->
    p = p / length

    alpha = (i % 4 is 0) * 0.125 + 0.25
    canvas.drawRect
      x: p * canvas.width()
      y: 0
      width: 2
      height: canvas.height()
      color: "rgba(222, 238, 214, #{alpha})"

  patternPosition = canvas.width() * trackBeat / patternLength()
  canvas.drawRect
    x: patternPosition
    y: 0
    width: 2
    height: canvas.height()
    color: "rgba(222, 238, 214, 0.75)"

  drawEvents(canvas, trackEvents)

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
          when "Enter"
            consoleWindow "https://danielx.net/coffee-console/",
              patternLength: controls.patternLength
              bpm: controls.bpm


    document.addEventListener "keyup", (e) ->
      code = e.code
      time = context.currentTime
      note = isDown[code]

      if note
        delete isDown[code]
        addNote(time, note, 0)
        synth.noteOff(time, channel, note)

Postmaster = require "postmaster"

consoleWindow = (url, handlers, options={}) ->
  {name, width, height} = options
  width ?= 800
  height ?= 600

  childWindow = window.open url, name, "width=#{width},height=#{height}"

  postmaster = Postmaster(handlers)
  postmaster.remoteTarget = -> childWindow

  # Return a proxy for easy Postmastering
  proxy = new Proxy postmaster,
    get: (target, property, receiver) ->
      target[property] or
      (args...) ->
        target.invokeRemote property, args...

  return proxy
