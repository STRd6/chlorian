Model = require "model"

{defaults} = require "./util"

module.exports = (I={}, self=Model(I)) ->
  defaults I,
    max: 1
    min: 0
    step: 0.01
    type: "number"
    value: 0.5

  self.attrObservable Object.keys(I)...

  return self
