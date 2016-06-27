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

fonts = require "./font_list"
fontChoices = Object.keys(fonts)
selectedFont = Observable fontChoices[0]

adapter = null
player = null
playing = false
timeOffset = 0
doReplay = ->
doStop = ->
reinit = null

Template = require "./templates/main"
template = Template
  canvas: canvas.element()
  songSelect:
    class: "song"
    options: songChoices
    value: selectedSong
  fontSelect:
    class: "font"
    options: fontChoices
    value: selectedFont
  replay: ->
    if player
      doReplay()
  stop: ->
    if player
      doStop()

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


SFSynth = require("./sf2_synth")

OpenPromise = ->
  res =null
  rej = null

  p = new Promise (resolve, reject) ->
    res = resolve
    rej = reject

  p.resolve = res
  p.reject = rej
  return p

adapterPromise = OpenPromise()

loadFont = (url) ->
  adapterPromise = OpenPromise()

  ajax(url, responseType: "arraybuffer")
  .then SFSynth
  .then ({allNotesOff, noteOn, noteOff, programChange, pitchBend}) ->
    Adapter = ->
      adjustTime = (fn) ->
        (time, rest...) ->
          fn(time + timeOffset, rest...)

      allNotesOff: adjustTime allNotesOff
      pitchBend: adjustTime pitchBend
      programChange: adjustTime programChange
      playNote: (time, channel, note, velocity, state) ->
        noteOn time + timeOffset, channel, note, velocity, state, masterGain
      releaseNote: adjustTime noteOff

    adapterPromise.resolve Adapter

    reinit?(Adapter)

# TODO: Observe soundfont change, reinit at same position
selectedFont.observe (name) ->
  loadFont fonts[name]

loadFont(fonts[selectedFont()])

selectedSong.observe (value) ->
  ajax(songs[value], responseType: "arraybuffer")
  .then (buffer) ->
    doStop?()
    init(buffer)

init = (buffer) ->
  adapterPromise.then (Adapter) ->
    timeOffset = context.currentTime
    adapter = Adapter()

    adapter.allNotesOff 0

    player = Player(buffer, adapter)
    playing = true

    doReplay = ->
      timeOffset = context.currentTime
      adapter.allNotesOff 0
      player.reset()
      playing = true

    doStop = ->
      # This works as play/pause
      timeOffset = context.currentTime - player.currentState().time
      adapter.allNotesOff 0
      playing = !playing

    reinit = (Adapter) ->
      # doStop()
      adapter.allNotesOff 0
      adapter = Adapter()

# Load the first song
ajax(songs[selectedSong()], responseType: "arraybuffer")
.then init

# Load any dropped MIDI
readFile = require "./lib/read_file"
Drop = require "./lib/drop"

Drop document, (e) ->
  file = e.dataTransfer.files[0]

  if file
    readFile(file, "readAsArrayBuffer")
    .then init

# How far ahead in seconds to pull events from the midi tracks
# NOTE: Needs to be >1s for setInteval to populate enough to run in a background tab
# We want it to be really short so that play/pause responsiveness feels quick
# We want it to be long enough to cover up irregularities with setInterval
LOOKAHEAD = 0.25

handler = (event, state) ->
  {type, subtype, channel, deltaTime, noteNumber, subtype, type, velocity} = event
  {playNote, releaseNote, pitchBend} = adapter
  {time} = state

  switch type
    when "channel"
      switch subtype
        when "controller"
          ; # TODO
        when "noteOn"
          playNote time, channel, noteNumber, velocity, state
        when "noteOff"
          releaseNote time, channel, noteNumber, state
        when "pitchBend"
          pitchBend time, channel, event.value, state

consumeEvents = ->
  # Get events from the player
  t = context.currentTime - timeOffset
  player.consumeEventsUntilTime(t + LOOKAHEAD, handler)

document.addEventListener "visibilitychange", (e) ->
  if document.hidden
    LOOKAHEAD = 1.25

    if player and playing
      consumeEvents()
  else
    LOOKAHEAD = 0.25

setInterval ->
  if player and playing
    consumeEvents()
, 4

require("./midi_access")().handle ({data}) ->
  event = MidiFile.readEvent Stream(data), true

  player?.handleEvent event, time: context.currentTime - timeOffset

