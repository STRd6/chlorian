findNextEventTrackIndex = (trackData) ->
  min = Infinity
  index = undefined

  trackData.forEach ({ticksUntilNextEvent, i}) ->
    if ticksUntilNextEvent < min
      min = ticksUntilNextEvent
      index = i

  return index

module.exports = (midiFile) ->
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

    id: trackData.id
    length: trackData.length
    nextEventIndex: nextEventIndex
    ticksUntilNextEvent: nextEvent?.deltaTime

  advanceTrackTicks = (trackData, ticks) ->
    ticksUntilNextEvent = trackData.ticksUntilNextEvent - ticks
    assert ticksUntilNextEvent >= 0

    id: trackData.id
    length: trackData.length
    nextEventIndex: trackData.nextEventIndex
    ticksUntilNextEvent: ticksUntilNextEvent

  # Read next event and update state
  readEvent = (playerData) ->
    # Get earliest next event
    trackData = playerData.trackData
    eventTrackIndex = playerData.nextEventTrackIndex
    eventTrack = trackData[eventTrackIndex]
    return [undefined, playerData] unless eventTrack

    nextEvent = tracks[eventTrack.id][eventTrack.nextEventIndex]
    return [undefined, playerData] unless nextEvent

    ticksUntilNextEvent = eventTrack.ticksUntilNextEvent
    ticksPerBeat = playerData.ticksPerBeat

    # Update ticksUntil and time
    currentTick = playerData.currentTick + ticksUntilNextEvent
    timeAdvance = (ticksUntilNextEvent / ticksPerBeat) * (microsecondsPerBeat / microsecondsPerSecond)
    time = playerData.currentTime + timeAdvance

    # Advance other track pointers
    newTrackData = trackData.map (data, index) ->
      if index is eventTrackIndex
        advanceTrackData(data)
      else
        advanceTrackTicks(data, ticksUntilNextEvent)

    # Find next event track
    nextEventTrackIndex = findNextEventTrackIndex(newTrackData)

    newState =
      currentTick: currentTick
      microsecondsPerBeat: microsecondsPerBeat
      nextEventTrackIndex: nextEventTrackIndex
      ticksPerBeat: ticksPerBeat
      time: time
      trackData: newTrackData

    return [nextEvent, newState]

  initialState: playerData
  readEvent: readEvent
