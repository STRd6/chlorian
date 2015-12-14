module.exports = (context) ->
  node = context.createBufferSource()
  frameCount = context.sampleRate * 2
  buffer = context.createBuffer(1, frameCount, context.sampleRate)
  data = buffer.getChannelData(0)

  n = 0
  while n < frameCount
    data[n] = Math.random() * 2 - 1
    n += 1

  node.buffer = buffer
  node.loop = true
  node.start(0)

  node.frequency = node.playbackRate

  return node
