leftPad = (str, n, c=" ") ->
  pad = c.repeat(n)

  "#{pad.substring(str.length)}#{str}"

timeFormat = (seconds) ->
  minutes = ((seconds / 60)|0).toString()
  seconds = ((seconds % 60)|0).toString()

  "#{leftPad(minutes, 2, "0")}:#{leftPad seconds, 2, "0"}"

localPosition = (e) ->
  {top, left} = (e.currentTarget or e.target).getBoundingClientRect()
  {pageX, pageY} = e

  x = pageX - left
  y = pageY - top

  {x, y}

module.exports = {timeFormat, localPosition}
