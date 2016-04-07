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
      playNote: (time, channel, note, velocity) ->
        noteOn time + timeOffset, channel, note, velocity, masterGain
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
      do ->
        previousState = player.currentState()

        adapter = Adapter()
        player = Player(buffer, adapter)
        player.currentState previousState # Swap in the state from the old player
        # playing = true

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

consumeEvents = ->
  # Get events from the player
  t = context.currentTime - timeOffset
  player.consumeEventsUntilTime(t + LOOKAHEAD)

  # consumeSequencer()

sequencerState = null
consumeSequencer = ->
  return unless sequencer and player
  
  now = context.currentTime

  if !sequencerState
    console.log "START", now
    sequencerState =
      time: 0
      offset: now

  t = sequencerState.time
  offset = sequencerState.offset

  timeSlice = (now - offset) - t

  if timeSlice > 0
    sequencerState.time += timeSlice

    sequencer.notesAfter(t).filter ([time]) ->
      time < timeSlice
    .forEach ([time, note]) ->
      console.log now + time, note

      noteOnEvent =
        channel: 0
        type: "channel"
        subtype: "noteOn"
        noteNumber: note
        velocity: 64

      noteOffEvent =
        channel: 0
        type: "channel"
        subtype: "noteOff"
        noteNumber: note

      player.handleEvent noteOnEvent, time: now + time
      player.handleEvent noteOffEvent, time: now + time + 0.25

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

-> #TODO Offline rendering
  offlineContext = new OfflineAudioContext(2, 44100*40, 44100)

  Recorder = require "./lib/recorder"
  console.log Recorder

  {saveAs} = require "./lib/filesaver"

  # TODO: Render midi to an offline context
  # Pass offline channel data to web worker from recorder.js
  # Download wav

sequencer = null

do ->
  Sequencer = require "./sequencer"

  sequencer = Sequencer()

  console.log sequencer.notesAfter(0)
  console.log sequencer.notesAfter(0.5)
