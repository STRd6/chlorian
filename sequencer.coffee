Model = require "model"

module.exports = (I={}, self=Model(I)) ->
  I.length ?= 4
  I.notes ?= [
    [0, 60]
    [1, 62]
    [2, 64]
    [3, 65]
  ]

  self.attrAccessor "notes"

  self.extend
    # Get all the notes time as if the pattern loops
    # and their time offset is how far in the future to trigger them
    notesAfter: (t) ->
      self.notes().map ([time, note]) ->
        p = (time - t) % I.length

        if p < 0
          p += I.length

        [p, note]
