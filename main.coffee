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
    class: "song"
    options: ["-", "Jordan"]
    value: selectedSong
  fontSelect:
    class: "font"
    options: ["-"]
    value: "-"

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

Player = require("./load-n-play-midi")

require("./load-sound-font")().then ({allNotesOff, noteOn, noteOff, programChange, pitchBend}) ->
  adapter =
    allNotesOff: allNotesOff
    pitchBend: pitchBend
    programChange: programChange
    playNote: (time, channel, note, velocity) ->
      noteOn time, channel, note, velocity, masterGain
    releaseNote: noteOff

  # How far ahead in seconds to pull events from the midi tracks
  # NOTE: Needs to be >1s for setInteval to populate enough to run in a background tab
  # We want it to be really short so that play/pause responsiveness feels quick
  # We want it to be long enough to cover up irregularities with setTimeout
  LOOKAHEAD = 0.25

  player = null
  timeOffset = 0
  interval = null
  
  init = (buffer) ->
    adapter.allNotesOff 0

    timeOffset = context.currentTime
    player = Player(buffer, adapter)

    clearInterval interval
    interval = setInterval ->
      if player
        t = context.currentTime - timeOffset
        consumed = player.consumeEventsUntilTime(t + LOOKAHEAD)
    , 4

  # Bad Apple 36MB MIDI
  badApple = "https://whimsy.space/danielx/data/clOXhtZz4VcunDJZdCM8T5pjBPKQaLCYCzbDod39Vbg"
  waltz = "https://whimsy.space/danielx/data/qxIFNrVVEqhwmwUO5wWyZKk1IwGgQIxqvLQ9WX0X20E"
  jordan = "https://whimsy.space/danielx/data/FhSh0qeVTMu9Xwd4vihF6shaPJsD_rM8t1OSKGl-ir4"
  aquarius = "https://whimsy.space/danielx/data/ZZXoIXhXFbo0pWGn-m938Vgox_NmJiYkZ9g3UkR0PrU"
  slunk = "https://whimsy.space/danielx/data/EtME8Imvk8eE8MXc7jlwJOVotKM2KVmxXd8QiJtBbPc"
  mushroom = "https://whimsy.space/danielx/data/xfgFR67fDD_vXLic9IYXFPo55qP-kUpC4rl-H9hrwSA"

  Ajax.getBuffer(mushroom)
  .then init

  readFile = require "./lib/read_file"
  Drop = require "./lib/drop"

  Drop document, (e) ->
    file = e.dataTransfer.files[0]

    if file
      readFile(file, "readAsArrayBuffer")
      .then load

-> # TODO Midi input devices
  require("./midi_access")().handle ({data}) ->
    event = MidiFile.readEvent Stream(data), true

    player.handleEvent event,
      time: context.currentTime, timeOffset: 0
