do ->
  styleNode = document.createElement("style")
  styleNode.innerHTML = require "./style"

  document.head.appendChild(styleNode)

TouchCanvas = require "touch-canvas"
Gainer = require "./gainer"
Osc = require "./noise"

{width, height} = require "./pixie"

canvas = TouchCanvas
  width: width
  height: height

document.body.appendChild canvas.element()

handleResize =  ->
  canvas.width(window.innerWidth)
  canvas.height(window.innerHeight)

handleResize()
window.addEventListener "resize", handleResize, false

context = new AudioContext

Track = require "./track"
Viz = require "./lib/viz"

track = Track()

masterGain = context.createGain()
masterGain.gain.value = 0.5
masterGain.connect(context.destination)

analyser = context.createAnalyser()
analyser.smoothingTimeConstant = 0

masterGain.connect(analyser)

viz = Viz(analyser)

osc = Gainer Osc(context, 'square')
osc.connect(masterGain)
# osc.width.value = 0.5

lfo = context.createOscillator()
lfo.start()
lfo.type = "square"
lfo.frequency = 7
# lfo.connect osc.width

state =
  activeLine: 0
  moveNext: 0

updateViz = ->
  viz.draw(canvas)

  requestAnimationFrame updateViz

requestAnimationFrame updateViz

noteFrequencies = require "./note_frequencies"
noteToFreq = (note) ->
  noteFrequencies[note]

Track = ->
  notes = {}
  playNote = (note, velocity, time=context.currentTime) ->
    volume = velocity / 128

    if notes[note]
      # Technically this means another noteOn occured before a noteOff event :(
      [osco] = notes[note]
      osco.gain.setValueAtTime(volume, time)
      # console.error "Double noteOn"
    else
      freq = noteToFreq(note)
    
      osco = context.createOscillator()
      osco.type = "square"
      osco.frequency.value = freq
    
      osco = Gainer(osco)
      #osco.gain.linearRampToValueAtTime(volume, time)
      osco.gain.setValueAtTime(volume, time)
      osco.connect(masterGain)
  
      osco.start(time)
  
      notes[note] = [osco, osco.gain, volume]

  releaseNote = (note, time=context.currentTime) ->
    # Bail out on double releases
    unless notes[note]
      console.error "Double noteOff"
      return

    [osco, gain, volume] = notes[note]
    # Wow this is nutz!
    # Need to ramp to the current value because linearRampToValueAtTime
    # uses the previous ramp time to create the next ramp, yolo!

    # TODO: Is there any way to get linearRampToValueAtTime to be reliable?
    # gain.linearRampToValueAtTime(volume, time)
    # gain.linearRampToValueAtTime(0.0, time + 0.125)

    gain.setValueAtTime(0, time)
    
    # osco.stop(time + 0.25)
    # delete notes[id]

  return {
    playNote: playNote
    releaseNote: releaseNote
  }

do ->
  readFile = require "./lib/read_file"
  Drop = require "./lib/drop"

  Drop document, (e) ->
    file = e.dataTransfer.files[0]

    if file
      readFile(file, "readAsArrayBuffer")

  loadFile = (file) ->

  # Midi loading
  MidiFile = require "./lib/midifile"
  MidiPlayer = require "./midi_player"

  micrcosecondsPerBeat = 500000

  badApple = "http://whimsy.space/danielx/data/clOXhtZz4VcunDJZdCM8T5pjBPKQaLCYCzbDod39Vbg"
  waltz = "http://whimsy.space/danielx/data/qxIFNrVVEqhwmwUO5wWyZKk1IwGgQIxqvLQ9WX0X20E"
  # Bad Apple 36MB MIDI 

  Ajax = require "./lib/ajax"
  Ajax.getBuffer(badApple)
  .then (buffer) ->
    array = new Uint8Array(buffer)
    midiFile = MidiFile(array)
    console.log midiFile

    player = MidiPlayer(midiFile)

    {playNote, releaseNote} = Track()
    
    meta = {}

    handleEvent = (event, state) ->
      {time} = state
      {deltaTime, noteNumber, subtype, type, velocity} = event

      switch "#{type}:#{subtype}"
        when "channel:controller"
          ; # TODO
        when "channel:noteOn"
          playNote noteNumber, velocity, time + timeOffset
        when "channel:noteOff"
          releaseNote noteNumber, time + timeOffset
        when "channel:programChange"
          ; # TODO
        when "meta:copyrightNotice"
          if meta.copyrightNotice
            meta.copyrightNotice += "/n#{event.text}"
          else
            meta.copyrightNotice = event.text
        when "meta:keySignature"
          meta.keySignature = 
            scale: event.scale
            key: event.key
        when "meta:setTempo"
          state.microsecondsPerBeat = event.microsecondsPerBeat
        when "meta:text"
          if meta.text
            meta.text += "/n#{event.text}"
          else
            meta.text = event.text
        when "meta:timeSignature"
          meta.timeSignature =
            denominator: event.denominator
            metronome: event.metronome
            numerator: event.numerator
            thirtyseconds: event.thirtySeconds
        when "meta:trackName"
          # TODO: This needs to be per track
          meta.trackName = event.text 
        when "meta:unknown"
          ;
        else
          console.log "Unknown", event

      return state

    timeOffset = context.currentTime

    currentState = player.initialState

    consumeEventsUntilTime = (t) ->
      count = 0

      while currentState.time < t
        [event, nextState] = player.readEvent(currentState, true)
        break unless event
        currentState = handleEvent(event, nextState)
        count += 1

      return count

    setInterval ->
      consumed = consumeEventsUntilTime(context.currentTime - timeOffset + 0.025)
      # console.log "Consumed:", consumed
    , 15
