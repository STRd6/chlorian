do ->
  styleNode = document.createElement("style")
  styleNode.innerHTML = require "./style"

  document.head.appendChild(styleNode)

Ajax = require "ajax"
ajax = Ajax().ajax
Observable = require "observable"

TouchCanvas = require "touch-canvas"

{width, height} = require "./pixie"

canvas = TouchCanvas
  width: width
  height: height

songs = require "./song_list"
songChoices = Object.keys(songs)
selectedSong = Observable songChoices[0]

player = null
timeOffset = 0
doReplay = ->

Template = require "./templates/main"
template = Template
  canvas: canvas.element()
  songSelect:
    class: "song"
    options: songChoices
    value: selectedSong
  fontSelect:
    class: "font"
    options: ["-"]
    value: "-"
  replay: ->
    if player
      doReplay()

document.body.appendChild template

handleResize =  ->
  canvas.width(window.innerWidth)
  canvas.height(window.innerHeight)

handleResize()
window.addEventListener "resize", handleResize, false

context = new AudioContext

Viz = require "./lib/viz"

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

Player = require("./load-n-play-midi")

mgm1 = "https://s3.amazonaws.com/whimsyspace-databucket-1g3p6d9lcl6x1/danielx/data/3mPhpFf7ZNEfu_yRZKm-R0xWJd62hB98jv_sqik7voQ" # 1mgm1
ct4mgm = "https://whimsy.space/danielx/data/bEKepHacjexwXm92b2GU_BTj2EYjaClrAaB2jWaescU" # CT4MGM
yamaha = "https://whimsy.space/danielx/data/VQHGLBy82AW4ZppTgItJm1IpquIF-042W3Ix3u7PQeQ" # Yamaha XG
roland = "https://whimsy.space/danielx/data/2KPRQpAqB3Ghy1bgmuCcYklbUF0mCXs0zSXF6Gn967M"
# generalUser = "https://s3.amazonaws.com/whimsyspace-databucket-1g3p6d9lcl6x1/danielx/data/AHJSlkhvZSukK9vyCYJUdiyoAjk1PQS1WidFT8jtuKg" # 30+MB

SFSynth = require("./load-sound-font")

ajax(ct4mgm, responseType: "arraybuffer")
.then SFSynth
.then ({allNotesOff, noteOn, noteOff, programChange, pitchBend}) ->
  Adapter = ->
    adjustTime = (fn) ->
      (time, rest...) ->
        fn(time + timeOffset, rest...)

    allNotesOff: adjustTime allNotesOff
    pitchBend: adjustTime pitchBend
    programChange: adjustTime programChange
    playNote: (time, channel, note, velocity) ->
      noteOn time + timeOffset, channel, note, velocity, masterGain
    releaseNote: adjustTime noteOff

  selectedSong.observe (value) ->
    ajax(songs[value], responseType: "arraybuffer")
    .then init

  # How far ahead in seconds to pull events from the midi tracks
  # NOTE: Needs to be >1s for setInteval to populate enough to run in a background tab
  # We want it to be really short so that play/pause responsiveness feels quick
  # We want it to be long enough to cover up irregularities with setTimeout
  LOOKAHEAD = 0.25

  init = (buffer) ->
    timeOffset = context.currentTime
    adapter = Adapter()
    allNotesOff 0

    player = Player(buffer, adapter)

  document.addEventListener "visibilitychange", (e) ->
    if document.hidden
      LOOKAHEAD = 1.25

      if player
        t = context.currentTime - timeOffset
        player.consumeEventsUntilTime(t + LOOKAHEAD)
    else
      LOOKAHEAD = 0.25

  doReplay = ->
    timeOffset = context.currentTime
    allNotesOff 0
    player.reset()

  setInterval ->
    if player
      t = context.currentTime - timeOffset
      player.consumeEventsUntilTime(t + LOOKAHEAD)
  , 4

  ajax(songs[selectedSong()], responseType: "arraybuffer")
  .then init

  readFile = require "./lib/read_file"
  Drop = require "./lib/drop"

  Drop document, (e) ->
    file = e.dataTransfer.files[0]

    if file
      readFile(file, "readAsArrayBuffer")
      .then init

-> # TODO Midi input devices
  require("./midi_access")().handle ({data}) ->
    event = MidiFile.readEvent Stream(data), true

    player.handleEvent event,
      time: context.currentTime, timeOffset: 0

-> #TODO Offline rendering
  offlineContext = new OfflineAudioContext(2, 44100*40, 44100)

  Recorder = require "./lib/recorder"
  console.log Recorder

  {saveAs} = require "./lib/filesaver"

  # TODO: Render midi to an offline context
  # Pass offline channel data to web worker from recorder.js
  # Download wav
