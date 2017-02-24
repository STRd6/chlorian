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
- [SF2 Parser](https://github.com/colinbdclark/sf2-parser)
- [SF2 Synth](https://github.com/gree/sf2synth.js)

What the crap is Web Audio?
---------------------------

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

To read the binary Sound Font data we use a JS SoundFont parser created by GREE
and extended by Colin Clark. The role of the parser is to provide a JS interface
to all that sweet sweet instrument data that is trappend inside ones and zeros.

There's another half to the SoundFont reading, now that we have it in JS we still
need to turn it into sounds. For this I used SF2 Synth which maps the JS interface
into a network of WebAudio nodes in response to note events. This is what plays
the sounds that we'll hear.

Likewise we read the MIDI data into JS so that we can connect it up and have it 
control the synthesizer.

The player is composed of a `track controller` and a `synthesizer`. The track 
controller reads track events from the MIDI. It updates its  internal state 
and sends instructions to the synthesizer to control the sound output.

Because computers aren't magical and JS timing isn't 100% certain, we need to 
buffer the upcoming 0.25s - 2s of upcoming sounds so that we experience a smooth
playback experience.

We have an interval running as fast as the browser allows that checks to make sure
we're filling the upcoming buffer enough that we don't run out and stutter. Each 
update we pull off events from the MIDI until we've filled out our upcoming sound
buffer.

The end result is sweet, beautiful music!
