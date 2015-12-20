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

findStuckNotes = (events) ->
  checkingNotes = {}
  t = 0

  events.forEach (event, i) ->
    {deltaTime, noteNumber, subtype, velocity} = event

    t += deltaTime

    if subtype is "noteOn"
      if checkingNotes[noteNumber]
        console.log "Double on!"
      else
        checkingNotes[noteNumber] = [event, i, t]

    if subtype is "noteOff"
      [oldEvent, oldIndex, oldT] = checkingNotes[noteNumber]
      duration = t - oldT
      
      console.log duration

      if duration < 1000
      else
        console.log checkingNotes[noteNumber]

      checkingNotes[noteNumber] = false

  console.log checkingNotes

module.exports = (midiFile) ->
  microsecondsPerSecond = 1000000
  tracks = midiFile.tracks

  # findStuckNotes(tracks[2])

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
  advanceTrackData = (trackData, inplace=true) ->
    nextEventIndex = trackData.nextEventIndex + 1
    nextEvent = tracks[trackData.id][nextEventIndex]

    if inplace
      trackData.nextEventIndex = nextEventIndex
      trackData.ticksUntilNextEvent = nextEvent?.deltaTime

      return trackData
    else
      id: trackData.id
      length: trackData.length
      nextEventIndex: nextEventIndex
      ticksUntilNextEvent: nextEvent?.deltaTime

  advanceTrackTicks = (trackData, ticks, inplace=true) ->
    ticksUntilNextEvent = trackData.ticksUntilNextEvent

    if ticksUntilNextEvent?
      ticksUntilNextEvent -= ticks
      assert ticksUntilNextEvent >= 0

    if inplace
      trackData.ticksUntilNextEvent = ticksUntilNextEvent
    else
      id: trackData.id
      length: trackData.length
      nextEventIndex: trackData.nextEventIndex
      ticksUntilNextEvent: ticksUntilNextEvent

  # Read next event and update state
  readEvent = (playerData, inplace=true) ->
    # Get earliest next event
    trackData = playerData.trackData
    eventTrackIndex = playerData.nextEventTrackIndex
    eventTrack = trackData[eventTrackIndex]
    return [undefined, playerData] unless eventTrack

    nextEvent = tracks[eventTrack.id][eventTrack.nextEventIndex]
    return [undefined, playerData] unless nextEvent

    ticksUntilNextEvent = eventTrack.ticksUntilNextEvent
    ticksPerBeat = playerData.ticksPerBeat
    microsecondsPerBeat = playerData.microsecondsPerBeat

    # Update ticksUntil and time
    currentTick = playerData.currentTick + ticksUntilNextEvent
    timeAdvance = (ticksUntilNextEvent / ticksPerBeat) * (microsecondsPerBeat / microsecondsPerSecond)
    time = playerData.time + timeAdvance
    assert !isNaN(time)

    # Advance other track pointers
    if inplace
      trackData.forEach (data, index) ->
        if index is eventTrackIndex
          advanceTrackData(data, true)
        else
          advanceTrackTicks(data, ticksUntilNextEvent, true)
    else
      newTrackData = trackData.map (data, index) ->
        if index is eventTrackIndex
          advanceTrackData(data, false)
        else
          advanceTrackTicks(data, ticksUntilNextEvent, false)

    # Find next event track
    nextEventTrackIndex = findNextEventTrackIndex(newTrackData)

    if inplace
      playerData.currentTick = currentTick
      playerData.time = time
      playerData.nextEventTrackIndex = nextEventTrackIndex

      return [nextEvent, playerData]
    else
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
