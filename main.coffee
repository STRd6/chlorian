do ->
  styleNode = document.createElement("style")
  styleNode.innerHTML = require "./style"

  document.head.appendChild(styleNode)

Ajax = require "./lib/ajax"
Observable = require "observable"

TouchCanvas = require "touch-canvas"
Gainer = require "./gainer"
Osc = require "./noise"

{width, height} = require "./pixie"

canvas = TouchCanvas
  width: width
  height: height

selectedSong = Observable "-"
selectedSong.observe (value) ->
  console.log value

Template = require "./templates/main"
template = Template
  canvas: canvas.element()
  songSelect:
    options: ["-", "Jordan"]
    value: selectedSong

document.body.appendChild template

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
masterGain.gain.value = 1
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

offlineContext = new OfflineAudioContext(2, 44100*40, 44100)

Recorder = require "./lib/recorder"
console.log Recorder

{saveAs} = require "./lib/filesaver"

# TODO: Render midi to an offline context
# Pass offline channel data to web worker from recorder.js
# Download wav

require("./load-sound-font")().then ({allNotesOff, noteOn, noteOff, programChange, pitchBend}) ->
  PlayerAdapter = ->
    allNotesOff: allNotesOff
    pitchBend: pitchBend
    programChange: programChange
    playNote: (time, channel, note, velocity) ->
      noteOn time, channel, note, velocity, masterGain
    releaseNote: noteOff

  player = require("./load-n-play-midi")(context, PlayerAdapter)
  player.play()

  require("./midi_access")().handle ({data}) ->
    event = MidiFile.readEvent Stream(data), true

    player.handleEvent event,
      time: context.currentTime, timeOffset: 0
