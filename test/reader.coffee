Ajax = require "ajax"
ajax = Ajax().ajax

MidiReader = require "../midi_reader"

describe "Reader", ->
  it "should read midi files", (done) ->
    ajax("https://whimsy.space/danielx/data/FFFIzGGXnhNPBw8MK8-y3Df9nDRxHfwP3upMeXAzg04", responseType: "arraybuffer")
    .then (buffer) ->
      reader = MidiReader(buffer)

      [0...100].forEach ->
        e = reader.readEvent(reader.initialState)
        console.log e

      done()
