module.exports = [0..127].map (n) ->
  semitonesFromA4 = n - 69

  Math.pow(2, semitonesFromA4/12) * 440
