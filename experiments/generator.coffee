
Ajax = require "ajax"
ajax = Ajax().ajax
Synth = require "/sf2_synth"

ajax "https://whimsy.space/danielx/data/bEKepHacjexwXm92b2GU_BTj2EYjaClrAaB2jWaescU",
  responseType: "arraybuffer"
.then (buffer) ->
  synth = Synth buffer

  console.log synth
