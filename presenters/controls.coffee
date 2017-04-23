ControlTemplate = require "../templates/control"
Control = require "../control"

module.exports = (controlData) ->

  self =
    controlElements: ->
      controls.map ControlTemplate

  controls = Object.keys(controlData).map (name) ->
    data = controlData[name]
    control = Control data

    # Bind control value observable for easy access
    self[name] = control.value

    return control

  return self
