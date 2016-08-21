Pattern = require "../pattern"

describe "Pattern", ->
  it "should give upcoming notes", ->
    pattern = Pattern
      length: 8
      events: [0...16].map (n) ->
        t: n/2 # beats
        note: 36
        velocity: ((n % 2) - 1) * -100

    assert.equal pattern.eventsWithin().length, 16
    assert.equal pattern.eventsWithin(0, 2).length, 4
    assert.equal pattern.eventsWithin(2, 4).length, 4
    assert.equal pattern.eventsWithin(4, 8).length, 8
