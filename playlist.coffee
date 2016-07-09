Observable = require "observable"
Model = require "model"

module.exports = (I={}, self=Model(I)) ->
  self.attrModels "songs", Song

  self.extend
    selectedIndex: Observable 0
    selectedSong: ->
      selectedIndex = self.selectedIndex()
      songs = self.songs()

      songs[selectedIndex] or songs[0]
    next: ->
      index = self.selectedIndex() + 1
      if index >= self.songs().length
        index = 0

      self.selectedIndex index

    prev: ->
      index = self.selectedIndex() + 1
      if index >= self.songs().length
        index = 0

      self.selectedIndex index

Song = (I={}, self=Model(I)) ->
  self.attrObservable "title", "url"

  return self
