colors = [
  "#FF0000"
  "#00FF00"
  "#0000FF"
  "#FFFF00"
  "#00FFFF"
  "#FF00FF"
  # TODO: 16 colors
]

module.exports = (canvas, playerData, {events}) ->
  {currentTick, ticksPerBeat, microsecondsPerBeat} = playerData

  tick = 0
  lineHeight = 10
  microsecondsPerSecond = 1000000

  pixelsPerSecond = canvas.width()

  ticksPerSecond = (ticksPerBeat / microsecondsPerBeat) * microsecondsPerSecond
  pixelsPerTick = pixelsPerSecond / ticksPerSecond

  beginTick = currentTick

  events.forEach (event) ->
    {channel, deltaTime, noteNumber, type, subtype, velocity} = event

    tick += deltaTime
    if subtype is "noteOn"
      y = noteNumber * lineHeight - 400
      x = (tick - beginTick) * pixelsPerTick

      canvas.drawRect
        x: x
        y: y
        width: 100 # TODO: Calculate from next note off event
        height: lineHeight
        color: colors[channel]

    return

  canvas.drawRect
    x: (currentTick - beginTick) * pixelsPerTick
    y: 0
    width: 5
    height: canvas.height()
    color: "green"

  [
    beginTick
    (currentTick - beginTick) * pixelsPerTick
    ticksPerBeat
    pixelsPerTick
  ].forEach (text, i) ->
    canvas.drawText
      x: 50
      y: 20 * (i + 2)
      text: text
      color: "white"
      font: "bold 16px monospace"

  canvas.drawText
