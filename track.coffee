noteFrequencies = require "./note_frequencies"
noteNames = ["C","C#0","D","D#0","E","F","F#0","G","G#0","A","A#0","B","C","C#1","D","D#1","E","F","F#1","G","G#1","A","A#1","B","C","C#2","D","D#2","E","F","F#2","G","G#2","A","A#2","B","C","C#3","D","D#3","E","F","F#3","G","G#3","A","A#3","B","C","C#4","D","D#4","E","F","F#4","G","G#4","A","A#4","B","C","C#5","D","D#5","E","F","F#5","G","G#5","A","A#5","B","C","C#6","D","D#6","E","F","F#6","G","G#6","A","A#6","B","C","C#7","D","D#7","E","F","F#7","G","G#7","A","A#7","B","C","C#8","D","D#8","E","F","F#8","G","G#8","A","A#8","B"]
.map (name, i) ->
  n = Math.floor(i / 12)

  if name.endsWith(n)
    name
  else
    "#{name}#{n}"

module.exports = ->
  lineHeight = 20
  width = 60

  data = [32...48]
  size = data.length

  data = data.map (d, i) ->
    if i % 2 is 1
      255
    else
      Math.floor(Math.random() * 64) + 12

  # t <= 0 < 1
  self =
  draw: (canvas, t, state) ->
    {activeLine} = state
    canvas.font "bold 20px monospace"

    data.forEach (datum, line) ->
      textColor = "#008800"
      isActive = line is activeLine

      s = line
      f = line + 1
      if s <= t * size < f
        highlight = "#00FF00"

      if isActive
        highlight = "#0000FF"
        textColor = "#FFFFFF"

      if highlight
        canvas.drawRect
          x: 20
          y: line * lineHeight + 2
          width: width
          height: lineHeight
          color: highlight

      if datum is 255
        text = "□"
      else if datum?
        text = noteNames[datum]
      else
        text = "..."

      canvas.drawText
        x: 20
        y: 20 + line * lineHeight
        text: text
        color: textColor

  update: (frequency, vol, t, dt, state) ->
    # TODO: Should be setting freq and volume values at exact times in the
    # future by using context.currentTime

    if "toSet" of state
      self.set(state.activeLine, state.toSet)
      delete state.toSet

    i = Math.floor(t * size)
    noteNumber = data[i]

    if noteNumber is 255
      vol.value = 0
    else if noteNumber?
      freq = noteFrequencies[noteNumber]

      if frequency
        frequency.value = freq#.setValueAtTime(freq, )
      vol.value = 1
    else

  set: (index, value) ->
    data[index] = value
