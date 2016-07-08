do ->
  styleNode = document.createElement("style")
  styleNode.innerHTML = require "./style"

  document.head.appendChild(styleNode)
  document.body.classList.add "no-select"

Ajax = require "ajax"
ajax = Ajax().ajax
Observable = require "observable"

{timeFormat, localPosition} = require "./util"

TouchCanvas = require "touch-canvas"

canvas = TouchCanvas
  width: 200
  height: 50

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
reinit = null

domPlayer =
  time: Observable ""
  title: Observable "Yoko Takahashi - A Cruel Angel's Thesis"
  canvas: canvas.element()
  volume: Observable 80
  songSelect:
    class: "song"
    options: songChoices
    value: selectedSong
  fontSelect:
    class: "font"
    options: fontChoices
    value: selectedFont
  play: ->
    timeOffset = context.currentTime - player.currentState().time
    playing = true
  stop: ->
    timeOffset = context.currentTime
    adapter.allNotesOff()
    player.reset()
    playing = false
  pause: ->
    timeOffset = context.currentTime - player.currentState().time
    adapter.allNotesOff()
    playing = !playing
  next: ->
    currentSong = selectedSong()
    index = songChoices.indexOf(currentSong) + 1
    if index >= songChoices.length
      index = 0
    selectedSong songChoices[index]
  prev: ->
    currentSong = selectedSong()
    index = songChoices.indexOf(currentSong) - 1
    if index >= songChoices.length
      index = 0
    selectedSong songChoices[index]

  seek:
    click: (e) ->
      {x, y} = localPosition e

      if player
        adapter.allNotesOff()
        player.seekToPercentage x
        timeOffset = context.currentTime - player.currentState().time

    value: Observable 0

Template = require "./templates/main"
template = Template domPlayer

document.body.appendChild template

doResize = ->
  el = canvas.element()
  {width, height} = el.parentElement.getBoundingClientRect()

  canvas.width width
  canvas.height height

window.addEventListener "resize", doResize
doResize()

context = new AudioContext

Viz = require "./lib/viz"

masterGain = context.createGain()
masterGain.connect(context.destination)

updateVolume = (newVolume) ->
  masterGain.gain.value = newVolume / 100

domPlayer.volume.observe updateVolume
updateVolume(80)

analyser = context.createAnalyser()
analyser.smoothingTimeConstant = 0

masterGain.connect(analyser)

viz = Viz(analyser)

updateViz = ->
  if player
    duration = player.duration()

    if playing
      t = context.currentTime - timeOffset
      domPlayer.time timeFormat(t)
      domPlayer.seek.value t / duration

      if t >= duration
        domPlayer.next()
    else
      t = player.currentState().time
      domPlayer.time timeFormat(t)
      domPlayer.seek.value t / duration

  viz.draw(canvas)

  requestAnimationFrame updateViz

requestAnimationFrame updateViz

Player = require("./track_controller")

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

      allNotesOff: ->
        allNotesOff(0)
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

    adapter.allNotesOff()

    player = Player(buffer)
    playing = true

    reinit = (Adapter) ->
      # doStop()
      adapter.allNotesOff()
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

handler = (event, state) ->
  {type, subtype, channel, deltaTime, noteNumber, subtype, type, velocity} = event
  {playNote, releaseNote, pitchBend} = adapter
  {time, channels} = state

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
          {fx} = channels[channel]
          fx.pitchBend = event.value

          pitchBend time, channel, fx

consumeEvents = ->
  return unless player and playing

  {lookahead} = domState
  # Get events from the player
  t = context.currentTime - timeOffset
  player.consumeEventsUntilTime(t + lookahead, handler)

# How far ahead in seconds to pull events from the midi tracks
# NOTE: Needs to be >1s for setInteval to populate enough to run in a background tab
# We want it to be really short so that play/pause responsiveness feels quick
# We want it to be long enough to cover up irregularities with setInterval

domState =
  lookahead: 0.25

require("./dom")(consumeEvents, domState)
