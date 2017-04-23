{defaults} = Model = require "model"

module.exports = (I={}, self=Model(I)) ->
  defaults I,
    length: 8
    events: []

  self.attrObservable "length", "events"

  self.extend
    eventsWithin: (start=0, end=self.length()) ->
      self.events().filter ({t}) ->
        start <= t < end # beats

    addEvent: (event) ->
      self.events().push(event)

  return self
