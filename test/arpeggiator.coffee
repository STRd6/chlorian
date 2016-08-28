Arpeggiator = require "../arpeggiator"

describe "Arpeggiator", ->
  it "should arpeggiate notes", ->
    arpeggiator = Arpeggiator
      pattern: [0]
      rate: 1
      length: 8
      base: 36

    events = arpeggiator.events()
    console.log events
    assert.equal arpeggiator.eventsWithin().length, 16
