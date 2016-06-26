Ajax = require "ajax"
ajax = Ajax().ajax

MidiFile = require "../lib/midifile"
Reader = require "../midi_player"

describe "Reader", ->
  it "should read midi files", (done) ->
    ajax("https://whimsy.space/danielx/data/FFFIzGGXnhNPBw8MK8-y3Df9nDRxHfwP3upMeXAzg04", responseType: "arraybuffer")
    .then (buffer) ->
      reader = Reader(buffer)

      [0...100].forEach ->
        e = reader.readEvent(reader.initialState)
        console.log e

      done()
