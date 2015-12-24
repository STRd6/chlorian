do ->
  styleNode = document.createElement("style")
  styleNode.innerHTML = require "./style"

  document.head.appendChild(styleNode)

Ajax = require "./lib/ajax"

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

updateViz = ->
  viz.draw(canvas)

  requestAnimationFrame updateViz

requestAnimationFrame updateViz

Stream = require "./lib/stream"
MidiFile = require "./lib/midifile"

require("./load-sound-font")().then ({noteOn, noteOff, programChange, pitchBend}) ->
  Player = ->
    pitchBend: pitchBend
    programChange: programChange
    playNote: (time, channel, note, velocity) ->
      noteOn time, channel, note, velocity, masterGain
    releaseNote: noteOff

  {handleEvent, currentState} = require("./load-n-play-midi")(context, Player)

  require("./midi_access")().handle ({data}) -> 
    event = MidiFile.readEvent Stream(data), true

    handleEvent event, currentState()
