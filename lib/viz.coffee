module.exports = (analyser) ->
  bins = analyser.frequencyBinCount
  frequencyDomain = new Uint8Array(bins)
  timeDomain = new Uint8Array(bins)

  draw: (canvas) ->
    analyser.getByteFrequencyData(frequencyDomain)
    analyser.getByteTimeDomainData(timeDomain)

    canvas.clear()

    width = canvas.width()
    height = canvas.height()
    ctx = canvas.context()
    ratio = height / 256
    step = width / bins

    ctx.fillStyle = "#00F"

    ctx.beginPath()
    ctx.moveTo(0, height)

    # Draw waveforms or frequency spectrum
    Array::forEach.call frequencyDomain, (value, index) ->
      x = index * step
      y = ratio * (256 - value)

      ctx.lineTo x, y

    ctx.lineTo(width, height)
    ctx.fill()

    ctx.lineWidth = 2
    ctx.strokeStyle = "#F00"

    Array::forEach.call timeDomain, (value, index) ->
      x = index * step
      y = ratio * (256 - value)

      if index is 0
        ctx.beginPath()
        ctx.moveTo x, y
      else
        ctx.lineTo x, y

    ctx.stroke()
