do ->
  styleNode = document.createElement("style")
  styleNode.innerHTML = require "./style"

  document.head.appendChild(styleNode)

TouchCanvas = require "touch-canvas"
Gainer = require "./gainer"
Osc = require "./noise"

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

notes = {}
playNote = (note, velocity, id) ->
  # TODO: Why do these notes cut out suddenly and for no reason?
  console.log "play!"
  freq = noteToFreq(note - 12)

  osco = context.createOscillator()
  osco.type = "square"
  osco.frequency.value = freq

  osco = Gainer(osco)
  osco.gain.linearRampToValueAtTime(velocity / 128, context.currentTime)
  osco.connect(masterGain)

  osco.start(context.currentTime)

  notes[id] = [osco, osco.gain]

releaseNote = (id) ->
  console.log "release!"
  [osco, gain] = notes[id]
  # Wow this is nutz!
  # Need to set the value to the current value because the
  # linearRampToValueAtTime uses the previous time to create the ramp, yolo!
  gain.setValueAtTime(osco.gain.value, context.currentTime)
  gain.linearRampToValueAtTime(0.0, context.currentTime + 0.125)
  delete notes[id]

  setTimeout ->
    console.log "disconnect"
    osco.disconnect()
  , 1000

do ->
  # Midi loading
  MidiFile = require "./lib/midifile"

  Ajax = require "./lib/ajax"
  Ajax.getBuffer("https://s3.amazonaws.com/whimsyspace-databucket-1g3p6d9lcl6x1/danielx/data/qxIFNrVVEqhwmwUO5wWyZKk1IwGgQIxqvLQ9WX0X20E")
  .then (buffer) ->
    array = new Uint8Array(buffer)
    midifile = MidiFile(array)

    console.log buffer, midifile
