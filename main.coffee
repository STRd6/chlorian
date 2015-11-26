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

updateViz = ->
  viz.draw(canvas)

  trackTime = (t / 4) % 1
  track.draw(canvas, trackTime)

  requestAnimationFrame updateViz

update = ->
  t += 1/60

  trackTime = (t / 4) % 1

  # TODO: This should be done in terms of context.currentTime
  track.update(osc, gain.gain, trackTime, dt)

setInterval update, 1000/60

requestAnimationFrame updateViz
