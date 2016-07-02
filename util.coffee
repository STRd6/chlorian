leftPad = (str, n, c=" ") ->
  pad = c.repeat(n)

  "#{pad.substring(str.length)}#{str}"

timeFormat = (seconds) ->
  minutes = ((seconds / 60)|0).toString()
  seconds = ((seconds % 60)|0).toString()

  "#{leftPad(minutes, 2, "0")}:#{leftPad seconds, 2, "0"}"

localPosition = (e) ->
  {top, left, width, height} = (e.currentTarget or e.target).getBoundingClientRect()
  {pageX, pageY} = e

  x = (pageX - left) / width
  y = (pageY - top) / height

  {x, y}

module.exports = {timeFormat, localPosition}
