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

viz = Viz(analyser)
updateViz = ->
  viz.draw(canvas)

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

  do ->
    getNote = (code) ->
      n = mapping.indexOf code.substr(-1)
      if n >= 0
        n + 60

    isDown = {}

    channel = 1
    document.addEventListener "keydown", (e) ->
      code = e.code
      note = getNote code
      time = context.currentTime

      if note
        unless isDown[code]
          isDown[code] = note
          synth.noteOn(time, channel, note, 100, state, destination)
      else
        switch code 
          when "BracketLeft"
            previousProgram(channel)
          when "BracketRight"
            nextProgram(channel)

    document.addEventListener "keyup", (e) ->
      code = e.code
      time = context.currentTime
      note = isDown[code]

      if note
        delete isDown[code]
        synth.noteOff(time, channel, note)
