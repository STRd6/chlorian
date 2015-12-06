module.exports = (context, type) ->
  osc = context.createOscillator()
  osc.type = type
  osc.start()

  return osc
