Ajax = require "./lib/ajax"

loadSoundFont = ->
  SF2Parser = require "./lib/sf2_parser"
  console.log SF2Parser
  soundFontURL = "http://whimsy.space/danielx/data/nzn8U706GmnxPLSGg4lE7e01iztuivvWwcLDNnWyA0s"

  Ajax.getBuffer(soundFontURL)
  .then (buffer) ->
    parser = new SF2Parser.Parser(new Uint8Array(buffer))
    data = parser.parse()

    console.log parser, data

loadSoundFont()

