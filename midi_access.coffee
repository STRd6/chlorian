module.exports = (handler) ->
  navigator.requestMIDIAccess()
  .then (midiAccess) ->
    midiAccess.inputs.forEach (midi) ->
      console.log midi

      midi.onmidimessage = (args...) ->
        handler?(args...)
