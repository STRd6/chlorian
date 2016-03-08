toyPianoSample = "https://addressable.s3.amazonaws.com/composer/data/b4e7f603e5d18bfd3c97b080fbfab8a57afa9fb6"

Ajax = require "./lib/ajax"

module.exports = ->
  Ajax.getBuffer(toyPianoSample + "?xdomain")
