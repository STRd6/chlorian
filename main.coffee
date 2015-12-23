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

noteFrequencies = require "./note_frequencies"
noteToFreq = (note) ->
  noteFrequencies[note]

toAudioBuffer = (buffer, sampleRate) ->
  audioBuffer = context.createBuffer 1, buffer.length, sampleRate

  audioData = audioBuffer.getChannelData(0)
  buffer.forEach (n, i) ->
    audioData[i] = n / 32768

  return audioBuffer

global.playRaw = (buffer, sampleRate=44100) ->
  playBuffer context, toAudioBuffer(buffer, sampleRate)

playBuffer = (context, buffer, volume=0.5, rate=1, time=context.currentTime) ->
  source = Gainer context.createBufferSource()
  source.buffer = buffer
  source.playbackRate.value = rate
  source.gain.setValueAtTime(volume, time)
  source.start(time)
  source.connect(masterGain)

global.playBuffer = playBuffer

BufferPlayer = ->
  playNote: (note, velocity, time) ->
    if global.sample
      volume = velocity / 128
      rate = Math.pow 2, (note - 60) / 12

      playBuffer(context, global.sample, volume, rate)

  releaseNote: ->

Track = ->
  notes = {}
  playNote = (note, velocity, time=context.currentTime) ->
    volume = velocity / 128

    if notes[note]
      # Technically this means another noteOn occured before a noteOff event :(
      [osco] = notes[note]
      osco.gain.setValueAtTime(volume, time)
      # console.error "Double noteOn"
    else
      freq = noteToFreq(note)

      osco = context.createOscillator()
      osco.type = "square"
      osco.frequency.value = freq

      osco = Gainer(osco)
      #osco.gain.linearRampToValueAtTime(volume, time)
      osco.gain.setValueAtTime(volume, time)
      osco.connect(masterGain)

      osco.start(time)

      notes[note] = [osco, osco.gain, volume]

  releaseNote = (note, time=context.currentTime) ->
    # Bail out on double releases
    unless notes[note]
      console.error "Double noteOff"
      return

    [osco, gain, volume] = notes[note]
    # Wow this is nutz!
    # Need to ramp to the current value because linearRampToValueAtTime
    # uses the previous ramp time to create the next ramp, yolo!

    # TODO: Is there any way to get linearRampToValueAtTime to be reliable?
    # gain.linearRampToValueAtTime(volume, time)
    # gain.linearRampToValueAtTime(0.0, time + 0.125)

    gain.setValueAtTime(0, time)

    # osco.stop(time + 0.25)
    # delete notes[id]

  return {
    playNote: playNote
    releaseNote: releaseNote
  }

# require("./load-n-play-midi")(context, Track)

require("./load-sound-font")
