# Reads events out of a MIDI file

MidiFile = require "./lib/midifile"

assert = (condition, message="Ya' blew it!") ->
  throw new Error message unless condition

findNextEventTrackIndex = (trackData) ->
  min = Infinity
  index = undefined

  trackData.forEach ({ticksUntilNextEvent}, i) ->
    if ticksUntilNextEvent < min
      min = ticksUntilNextEvent
      index = i

  return index

module.exports = (buffer) ->
  midiFile = MidiFile(new Uint8Array(buffer))

  microsecondsPerSecond = 1000000
  tracks = midiFile.tracks

  # Keep data for each track and overall player
  playerData =
    currentTick: 0 # ticks
    microsecondsPerBeat: 500000 # us/beat
    nextEventTrackIndex: null
    ticksPerBeat: midiFile.header.ticksPerBeat # ticks/beat
    time: 0 # seconds
    trackData: tracks.map (track, i) ->
      nextEvent = track[0]
      ticksUntilNextEvent = nextEvent?.deltaTime

      id: i
      length: track.length
      nextEventIndex: 0
      ticksUntilNextEvent: ticksUntilNextEvent

  playerData.nextEventTrackIndex = findNextEventTrackIndex(playerData.trackData)

  # When we consume an event from a track we need to update the track data
  advanceTrackData = (trackData) ->
    nextEventIndex = trackData.nextEventIndex + 1
    nextEvent = tracks[trackData.id][nextEventIndex]

    trackData.nextEventIndex = nextEventIndex
    trackData.ticksUntilNextEvent = nextEvent?.deltaTime

    return trackData

  advanceTrackTicks = (trackData, ticks) ->
    ticksUntilNextEvent = trackData.ticksUntilNextEvent

    if ticksUntilNextEvent?
      ticksUntilNextEvent -= ticks
      assert ticksUntilNextEvent >= 0

    trackData.ticksUntilNextEvent = ticksUntilNextEvent

    return

  # Read next event and update state in place.
  # Returns the next event
  # Returns undefined if no further events
  readEvent = (playerData) ->
    # Get earliest next event
    trackData = playerData.trackData
    eventTrackIndex = playerData.nextEventTrackIndex
    eventTrack = trackData[eventTrackIndex]
    return unless eventTrack

    nextEvent = tracks[eventTrack.id][eventTrack.nextEventIndex]
    return unless nextEvent

    nextEvent.track = eventTrack.id

    ticksUntilNextEvent = eventTrack.ticksUntilNextEvent
    ticksPerBeat = playerData.ticksPerBeat
    microsecondsPerBeat = playerData.microsecondsPerBeat

    # Update ticksUntil and time
    currentTick = playerData.currentTick + ticksUntilNextEvent
    timeAdvance = (ticksUntilNextEvent / ticksPerBeat) * (microsecondsPerBeat / microsecondsPerSecond)
    time = playerData.time + timeAdvance
    assert !isNaN(time)

    # Advance other track pointers
    trackData.forEach (data, index) ->
      if index is eventTrackIndex
        advanceTrackData(data)
      else
        advanceTrackTicks(data, ticksUntilNextEvent)
    nextEventTrackIndex = findNextEventTrackIndex(trackData)

    playerData.currentTick = currentTick
    playerData.time = time
    playerData.nextEventTrackIndex = nextEventTrackIndex

    return nextEvent

  initialState: playerData
  readEvent: readEvent
