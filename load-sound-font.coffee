Ajax = require "./lib/ajax"

"bEKepHacjexwXm92b2GU_BTj2EYjaClrAaB2jWaescU" # CT4MGM
"VQHGLBy82AW4ZppTgItJm1IpquIF-042W3Ix3u7PQeQ" # Yamaha XG
loadSoundFont = ->
  SF2Parser = require "./lib/sf2_parser"
  console.log SF2Parser
  soundFontURL = "http://whimsy.space/danielx/data/bEKepHacjexwXm92b2GU_BTj2EYjaClrAaB2jWaescU"

  Ajax.getBuffer(soundFontURL)
  .then (buffer) ->
    parser = new SF2Parser.Parser(new Uint8Array(buffer))
    parser.parse()

    console.log parser

    global.parser = parser

loadSoundFont()
