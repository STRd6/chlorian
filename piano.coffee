TouchCanvas = require "touch-canvas"


module.exports = ->
  range = 24

  onNotes = []
  ids = []

  canvas = TouchCanvas()

  canvas.on "touch", (p) ->
    note = Math.floor p.x * range

    self.playNote(note, p.identifier)

  canvas.on "release", (p) ->
    self.releaseNote(p.identifier)

  self =
    releaseNote: (identifier) ->
      onNotes[ids[identifier]] = false

    playNote: (note, identifier) ->
      onNotes[note] = true
      ids[identifier] = note

    element: ->
      canvas.element()

    draw: ->
      n = range

      canvas.clear()
      width = canvas.width() / n
      height = canvas.height()

      [0...n].forEach (n) ->
        hue = (n % 12) * 360 / 12
        saturation = "75%"
        lightness = "50%"

        if onNotes[n]
          lightness = "75%"

        canvas.drawRect
          x: width * n
          y: 0
          width: width
          height: height
          color: "hsl(#{hue}, #{saturation}, #{lightness})"
