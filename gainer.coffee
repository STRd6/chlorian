
module.exports = (osc) ->
  gain = osc.context.createGain()
  gain.gain.value = 0
  osc.connect(gain)

  osc.gain = gain.gain
  osc.connect = (args...) ->
    gain.connect(args...)

  return osc
