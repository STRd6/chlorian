{defaults, Observable} = Model = require "model"

module.exports = (I={}, self=Model(I)) ->
  defaults I,
    length: 8
    root: 36 # midi note
    pattern: [0]
    rate: 2 # beat^-1
    velocity: 100

  self.attrObservable "length", "rate", "pattern", "root", "velocity"

  self.extend
    eventsWithin: (start=0, end=self.length()) ->
      self.events().filter ({t}) ->
        start <= t < end # beats

    events: ->
      pattern = self.pattern()
      root = self.root()
      rate = self.rate()
      n = self.length() * self.rate()
      velocity = self.velocity()

      [0...n].map (i) ->
        t = i / rate
        index = i % pattern.length
        delta = pattern[index]

        note: root + delta
        t: t
        velocity: velocity
      .concat [0...n].map (i) ->
        t = i / rate + 0.0625
        index = i % pattern.length
        delta = pattern[index]

        note: root + delta
        t: t
        velocity: 0
      .filter ({note, t, velocity}) ->
        note? and t? and velocity?
      .sort (a, b) ->
        a.t - b.t

  self.events = Observable self.events

  return self
