
ajax = require("ajax")()
Synth = require "/sf2_synth"

ajax.ajax "https://whimsy.space/danielx/data/bEKepHacjexwXm92b2GU_BTj2EYjaClrAaB2jWaescU",
  responseType: "arrayBuffer"
.then (buffer) ->
  console.log buffer
  synth = Synth buffer

  console.log synth
