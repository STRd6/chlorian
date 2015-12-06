pulseCurve = new Float32Array(256)

[0...256].forEach (i) ->
  if i < 128
    pulseCurve[i] = -1
  else
    pulseCurve[i] = 1

constantOneCurve = new Float32Array(2)
constantOneCurve[0] = 1
constantOneCurve[1] = 1

module.exports = (context) ->
	# Use a normal oscillator as the basis of our new oscillator.
	node = context.createOscillator()
	node.type = "sawtooth"
	node.start()

	#Shape the output into a pulse wave.
	pulseShaper=context.createWaveShaper()
	pulseShaper.curve=pulseCurve
	node.connect(pulseShaper)

	#Use a Node as our new "width" audio parameter.
	widthGain=context.createGain()
	widthGain.gain.value = 0.0 #Default width.
	node.width=widthGain.gain #Add parameter to oscillator node.
	widthGain.connect(pulseShaper)

	#Pass a constant value of 1 into the widthGain – so the "width" setting is
	#duplicated to its output.
	constantOneShaper = context.createWaveShaper()
	constantOneShaper.curve = constantOneCurve
	node.connect(constantOneShaper)
	constantOneShaper.connect(widthGain)

	#Override the oscillator's "connect" method so that the new node's output
	#actually comes from the pulseShaper.
	node.connect = ->
		pulseShaper.connect.apply(pulseShaper, arguments)

	#Override the oscillator's "disconnect" method.
	node.disconnect = ->
		pulseShaper.disconnect.apply(pulseShaper, arguments)

	return node
