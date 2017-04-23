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

assert = (condition) ->
  throw new Error "Ya blew it" unless condition

defaults = (target, objects...) ->
  for object in objects
    for name of object
      unless target.hasOwnProperty(name)
        target[name] = object[name]

  return target

module.exports = {assert, defaults, timeFormat, localPosition}
