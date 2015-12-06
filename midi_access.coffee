module.exports = ->
  handler = null

  navigator.requestMIDIAccess()
  .then (midiAccess) ->
    midiAccess.inputs.forEach (midi) ->
      console.log midi

      midi.onmidimessage = (args...) ->
        handler?(args...)

  handle: (fn) ->
    handler = fn
