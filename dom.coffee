module.exports = (consumeEvents, domState) ->
  document.addEventListener "visibilitychange", (e) ->
    if document.hidden
      domState.lookahead = 1.25

      consumeEvents()
    else
      domState.lookahead = 0.25

  setInterval ->
    consumeEvents()
  , 4
