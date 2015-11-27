do ->
  styleNode = document.createElement("style")
  styleNode.innerHTML = require "./style"

  document.head.appendChild(styleNode)

TouchCanvas = require "touch-canvas"

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

osc = context.createOscillator()
osc.type = "triangle"
gain = context.createGain()
gain.gain.value = 0
osc.connect(gain)
gain.connect(masterGain)
osc.start()

t = 0
dt = 1/60

state =
  activeLine: 0

updateViz = ->
  viz.draw(canvas)

  trackTime = (t / 4) % 1
  track.draw(canvas, trackTime, state)

  requestAnimationFrame updateViz

update = ->
  t += 1/60

  trackTime = (t / 4) % 1
  
  invariants()

  # TODO: This should be done in terms of context.currentTime
  track.update(osc.frequency, gain.gain, trackTime, dt, state)

invariants = ->
  state.activeLine = state.activeLine % 16
  if state.activeLine < 0
    state.activeLine += 16

setInterval update, 1000/60

requestAnimationFrame updateViz

document.addEventListener "keydown", (e) ->
  keyCode = e.keyCode

  switch
    when keyCode is 8
      state.toSet = 255
    when keyCode is 38
      state.activeLine -= 1
    when keyCode is 40
      state.activeLine += 1
    when 48 <= keyCode <= 57
      state.toSet = keyCode - 48 + 4 * 12
, false

document.addEventListener "mousedown", (e) ->
  y = Math.floor e.pageY / 20

  state.activeLine = y
, false
