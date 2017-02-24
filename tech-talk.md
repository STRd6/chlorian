MIDI Chlorian
=============

Deconstructing the world's best online MIDI player.

WTF is MIDIs?
-------------

MIDI (/ˈmɪdi/; short for Musical Instrument Digital Interface) is a technical standard that 
describes a protocol, digital interface and connectors and allows a wide variety 
of electronic musical instruments, computers and other related devices to connect 
and communicate with one another. A single MIDI link can carry up to sixteen 
channels of information, each of which can be routed to a separate device.

- [MIDI Specification](http://oktopus.hu/uploaded/Tudastar/MIDI%201.0%20Detailed%20Specification.pdf)
- [MIDI Message Summary](https://www.midi.org/specifications/item/table-1-summary-of-midi-message)

WTF is Sound Fonts?
-------------------

MIDI files do not contain any sounds, only instructions to play them. Sound Fonts
contain information about how instruments sound and how those sounds evolve over time.

Sound Fonts encode all the data required to produce a sound including pitch, intonation,
expressiveness, timbre, and more.

You can imagine MIDI like being sheet music and a Sound Font like being an orchestra,
or storehouse of musical instruments.

If you put them both together in software you can play music!

- [Sound Font Technical Specification](http://freepats.zenvoid.org/sf2/sfspec24.pdf)

Web Audio API
-------------

In the browsers we have a few ways to play sounds. We can use the `<audio>` tag,
and programatically call things like `.play()` and `.pause()`. This is fine, but
it is very limited if we want to be able to play a wide range of sounds, we'd
need a separate sample for every note. Effects like pitch bends, reverb, panning,
etc. would be impossible.

Enter the [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API).
The Web Audio API provides ways to creat the digital audio workstation of your dreams.
You can use waveform generators to create sounds, read sound data from buffers,
schedule sounds to play with high precision and low latency, connect audio nodes
to a vast array of effect nodes including volume, reverb, panning, and more.

We finally can play MIDIs the way they were meant to be played.

Putting it all Together
-----------------------

Read binary SoundFont data

Read binary MIDI data

Load both into the player

The player is composed of a `track controller` and a `synthesizer`. 

As the track controller reads the track events from the MIDI it updates its 
internal state and sends instructions to the synthesizer to control the sounds.

The synthesizer uses the loaded Sound Font data to control the browser's audio
context through the web audio api.

Because computers aren't magical and JS timing isn't 100% certain, we need to 
buffer the upcoming 0.25s - 2s of upcoming sounds so that we experience a smooth
playback experience.

We have an interval running as fast as the browser allows that checks to make sure
we're filling the upcoming buffer enough that we don't run out and stutter.


