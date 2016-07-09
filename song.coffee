Model = require "model"

module.exports = (I={}, self=Model(I)) ->
  self.attrObservable "title", "url"

  return self
