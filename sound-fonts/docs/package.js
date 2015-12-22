(function(pkg) {
  (function() {
  var annotateSourceURL, cacheFor, circularGuard, defaultEntryPoint, fileSeparator, generateRequireFn, global, isPackage, loadModule, loadPackage, loadPath, normalizePath, rootModule, startsWith,
    __slice = [].slice;

  fileSeparator = '/';

  global = window;

  defaultEntryPoint = "main";

  circularGuard = {};

  rootModule = {
    path: ""
  };

  loadPath = function(parentModule, pkg, path) {
    var cache, localPath, module, normalizedPath;
    if (startsWith(path, '/')) {
      localPath = [];
    } else {
      localPath = parentModule.path.split(fileSeparator);
    }
    normalizedPath = normalizePath(path, localPath);
    cache = cacheFor(pkg);
    if (module = cache[normalizedPath]) {
      if (module === circularGuard) {
        throw "Circular dependency detected when requiring " + normalizedPath;
      }
    } else {
      cache[normalizedPath] = circularGuard;
      try {
        cache[normalizedPath] = module = loadModule(pkg, normalizedPath);
      } finally {
        if (cache[normalizedPath] === circularGuard) {
          delete cache[normalizedPath];
        }
      }
    }
    return module.exports;
  };

  normalizePath = function(path, base) {
    var piece, result;
    if (base == null) {
      base = [];
    }
    base = base.concat(path.split(fileSeparator));
    result = [];
    while (base.length) {
      switch (piece = base.shift()) {
        case "..":
          result.pop();
          break;
        case "":
        case ".":
          break;
        default:
          result.push(piece);
      }
    }
    return result.join(fileSeparator);
  };

  loadPackage = function(pkg) {
    var path;
    path = pkg.entryPoint || defaultEntryPoint;
    return loadPath(rootModule, pkg, path);
  };

  loadModule = function(pkg, path) {
    var args, context, dirname, file, module, program, values;
    if (!(file = pkg.distribution[path])) {
      throw "Could not find file at " + path + " in " + pkg.name;
    }
    program = annotateSourceURL(file.content, pkg, path);
    dirname = path.split(fileSeparator).slice(0, -1).join(fileSeparator);
    module = {
      path: dirname,
      exports: {}
    };
    context = {
      require: generateRequireFn(pkg, module),
      global: global,
      module: module,
      exports: module.exports,
      PACKAGE: pkg,
      __filename: path,
      __dirname: dirname
    };
    args = Object.keys(context);
    values = args.map(function(name) {
      return context[name];
    });
    Function.apply(null, __slice.call(args).concat([program])).apply(module, values);
    return module;
  };

  isPackage = function(path) {
    if (!(startsWith(path, fileSeparator) || startsWith(path, "." + fileSeparator) || startsWith(path, ".." + fileSeparator))) {
      return path.split(fileSeparator)[0];
    } else {
      return false;
    }
  };

  generateRequireFn = function(pkg, module) {
    if (module == null) {
      module = rootModule;
    }
    if (pkg.name == null) {
      pkg.name = "ROOT";
    }
    if (pkg.scopedName == null) {
      pkg.scopedName = "ROOT";
    }
    return function(path) {
      var otherPackage;
      if (isPackage(path)) {
        if (!(otherPackage = pkg.dependencies[path])) {
          throw "Package: " + path + " not found.";
        }
        if (otherPackage.name == null) {
          otherPackage.name = path;
        }
        if (otherPackage.scopedName == null) {
          otherPackage.scopedName = "" + pkg.scopedName + ":" + path;
        }
        return loadPackage(otherPackage);
      } else {
        return loadPath(module, pkg, path);
      }
    };
  };

  if (typeof exports !== "undefined" && exports !== null) {
    exports.generateFor = generateRequireFn;
  } else {
    global.Require = {
      generateFor: generateRequireFn
    };
  }

  startsWith = function(string, prefix) {
    return string.lastIndexOf(prefix, 0) === 0;
  };

  cacheFor = function(pkg) {
    if (pkg.cache) {
      return pkg.cache;
    }
    Object.defineProperty(pkg, "cache", {
      value: {}
    });
    return pkg.cache;
  };

  annotateSourceURL = function(program, pkg, path) {
    return "" + program + "\n//# sourceURL=" + pkg.scopedName + "/" + path;
  };

}).call(this);

//# sourceURL=main.coffee
  window.require = Require.generateFor(pkg);
})({
  "source": {
    "LICENSE": {
      "path": "LICENSE",
      "content": "The MIT License (MIT)\n\nCopyright (c) 2015 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n\n",
      "mode": "100644",
      "type": "blob"
    },
    "README.md": {
      "path": "README.md",
      "content": "# 2A03\nExperimenting with NES soundz\n",
      "mode": "100644",
      "type": "blob"
    },
    "gainer.coffee": {
      "path": "gainer.coffee",
      "content": "\nmodule.exports = (osc) ->\n  gain = osc.context.createGain()\n  gain.gain.value = 0\n  osc.connect(gain)\n\n  osc.gain = gain.gain\n  osc.connect = (args...) ->\n    gain.connect(args...)\n\n  return osc\n",
      "mode": "100644",
      "type": "blob"
    },
    "lib/ajax.coffee": {
      "path": "lib/ajax.coffee",
      "content": "readFile = require \"./read_file\"\n\nmodule.exports = Ajax =\n  getJSON: (path, options={}) ->\n    Ajax.getText(path, options)\n    .then JSON.parse\n\n  getText: (path, options={}) ->\n    Ajax.getBlob(path, options)\n    .then readFile\n\n  getBuffer: (path, options={}) ->\n    Ajax.getBlob(path, options)\n    .then (blob) ->\n      readFile(blob, \"readAsArrayBuffer\")\n\n  getBlob: (path, options={}) ->\n    new Promise (resolve, reject) ->\n\n      xhr = new XMLHttpRequest()\n      xhr.open('GET', path, true)\n      xhr.responseType = \"blob\"\n\n      headers = options.headers\n      if headers\n        Object.keys(headers).forEach (header) ->\n          value = headers[header]\n          xhr.setRequestHeader header, value\n\n      xhr.onload = (e) ->\n        if (200 <= this.status < 300) or this.status is 304\n          try\n            resolve this.response\n          catch error\n            reject error\n        else\n          reject e\n\n      xhr.onerror = reject\n      xhr.send()\n",
      "mode": "100644",
      "type": "blob"
    },
    "lib/drop.coffee": {
      "path": "lib/drop.coffee",
      "content": "module.exports = (element, handler) ->\n  cancel = (e) ->\n    e.preventDefault()\n    return false\n\n  element.addEventListener \"dragover\", cancel\n  element.addEventListener \"dragenter\", cancel\n  element.addEventListener \"drop\", (e) ->\n    e.preventDefault()\n    handler(e)\n    return false\n",
      "mode": "100644",
      "type": "blob"
    },
    "lib/midifile.js": {
      "path": "lib/midifile.js",
      "content": "var Stream = require('./stream')\n\n/*\nclass to parse the .mid file format\n(depends on stream.js)\n*/\nmodule.exports = function MidiFile (data) {\n  function readChunk (stream) {\n    var id = stream.read(4)\n    var length = stream.readInt32()\n    return {\n      'id': id,\n      'length': length,\n      'data': stream.subarray(length)\n    }\n  }\n\n  var lastEventTypeByte\n\n  function readEvent (stream) {\n    var event = {}\n    event.deltaTime = stream.readVarInt()\n    var eventTypeByte = stream.readInt8()\n    if ((eventTypeByte & 0xf0) == 0xf0) {\n      /* system / meta event */\n      if (eventTypeByte == 0xff) {\n        /* meta event */\n        event.type = 'meta'\n        var subtypeByte = stream.readInt8()\n        var length = stream.readVarInt()\n        switch (subtypeByte) {\n          case 0x00:\n            event.subtype = 'sequenceNumber'\n            if (length != 2) throw 'Expected length for sequenceNumber event is 2, got ' + length\n            event.number = stream.readInt16()\n            return event\n          case 0x01:\n            event.subtype = 'text'\n            event.text = stream.read(length)\n            return event\n          case 0x02:\n            event.subtype = 'copyrightNotice'\n            event.text = stream.read(length)\n            return event\n          case 0x03:\n            event.subtype = 'trackName'\n            event.text = stream.read(length)\n            return event\n          case 0x04:\n            event.subtype = 'instrumentName'\n            event.text = stream.read(length)\n            return event\n          case 0x05:\n            event.subtype = 'lyrics'\n            event.text = stream.read(length)\n            return event\n          case 0x06:\n            event.subtype = 'marker'\n            event.text = stream.read(length)\n            return event\n          case 0x07:\n            event.subtype = 'cuePoint'\n            event.text = stream.read(length)\n            return event\n          case 0x20:\n            event.subtype = 'midiChannelPrefix'\n            if (length != 1) throw 'Expected length for midiChannelPrefix event is 1, got ' + length\n            event.channel = stream.readInt8()\n            return event\n          case 0x2f:\n            event.subtype = 'endOfTrack'\n            if (length !== 0) throw 'Expected length for endOfTrack event is 0, got ' + length\n            return event\n          case 0x51:\n            event.subtype = 'setTempo'\n            if (length != 3) throw 'Expected length for setTempo event is 3, got ' + length\n            event.microsecondsPerBeat = (\n              (stream.readInt8() << 16)\n              + (stream.readInt8() << 8)\n              + stream.readInt8()\n            )\n            return event\n          case 0x54:\n            event.subtype = 'smpteOffset'\n            if (length != 5) throw 'Expected length for smpteOffset event is 5, got ' + length\n            var hourByte = stream.readInt8()\n            event.frameRate = {\n              0x00: 24, 0x20: 25, 0x40: 29, 0x60: 30\n            }[hourByte & 0x60]\n            event.hour = hourByte & 0x1f\n            event.min = stream.readInt8()\n            event.sec = stream.readInt8()\n            event.frame = stream.readInt8()\n            event.subframe = stream.readInt8()\n            return event\n          case 0x58:\n            event.subtype = 'timeSignature'\n            if (length != 4) throw 'Expected length for timeSignature event is 4, got ' + length\n            event.numerator = stream.readInt8()\n            event.denominator = Math.pow(2, stream.readInt8())\n            event.metronome = stream.readInt8()\n            event.thirtyseconds = stream.readInt8()\n            return event\n          case 0x59:\n            event.subtype = 'keySignature'\n            if (length != 2) throw 'Expected length for keySignature event is 2, got ' + length\n            event.key = stream.readInt8(true)\n            event.scale = stream.readInt8()\n            return event\n          case 0x7f:\n            event.subtype = 'sequencerSpecific'\n            event.data = stream.subarray(length)\n            return event\n          default:\n            // console.log(\"Unrecognised meta event subtype: \" + subtypeByte)\n            event.subtype = 'unknown'\n            event.data = stream.subarray(length)\n            return event\n        }\n        event.data = stream.subarray(length)\n        return event\n      } else if (eventTypeByte == 0xf0) {\n        event.type = 'sysEx'\n        var length = stream.readVarInt()\n        event.data = stream.subarray(length)\n        return event\n      } else if (eventTypeByte == 0xf7) {\n        event.type = 'dividedSysEx'\n        var length = stream.readVarInt()\n        event.data = stream.subarray(length)\n        return event\n      } else {\n        throw 'Unrecognised MIDI event type byte: ' + eventTypeByte\n      }\n    } else {\n      /* channel event */\n      var param1\n      if ((eventTypeByte & 0x80) == 0) {\n        /* running status - reuse lastEventTypeByte as the event type.\n        \teventTypeByte is actually the first parameter\n        */\n        param1 = eventTypeByte\n        eventTypeByte = lastEventTypeByte\n      } else {\n        param1 = stream.readInt8()\n        lastEventTypeByte = eventTypeByte\n      }\n      var eventType = eventTypeByte >> 4\n      event.channel = eventTypeByte & 0x0f\n      event.type = 'channel'\n      switch (eventType) {\n        case 0x08:\n          event.subtype = 'noteOff'\n          event.noteNumber = param1\n          event.velocity = stream.readInt8()\n          return event\n        case 0x09:\n          event.noteNumber = param1\n          event.velocity = stream.readInt8()\n          if (event.velocity == 0) {\n            event.subtype = 'noteOff'\n          } else {\n            event.subtype = 'noteOn'\n          }\n          return event\n        case 0x0a:\n          event.subtype = 'noteAftertouch'\n          event.noteNumber = param1\n          event.amount = stream.readInt8()\n          return event\n        case 0x0b:\n          event.subtype = 'controller'\n          event.controllerType = param1\n          event.value = stream.readInt8()\n          return event\n        case 0x0c:\n          event.subtype = 'programChange'\n          event.programNumber = param1\n          return event\n        case 0x0d:\n          event.subtype = 'channelAftertouch'\n          event.amount = param1\n          return event\n        case 0x0e:\n          event.subtype = 'pitchBend'\n          event.value = param1 + (stream.readInt8() << 7)\n          return event\n        default:\n          throw 'Unrecognised MIDI event type: ' + eventType\n      /*\n      console.log(\"Unrecognised MIDI event type: \" + eventType)\n      stream.readInt8()\n      event.subtype = 'unknown'\n      return event\n      */\n      }\n    }\n  }\n\n  stream = Stream(data)\n  var headerChunk = readChunk(stream)\n  if (headerChunk.id != 'MThd' || headerChunk.length != 6) {\n    throw 'Bad .mid file - header not found'\n  }\n  var headerStream = Stream(headerChunk.data)\n  var formatType = headerStream.readInt16()\n  var trackCount = headerStream.readInt16()\n  var timeDivision = headerStream.readInt16()\n\n  if (timeDivision & 0x8000) {\n    throw 'Expressing time division in SMTPE frames is not supported yet'\n  } else {\n    ticksPerBeat = timeDivision\n  }\n\n  var header = {\n    'formatType': formatType,\n    'trackCount': trackCount,\n    'ticksPerBeat': ticksPerBeat\n  }\n  var tracks = []\n  for (var i = 0; i < header.trackCount; i++) {\n    tracks[i] = []\n    var trackChunk = readChunk(stream)\n    if (trackChunk.id != 'MTrk') {\n      throw 'Unexpected chunk - expected MTrk, got ' + trackChunk.id\n    }\n    var trackStream = Stream(trackChunk.data)\n    while (!trackStream.eof()) {\n      var event = readEvent(trackStream)\n      tracks[i].push(event)\n    // console.log(event)\n    }\n  }\n\n  return {\n    'header': header,\n    'tracks': tracks\n  }\n}\n",
      "mode": "100644",
      "type": "blob"
    },
    "lib/read_file.coffee": {
      "path": "lib/read_file.coffee",
      "content": "module.exports = (file, method=\"readAsText\") ->\n  return new Promise (resolve, reject) ->\n    reader = new FileReader()\n\n    reader.onloadend = ->\n      resolve(reader.result)\n    reader.onerror = reject\n    reader[method](file)\n",
      "mode": "100644",
      "type": "blob"
    },
    "lib/stream.js": {
      "path": "lib/stream.js",
      "content": "module.exports = function (array) {\n  var position = 0;\n\n  function read (length) {\n    var result = String.fromCharCode.apply(String, array.slice(position, position + length));\n    position += length;\n\n    return result;\n  }\n\n  function subarray (length) {\n    var result = array.subarray(position, position + length);\n    position += length;\n\n    return result;\n  }\n\n  /* read a big-endian 32-bit integer */\n  function readInt32 () {\n    var result = (\n        (array[position] << 24)\n      + (array[position + 1] << 16)\n      + (array[position + 2] << 8)\n      + array[position + 3]);\n    position += 4;\n\n    return result;\n  }\n\n  /* read a big-endian 16-bit integer */\n  function readInt16 () {\n    var result = (\n        (array[position] << 8)\n      + array[position + 1]);\n    position += 2;\n\n    return result;\n  }\n\n  /* read an 8-bit integer */\n  function readInt8 (signed) {\n    var result = array[position];\n    if (signed && result > 127) {\n      result -= 256;\n    }\n    position += 1;\n\n    return result;\n  }\n\n  function eof () {\n    return position >= array.length;\n  }\n\n  /* read a MIDI-style variable-length integer\n  \t(big-endian value in groups of 7 bits,\n  \twith top bit set to signify that another byte follows)\n  */\n  function readVarInt () {\n    var result = 0;\n    while (true) {\n      var b = readInt8();\n      if (b & 0x80) {\n        result += (b & 0x7f);\n        result <<= 7;\n      } else {\n        /* b is the last byte */\n        return result + b;\n      }\n    }\n  }\n\n  return {\n    'eof': eof,\n    'read': read,\n    'readInt32': readInt32,\n    'readInt16': readInt16,\n    'readInt8': readInt8,\n    'readVarInt': readVarInt,\n    'subarray' : subarray\n  };\n};\n",
      "mode": "100644",
      "type": "blob"
    },
    "lib/viz.coffee": {
      "path": "lib/viz.coffee",
      "content": "module.exports = (analyser) ->\n  bins = analyser.frequencyBinCount\n  frequencyDomain = new Uint8Array(bins)\n  timeDomain = new Uint8Array(bins)\n\n  draw: (canvas) ->\n    analyser.getByteFrequencyData(frequencyDomain)\n    analyser.getByteTimeDomainData(timeDomain)\n\n    canvas.fill \"black\"\n\n    width = canvas.width()\n    height = canvas.height()\n    ctx = canvas.context()\n    ratio = height / 256\n    step = width / bins\n\n    ctx.fillStyle = \"#00F\"\n\n    ctx.beginPath()\n    ctx.moveTo(0, height)\n\n    # Draw waveforms or frequency spectrum\n    Array::forEach.call frequencyDomain, (value, index) ->\n      x = index * step\n      y = ratio * (256 - value)\n\n      ctx.lineTo x, y\n\n    ctx.lineTo(width, height)\n    ctx.fill()\n\n    ctx.lineWidth = 2\n    ctx.strokeStyle = \"#F00\"\n\n    Array::forEach.call timeDomain, (value, index) ->\n      x = index * step\n      y = ratio * (256 - value)\n\n      if index is 0\n        ctx.beginPath()\n        ctx.moveTo x, y\n      else\n        ctx.lineTo x, y\n\n    ctx.stroke()\n",
      "mode": "100644",
      "type": "blob"
    },
    "main.coffee": {
      "path": "main.coffee",
      "content": "do ->\n  styleNode = document.createElement(\"style\")\n  styleNode.innerHTML = require \"./style\"\n\n  document.head.appendChild(styleNode)\n\nAjax = require \"./lib/ajax\"\n\nTouchCanvas = require \"touch-canvas\"\nGainer = require \"./gainer\"\nOsc = require \"./noise\"\n\n{width, height} = require \"./pixie\"\n\ncanvas = TouchCanvas\n  width: width\n  height: height\n\ndocument.body.appendChild canvas.element()\n\nhandleResize =  ->\n  canvas.width(window.innerWidth)\n  canvas.height(window.innerHeight)\n\nhandleResize()\nwindow.addEventListener \"resize\", handleResize, false\n\ncontext = new AudioContext\n\nTrack = require \"./track\"\nViz = require \"./lib/viz\"\n\ntrack = Track()\n\nmasterGain = context.createGain()\nmasterGain.gain.value = 0.5\nmasterGain.connect(context.destination)\n\nanalyser = context.createAnalyser()\nanalyser.smoothingTimeConstant = 0\n\nmasterGain.connect(analyser)\n\nviz = Viz(analyser)\n\nupdateViz = ->\n  viz.draw(canvas)\n\n  requestAnimationFrame updateViz\n\nrequestAnimationFrame updateViz\n\nnoteFrequencies = require \"./note_frequencies\"\nnoteToFreq = (note) ->\n  noteFrequencies[note]\n\nplayBuffer = (context, buffer, volume, rate=1, time=context.currentTime) ->\n  source = Gainer context.createBufferSource()\n  source.buffer = buffer\n  source.playbackRate.value = rate\n  source.gain.setValueAtTime(volume, time)\n  source.start(time)\n  source.connect(masterGain)\n\nBufferPlayer = ->\n  playNote: (note, velocity, time) ->\n    if global.sample\n      volume = velocity / 128\n      rate = Math.pow 2, (note - 60) / 12\n\n      playBuffer(context, global.sample, volume, rate)\n\n  releaseNote: ->\n\nTrack = ->\n  notes = {}\n  playNote = (note, velocity, time=context.currentTime) ->\n    volume = velocity / 128\n\n    if notes[note]\n      # Technically this means another noteOn occured before a noteOff event :(\n      [osco] = notes[note]\n      osco.gain.setValueAtTime(volume, time)\n      # console.error \"Double noteOn\"\n    else\n      freq = noteToFreq(note)\n\n      osco = context.createOscillator()\n      osco.type = \"square\"\n      osco.frequency.value = freq\n\n      osco = Gainer(osco)\n      #osco.gain.linearRampToValueAtTime(volume, time)\n      osco.gain.setValueAtTime(volume, time)\n      osco.connect(masterGain)\n\n      osco.start(time)\n\n      notes[note] = [osco, osco.gain, volume]\n\n  releaseNote = (note, time=context.currentTime) ->\n    # Bail out on double releases\n    unless notes[note]\n      console.error \"Double noteOff\"\n      return\n\n    [osco, gain, volume] = notes[note]\n    # Wow this is nutz!\n    # Need to ramp to the current value because linearRampToValueAtTime\n    # uses the previous ramp time to create the next ramp, yolo!\n\n    # TODO: Is there any way to get linearRampToValueAtTime to be reliable?\n    # gain.linearRampToValueAtTime(volume, time)\n    # gain.linearRampToValueAtTime(0.0, time + 0.125)\n\n    gain.setValueAtTime(0, time)\n\n    # osco.stop(time + 0.25)\n    # delete notes[id]\n\n  return {\n    playNote: playNote\n    releaseNote: releaseNote\n  }\n\n# require(\"./load-n-play-midi\")(context, BufferPlayer)\n\nrequire(\"./load-sound-font\")\n",
      "mode": "100644",
      "type": "blob"
    },
    "midi_access.coffee": {
      "path": "midi_access.coffee",
      "content": "module.exports = ->\n  handler = null\n\n  navigator.requestMIDIAccess()\n  .then (midiAccess) ->\n    midiAccess.inputs.forEach (midi) ->\n      console.log midi\n\n      midi.onmidimessage = (args...) ->\n        handler?(args...)\n\n  handle: (fn) ->\n    handler = fn\n",
      "mode": "100644",
      "type": "blob"
    },
    "midi_player.coffee": {
      "path": "midi_player.coffee",
      "content": "assert = (condition, message=\"Ya' blew it!\") ->\n  throw new Error message unless condition\n\nfindNextEventTrackIndex = (trackData) ->\n  min = Infinity\n  index = undefined\n\n  trackData.forEach ({ticksUntilNextEvent}, i) ->\n    if ticksUntilNextEvent < min\n      min = ticksUntilNextEvent\n      index = i\n\n  return index\n\nfindStuckNotes = (events) ->\n  checkingNotes = {}\n  t = 0\n\n  events.forEach (event, i) ->\n    {deltaTime, noteNumber, subtype, velocity} = event\n\n    t += deltaTime\n\n    if subtype is \"noteOn\"\n      if checkingNotes[noteNumber]\n        console.log \"Double on!\"\n      else\n        checkingNotes[noteNumber] = [event, i, t]\n\n    if subtype is \"noteOff\"\n      [oldEvent, oldIndex, oldT] = checkingNotes[noteNumber]\n      duration = t - oldT\n\n      console.log duration\n\n      if duration < 1000\n      else\n        console.log checkingNotes[noteNumber]\n\n      checkingNotes[noteNumber] = false\n\n  console.log checkingNotes\n\nmodule.exports = (midiFile) ->\n  microsecondsPerSecond = 1000000\n  tracks = midiFile.tracks\n\n  # findStuckNotes(tracks[2])\n\n  # Keep data for each track and overall player\n  playerData =\n    currentTick: 0 # ticks\n    microsecondsPerBeat: 500000 # us/beat\n    nextEventTrackIndex: null\n    ticksPerBeat: midiFile.header.ticksPerBeat # ticks/beat\n    time: 0 # seconds\n    trackData: tracks.map (track, i) ->\n      nextEvent = track[0]\n      ticksUntilNextEvent = nextEvent?.deltaTime\n\n      id: i\n      length: track.length\n      nextEventIndex: 0\n      ticksUntilNextEvent: ticksUntilNextEvent\n\n  playerData.nextEventTrackIndex = findNextEventTrackIndex(playerData.trackData)\n\n  # When we consume an event from a track we need to update the track data\n  advanceTrackData = (trackData, inplace=true) ->\n    nextEventIndex = trackData.nextEventIndex + 1\n    nextEvent = tracks[trackData.id][nextEventIndex]\n\n    if inplace\n      trackData.nextEventIndex = nextEventIndex\n      trackData.ticksUntilNextEvent = nextEvent?.deltaTime\n\n      return trackData\n    else\n      id: trackData.id\n      length: trackData.length\n      nextEventIndex: nextEventIndex\n      ticksUntilNextEvent: nextEvent?.deltaTime\n\n  advanceTrackTicks = (trackData, ticks, inplace=true) ->\n    ticksUntilNextEvent = trackData.ticksUntilNextEvent\n\n    if ticksUntilNextEvent?\n      ticksUntilNextEvent -= ticks\n      assert ticksUntilNextEvent >= 0\n\n    if inplace\n      trackData.ticksUntilNextEvent = ticksUntilNextEvent\n    else\n      id: trackData.id\n      length: trackData.length\n      nextEventIndex: trackData.nextEventIndex\n      ticksUntilNextEvent: ticksUntilNextEvent\n\n  # Read next event and update state\n  readEvent = (playerData, inplace=true) ->\n    # Get earliest next event\n    trackData = playerData.trackData\n    eventTrackIndex = playerData.nextEventTrackIndex\n    eventTrack = trackData[eventTrackIndex]\n    return [undefined, playerData] unless eventTrack\n\n    nextEvent = tracks[eventTrack.id][eventTrack.nextEventIndex]\n    return [undefined, playerData] unless nextEvent\n\n    ticksUntilNextEvent = eventTrack.ticksUntilNextEvent\n    ticksPerBeat = playerData.ticksPerBeat\n    microsecondsPerBeat = playerData.microsecondsPerBeat\n\n    # Update ticksUntil and time\n    currentTick = playerData.currentTick + ticksUntilNextEvent\n    timeAdvance = (ticksUntilNextEvent / ticksPerBeat) * (microsecondsPerBeat / microsecondsPerSecond)\n    time = playerData.time + timeAdvance\n    assert !isNaN(time)\n\n    # Advance other track pointers\n    if inplace\n      trackData.forEach (data, index) ->\n        if index is eventTrackIndex\n          advanceTrackData(data, true)\n        else\n          advanceTrackTicks(data, ticksUntilNextEvent, true)\n      nextEventTrackIndex = findNextEventTrackIndex(trackData)\n    else\n      newTrackData = trackData.map (data, index) ->\n        if index is eventTrackIndex\n          advanceTrackData(data, false)\n        else\n          advanceTrackTicks(data, ticksUntilNextEvent, false)\n\n      # Find next event track\n      nextEventTrackIndex = findNextEventTrackIndex(newTrackData)\n\n    if inplace\n      playerData.currentTick = currentTick\n      playerData.time = time\n      playerData.nextEventTrackIndex = nextEventTrackIndex\n\n      return [nextEvent, playerData]\n    else\n      newState =\n        currentTick: currentTick\n        microsecondsPerBeat: microsecondsPerBeat\n        nextEventTrackIndex: nextEventTrackIndex\n        ticksPerBeat: ticksPerBeat\n        time: time\n        trackData: newTrackData\n\n      return [nextEvent, newState]\n\n  initialState: playerData\n  readEvent: readEvent\n",
      "mode": "100644",
      "type": "blob"
    },
    "noise.coffee": {
      "path": "noise.coffee",
      "content": "###\nCreate a 2 second noise buffer\n###\n\nmodule.exports = (context) ->\n  node = context.createBufferSource()\n  frameCount = context.sampleRate * 2\n  buffer = context.createBuffer(1, frameCount, context.sampleRate)\n  data = buffer.getChannelData(0)\n\n  n = 0\n  while n < frameCount\n    data[n] = Math.random() * 2 - 1\n    n += 1\n\n  node.buffer = buffer\n  node.loop = true\n  node.start(0)\n\n  # node.frequency = node.playbackRate\n\n  return node\n",
      "mode": "100644",
      "type": "blob"
    },
    "note_frequencies.coffee": {
      "path": "note_frequencies.coffee",
      "content": "module.exports = [0..127].map (n) ->\n  semitonesFromA4 = n - 69\n\n  Math.pow(2, semitonesFromA4/12) * 440\n",
      "mode": "100644",
      "type": "blob"
    },
    "osc.coffee": {
      "path": "osc.coffee",
      "content": "module.exports = (context, type) ->\n  osc = context.createOscillator()\n  osc.type = type\n  osc.start()\n\n  return osc\n",
      "mode": "100644",
      "type": "blob"
    },
    "piano.coffee": {
      "path": "piano.coffee",
      "content": "TouchCanvas = require \"touch-canvas\"\n\n\nmodule.exports = ->\n  range = 24\n\n  onNotes = []\n  ids = []\n\n  canvas = TouchCanvas()\n\n  canvas.on \"touch\", (p) ->\n    note = Math.floor p.x * range\n\n    self.playNote(note, p.identifier)\n\n  canvas.on \"release\", (p) ->\n    self.releaseNote(p.identifier)\n\n  self =\n    releaseNote: (identifier) ->\n      onNotes[ids[identifier]] = false\n\n    playNote: (note, identifier) ->\n      onNotes[note] = true\n      ids[identifier] = note\n\n    element: ->\n      canvas.element()\n\n    draw: ->\n      n = range\n\n      canvas.clear()\n      width = canvas.width() / n\n      height = canvas.height()\n\n      [0...n].forEach (n) ->\n        hue = (n % 12) * 360 / 12\n        saturation = \"75%\"\n        lightness = \"50%\"\n\n        if onNotes[n]\n          lightness = \"75%\"\n\n        canvas.drawRect\n          x: width * n\n          y: 0\n          width: width\n          height: height\n          color: \"hsl(#{hue}, #{saturation}, #{lightness})\"\n",
      "mode": "100644",
      "type": "blob"
    },
    "pixie.cson": {
      "path": "pixie.cson",
      "content": "width: 800\nheight: 450\ndependencies:\n  \"touch-canvas\": \"distri/touch-canvas:v0.3.1\"\n",
      "mode": "100644",
      "type": "blob"
    },
    "pulse.coffee": {
      "path": "pulse.coffee",
      "content": "pulseCurve = new Float32Array(256)\n\n[0...256].forEach (i) ->\n  if i < 128\n    pulseCurve[i] = -1\n  else\n    pulseCurve[i] = 1\n\nconstantOneCurve = new Float32Array(2)\nconstantOneCurve[0] = 1\nconstantOneCurve[1] = 1\n\nmodule.exports = (context) ->\n\t# Use a normal oscillator as the basis of our new oscillator.\n\tnode = context.createOscillator()\n\tnode.type = \"sawtooth\"\n\tnode.start()\n\n\t#Shape the output into a pulse wave.\n\tpulseShaper=context.createWaveShaper()\n\tpulseShaper.curve=pulseCurve\n\tnode.connect(pulseShaper)\n\n\t#Use a Node as our new \"width\" audio parameter.\n\twidthGain=context.createGain()\n\twidthGain.gain.value = 0.0 #Default width.\n\tnode.width=widthGain.gain #Add parameter to oscillator node.\n\twidthGain.connect(pulseShaper)\n\n\t#Pass a constant value of 1 into the widthGain – so the \"width\" setting is\n\t#duplicated to its output.\n\tconstantOneShaper = context.createWaveShaper()\n\tconstantOneShaper.curve = constantOneCurve\n\tnode.connect(constantOneShaper)\n\tconstantOneShaper.connect(widthGain)\n\n\t#Override the oscillator's \"connect\" method so that the new node's output\n\t#actually comes from the pulseShaper.\n\tnode.connect = ->\n\t\tpulseShaper.connect.apply(pulseShaper, arguments)\n\n\t#Override the oscillator's \"disconnect\" method.\n\tnode.disconnect = ->\n\t\tpulseShaper.disconnect.apply(pulseShaper, arguments)\n\n\treturn node\n",
      "mode": "100644",
      "type": "blob"
    },
    "style.styl": {
      "path": "style.styl",
      "content": "*\n  box-sizing: border-box\n\nhtml\n  height: 100%\n\nbody\n  font-family: \"HelveticaNeue-Light\", \"Helvetica Neue Light\", \"Helvetica Neue\", Helvetica, Arial, \"Lucida Grande\", sans-serif\n  font-weight: 300\n  font-size: 18px\n  height: 100%\n  margin: 0\n  overflow: hidden\n  user-select: none\n\ncanvas\n  bottom: 0\n  position: absolute\n  top: 0\n  left: 0\n  right: 0\n  margin: auto\n",
      "mode": "100644",
      "type": "blob"
    },
    "track.coffee": {
      "path": "track.coffee",
      "content": "noteFrequencies = require \"./note_frequencies\"\nnoteNames = [\"C\",\"C#0\",\"D\",\"D#0\",\"E\",\"F\",\"F#0\",\"G\",\"G#0\",\"A\",\"A#0\",\"B\",\"C\",\"C#1\",\"D\",\"D#1\",\"E\",\"F\",\"F#1\",\"G\",\"G#1\",\"A\",\"A#1\",\"B\",\"C\",\"C#2\",\"D\",\"D#2\",\"E\",\"F\",\"F#2\",\"G\",\"G#2\",\"A\",\"A#2\",\"B\",\"C\",\"C#3\",\"D\",\"D#3\",\"E\",\"F\",\"F#3\",\"G\",\"G#3\",\"A\",\"A#3\",\"B\",\"C\",\"C#4\",\"D\",\"D#4\",\"E\",\"F\",\"F#4\",\"G\",\"G#4\",\"A\",\"A#4\",\"B\",\"C\",\"C#5\",\"D\",\"D#5\",\"E\",\"F\",\"F#5\",\"G\",\"G#5\",\"A\",\"A#5\",\"B\",\"C\",\"C#6\",\"D\",\"D#6\",\"E\",\"F\",\"F#6\",\"G\",\"G#6\",\"A\",\"A#6\",\"B\",\"C\",\"C#7\",\"D\",\"D#7\",\"E\",\"F\",\"F#7\",\"G\",\"G#7\",\"A\",\"A#7\",\"B\",\"C\",\"C#8\",\"D\",\"D#8\",\"E\",\"F\",\"F#8\",\"G\",\"G#8\",\"A\",\"A#8\",\"B\"]\n.map (name, i) ->\n  n = Math.floor(i / 12)\n\n  if name.endsWith(n)\n    name\n  else\n    \"#{name}#{n}\"\n\nmodule.exports = ->\n  lineHeight = 20\n  width = 60\n\n  data = [32...48]\n  size = data.length\n\n  data = data.map (d, i) ->\n    if i % 2 is 1\n      255\n    else\n      Math.floor(Math.random() * 64) + 12\n\n  # t <= 0 < 1\n  self =\n  draw: (canvas, t, state) ->\n    {activeLine} = state\n    canvas.font \"bold 20px monospace\"\n\n    data.forEach (datum, line) ->\n      textColor = \"#008800\"\n      isActive = line is activeLine\n\n      s = line\n      f = line + 1\n      if s <= t * size < f\n        highlight = \"#00FF00\"\n\n      if isActive\n        highlight = \"#0000FF\"\n        textColor = \"#FFFFFF\"\n\n      if highlight\n        canvas.drawRect\n          x: 20\n          y: line * lineHeight + 2\n          width: width\n          height: lineHeight\n          color: highlight\n\n      if datum is 255\n        text = \"□\"\n      else if datum?\n        text = noteNames[datum]\n      else\n        text = \"...\"\n\n      canvas.drawText\n        x: 20\n        y: 20 + line * lineHeight\n        text: text\n        color: textColor\n\n  update: (frequency, vol, t, dt, state) ->\n    # TODO: Should be setting freq and volume values at exact times in the\n    # future by using context.currentTime\n\n    if \"toSet\" of state\n      self.set(state.activeLine, state.toSet)\n      delete state.toSet\n\n    i = Math.floor(t * size)\n    noteNumber = data[i]\n\n    if noteNumber is 255\n      vol.value = 0\n    else if noteNumber?\n      freq = noteFrequencies[noteNumber]\n\n      if frequency\n        frequency.value = freq#.setValueAtTime(freq, )\n      vol.value = 1\n    else\n\n  set: (index, value) ->\n    data[index] = value\n",
      "mode": "100644",
      "type": "blob"
    },
    "sample.coffee": {
      "path": "sample.coffee",
      "content": "toyPianoSample = \"https://addressable.s3.amazonaws.com/composer/data/b4e7f603e5d18bfd3c97b080fbfab8a57afa9fb6\"\n\nAjax = require \"./lib/ajax\"\n\nmodule.exports = ->\n  Ajax.getBuffer(toyPianoSample + \"?xdomain\")\n",
      "mode": "100644"
    },
    "lib/sf2_parser.js": {
      "path": "lib/sf2_parser.js",
      "content": "/*! JavaScript SoundFont 2 Parser. Copyright 2013-2015 imaya/GREE Inc and Colin Clark. Licensed under the MIT License. */\n\n/*\n * JavaScript SoundFont 2 Parser\n *\n * Copyright 2013 imaya/GREE Inc\n * Copyright 2015 Colin Clark\n *\n * Based on code from the \"SoundFont Synthesizer for WebMidiLink\"\n *   https://github.com/gree/sf2synth.js\n *\n * Licensed under the MIT License.\n */\n\n/*global require*/\n\n(function (root, factory) {\n    if (typeof exports === \"object\") {\n        // We're in a CommonJS-style loader.\n        root.sf2 = exports;\n        factory(exports);\n    } else if (typeof define === \"function\" && define.amd) {\n        // We're in an AMD-style loader.\n        define([\"exports\"], function (exports) {\n            root.sf2 = exports;\n            return (root.sf2, factory(exports));\n        });\n    } else {\n        // Plain old browser.\n        root.sf2 = {};\n        factory(root.sf2);\n    }\n}(this, function (exports) {\n    \"use strict\";\n\n    var sf2 = exports;\n\n    sf2.Parser = function (input, options) {\n      options = options || {};\n      /** @type {ByteArray} */\n      this.input = input;\n      /** @type {(Object|undefined)} */\n      this.parserOptions = options.parserOptions;\n\n      /** @type {Array.<Object>} */\n      // this.presetHeader;\n      /** @type {Array.<Object>} */\n      // this.presetZone;\n      /** @type {Array.<Object>} */\n      // this.presetZoneModulator;\n      /** @type {Array.<Object>} */\n      // this.presetZoneGenerator;\n      /** @type {Array.<Object>} */\n      // this.instrument;\n      /** @type {Array.<Object>} */\n      // this.instrumentZone;\n      /** @type {Array.<Object>} */\n      // this.instrumentZoneModulator;\n      /** @type {Array.<Object>} */\n      // this.instrumentZoneGenerator;\n      /** @type {Array.<Object>} */\n      //this.sampleHeader;\n    };\n\n    sf2.Parser.prototype.parse = function () {\n      /** @type {sf2.Riff.Parser} */\n      var parser = new sf2.Riff.Parser(this.input, this.parserOptions);\n      /** @type {?sf2.Riff.Chunk} */\n      var chunk;\n\n      // parse RIFF chunk\n      parser.parse();\n      if (parser.chunkList.length !== 1) {\n        throw new Error('wrong chunk length');\n      }\n\n      chunk = parser.getChunk(0);\n      if (chunk === null) {\n        throw new Error('chunk not found');\n      }\n\n      this.parseRiffChunk(chunk);\n\n      // TODO: Presumably this is here to reduce memory,\n      // but does it really matter? Shouldn't we always be\n      // referencing the underlying ArrayBuffer and thus\n      // it will persist, in which case why delete it?\n      this.input = null;\n    };\n\n    /**\n     * @param {sf2.Riff.Chunk} chunk\n     */\n    sf2.Parser.prototype.parseRiffChunk = function (chunk) {\n      /** @type {sf2.Riff.Parser} */\n      var parser;\n      /** @type {ByteArray} */\n      var data = this.input;\n      /** @type {number} */\n      var ip = chunk.offset;\n      /** @type {string} */\n      var signature;\n\n      // check parse target\n      if (chunk.type !== 'RIFF') {\n        throw new Error('invalid chunk type:' + chunk.type);\n      }\n\n      // check signature\n      signature = String.fromCharCode(data[ip++], data[ip++], data[ip++], data[ip++]);\n      if (signature !== 'sfbk') {\n        throw new Error('invalid signature:' + signature);\n      }\n\n      // read structure\n      parser = new sf2.Riff.Parser(data, {'index': ip, 'length': chunk.size - 4});\n      parser.parse();\n      if (parser.getNumberOfChunks() !== 3) {\n        throw new Error('invalid sfbk structure');\n      }\n\n      // INFO-list\n      this.parseInfoList(/** @type {!sf2.Riff.Chunk} */(parser.getChunk(0)));\n\n      // sdta-list\n      this.parseSdtaList(/** @type {!sf2.Riff.Chunk} */(parser.getChunk(1)));\n\n      // pdta-list\n      this.parsePdtaList(/** @type {!sf2.Riff.Chunk} */(parser.getChunk(2)));\n    };\n\n    /**\n     * @param {sf2.Riff.Chunk} chunk\n     */\n    sf2.Parser.prototype.parseInfoList = function (chunk) {\n      /** @type {sf2.Riff.Parser} */\n      var parser;\n      /** @type {ByteArray} */\n      var data = this.input;\n      /** @type {number} */\n      var ip = chunk.offset;\n      /** @type {string} */\n      var signature;\n\n      // check parse target\n      if (chunk.type !== 'LIST') {\n        throw new Error('invalid chunk type:' + chunk.type);\n      }\n\n      // check signature\n      signature = String.fromCharCode(data[ip++], data[ip++], data[ip++], data[ip++]);\n      if (signature !== 'INFO') {\n        throw new Error('invalid signature:' + signature);\n      }\n\n      // read structure\n      parser = new sf2.Riff.Parser(data, {'index': ip, 'length': chunk.size - 4});\n      parser.parse();\n    };\n\n    /**\n     * @param {sf2.Riff.Chunk} chunk\n     */\n    sf2.Parser.prototype.parseSdtaList = function (chunk) {\n      /** @type {sf2.Riff.Parser} */\n      var parser;\n      /** @type {ByteArray} */\n      var data = this.input;\n      /** @type {number} */\n      var ip = chunk.offset;\n      /** @type {string} */\n      var signature;\n\n      // check parse target\n      if (chunk.type !== 'LIST') {\n        throw new Error('invalid chunk type:' + chunk.type);\n      }\n\n      // check signature\n      signature = String.fromCharCode(data[ip++], data[ip++], data[ip++], data[ip++]);\n      if (signature !== 'sdta') {\n        throw new Error('invalid signature:' + signature);\n      }\n\n      // read structure\n      parser = new sf2.Riff.Parser(data, {'index': ip, 'length': chunk.size - 4});\n      parser.parse();\n      if (parser.chunkList.length !== 1) {\n        throw new Error('TODO');\n      }\n      this.samplingData =\n        /** @type {{type: string, size: number, offset: number}} */\n        (parser.getChunk(0));\n    };\n\n    /**\n     * @param {sf2.Riff.Chunk} chunk\n     */\n    sf2.Parser.prototype.parsePdtaList = function (chunk) {\n      /** @type {sf2.Riff.Parser} */\n      var parser;\n      /** @type {ByteArray} */\n      var data = this.input;\n      /** @type {number} */\n      var ip = chunk.offset;\n      /** @type {string} */\n      var signature;\n\n      // check parse target\n      if (chunk.type !== 'LIST') {\n        throw new Error('invalid chunk type:' + chunk.type);\n      }\n\n      // check signature\n      signature = String.fromCharCode(data[ip++], data[ip++], data[ip++], data[ip++]);\n      if (signature !== 'pdta') {\n        throw new Error('invalid signature:' + signature);\n      }\n\n      // read structure\n      parser = new sf2.Riff.Parser(data, {'index': ip, 'length': chunk.size - 4});\n      parser.parse();\n\n      // check number of chunks\n      if (parser.getNumberOfChunks() !== 9) {\n        throw new Error('invalid pdta chunk');\n      }\n\n      this.parsePhdr(/** @type {sf2.Riff.Chunk} */(parser.getChunk(0)));\n      this.parsePbag(/** @type {sf2.Riff.Chunk} */(parser.getChunk(1)));\n      this.parsePmod(/** @type {sf2.Riff.Chunk} */(parser.getChunk(2)));\n      this.parsePgen(/** @type {sf2.Riff.Chunk} */(parser.getChunk(3)));\n      this.parseInst(/** @type {sf2.Riff.Chunk} */(parser.getChunk(4)));\n      this.parseIbag(/** @type {sf2.Riff.Chunk} */(parser.getChunk(5)));\n      this.parseImod(/** @type {sf2.Riff.Chunk} */(parser.getChunk(6)));\n      this.parseIgen(/** @type {sf2.Riff.Chunk} */(parser.getChunk(7)));\n      this.parseShdr(/** @type {sf2.Riff.Chunk} */(parser.getChunk(8)));\n    };\n\n    /**\n     * @param {sf2.Riff.Chunk} chunk\n     */\n    sf2.Parser.prototype.parsePhdr = function (chunk) {\n      /** @type {ByteArray} */\n      var data = this.input;\n      /** @type {number} */\n      var ip = chunk.offset;\n      /** @type {Array.<Object>} */\n      var presetHeader = this.presetHeader = [];\n      /** @type {number} */\n      var size = chunk.offset + chunk.size;\n\n      // check parse target\n      if (chunk.type !== 'phdr') {\n        throw new Error('invalid chunk type:' + chunk.type);\n      }\n\n      while (ip < size) {\n        presetHeader.push({\n          presetName: String.fromCharCode.apply(null, data.subarray(ip, ip += 20)),\n          preset: data[ip++] | (data[ip++] << 8),\n          bank: data[ip++] | (data[ip++] << 8),\n          presetBagIndex: data[ip++] | (data[ip++] << 8),\n          library: (data[ip++] | (data[ip++] << 8) | (data[ip++] << 16) | (data[ip++] << 24)) >>> 0,\n          genre: (data[ip++] | (data[ip++] << 8) | (data[ip++] << 16) | (data[ip++] << 24)) >>> 0,\n          morphology: (data[ip++] | (data[ip++] << 8) | (data[ip++] << 16) | (data[ip++] << 24)) >>> 0\n        });\n      }\n    };\n\n    /**\n     * @param {sf2.Riff.Chunk} chunk\n     */\n    sf2.Parser.prototype.parsePbag = function (chunk) {\n      /** @type {ByteArray} */\n      var data = this.input;\n      /** @type {number} */\n      var ip = chunk.offset;\n      /** @type {Array.<Object>} */\n      var presetZone = this.presetZone = [];\n      /** @type {number} */\n      var size = chunk.offset + chunk.size;\n\n      // check parse target\n      if (chunk.type !== 'pbag') {\n        throw new Error('invalid chunk type:'  + chunk.type);\n      }\n\n      while (ip < size) {\n        presetZone.push({\n          presetGeneratorIndex: data[ip++] | (data[ip++] << 8),\n          presetModulatorIndex: data[ip++] | (data[ip++] << 8)\n        });\n      }\n    };\n\n    /**\n     * @param {sf2.Riff.Chunk} chunk\n     */\n    sf2.Parser.prototype.parsePmod = function (chunk) {\n      // check parse target\n      if (chunk.type !== 'pmod') {\n        throw new Error('invalid chunk type:' + chunk.type);\n      }\n\n      this.presetZoneModulator = this.parseModulator(chunk);\n    };\n\n    /**\n     * @param {sf2.Riff.Chunk} chunk\n     */\n    sf2.Parser.prototype.parsePgen = function (chunk) {\n      // check parse target\n      if (chunk.type !== 'pgen') {\n        throw new Error('invalid chunk type:' + chunk.type);\n      }\n      this.presetZoneGenerator = this.parseGenerator(chunk);\n    };\n\n    /**\n     * @param {sf2.Riff.Chunk} chunk\n     */\n    sf2.Parser.prototype.parseInst = function (chunk) {\n      /** @type {ByteArray} */\n      var data = this.input;\n      /** @type {number} */\n      var ip = chunk.offset;\n      /** @type {Array.<Object>} */\n      var instrument = this.instrument = [];\n      /** @type {number} */\n      var size = chunk.offset + chunk.size;\n\n      // check parse target\n      if (chunk.type !== 'inst') {\n        throw new Error('invalid chunk type:' + chunk.type);\n      }\n\n      while (ip < size) {\n        instrument.push({\n          instrumentName: String.fromCharCode.apply(null, data.subarray(ip, ip += 20)),\n          instrumentBagIndex: data[ip++] | (data[ip++] << 8)\n        });\n      }\n    };\n\n    /**\n     * @param {sf2.Riff.Chunk} chunk\n     */\n    sf2.Parser.prototype.parseIbag = function (chunk) {\n      /** @type {ByteArray} */\n      var data = this.input;\n      /** @type {number} */\n      var ip = chunk.offset;\n      /** @type {Array.<Object>} */\n      var instrumentZone = this.instrumentZone = [];\n      /** @type {number} */\n      var size = chunk.offset + chunk.size;\n\n      // check parse target\n      if (chunk.type !== 'ibag') {\n        throw new Error('invalid chunk type:' + chunk.type);\n      }\n\n\n      while (ip < size) {\n        instrumentZone.push({\n          instrumentGeneratorIndex: data[ip++] | (data[ip++] << 8),\n          instrumentModulatorIndex: data[ip++] | (data[ip++] << 8)\n        });\n      }\n    };\n\n    /**\n     * @param {sf2.Riff.Chunk} chunk\n     */\n    sf2.Parser.prototype.parseImod = function (chunk) {\n      // check parse target\n      if (chunk.type !== 'imod') {\n        throw new Error('invalid chunk type:' + chunk.type);\n      }\n\n      this.instrumentZoneModulator = this.parseModulator(chunk);\n    };\n\n\n    /**\n     * @param {sf2.Riff.Chunk} chunk\n     */\n    sf2.Parser.prototype.parseIgen = function (chunk) {\n      // check parse target\n      if (chunk.type !== 'igen') {\n        throw new Error('invalid chunk type:' + chunk.type);\n      }\n\n      this.instrumentZoneGenerator = this.parseGenerator(chunk);\n    };\n\n    /**\n     * @param {sf2.Riff.Chunk} chunk\n     */\n    sf2.Parser.prototype.parseShdr = function (chunk) {\n      /** @type {ByteArray} */\n      var data = this.input;\n      /** @type {number} */\n      var ip = chunk.offset;\n      /** @type {Array.<Object>} */\n      var samples = this.sample = [];\n      /** @type {Array.<Object>} */\n      var sampleHeader = this.sampleHeader = [];\n      /** @type {number} */\n      var size = chunk.offset + chunk.size;\n      /** @type {string} */\n      var sampleName;\n      /** @type {number} */\n      var start;\n      /** @type {number} */\n      var end;\n      /** @type {number} */\n      var startLoop;\n      /** @type {number} */\n      var endLoop;\n      /** @type {number} */\n      var sampleRate;\n      /** @type {number} */\n      var originalPitch;\n      /** @type {number} */\n      var pitchCorrection;\n      /** @type {number} */\n      var sampleLink;\n      /** @type {number} */\n      var sampleType;\n\n      // check parse target\n      if (chunk.type !== 'shdr') {\n        throw new Error('invalid chunk type:' + chunk.type);\n      }\n\n      while (ip < size) {\n        sampleName = String.fromCharCode.apply(null, data.subarray(ip, ip += 20));\n        start = (\n          (data[ip++] << 0) | (data[ip++] << 8) | (data[ip++] << 16) | (data[ip++] << 24)\n        ) >>> 0;\n        end = (\n          (data[ip++] << 0) | (data[ip++] << 8) | (data[ip++] << 16) | (data[ip++] << 24)\n        ) >>> 0;\n        startLoop = (\n          (data[ip++] << 0) | (data[ip++] << 8) | (data[ip++] << 16) | (data[ip++] << 24)\n        ) >>> 0;\n        endLoop =  (\n          (data[ip++] << 0) | (data[ip++] << 8) | (data[ip++] << 16) | (data[ip++] << 24)\n        ) >>> 0;\n        sampleRate = (\n          (data[ip++] << 0) | (data[ip++] << 8) | (data[ip++] << 16) | (data[ip++] << 24)\n        ) >>> 0;\n        originalPitch = data[ip++];\n        pitchCorrection = (data[ip++] << 24) >> 24;\n        sampleLink = data[ip++] | (data[ip++] << 8);\n        sampleType = data[ip++] | (data[ip++] << 8);\n\n        var sample = new Int16Array(new Uint8Array(data.subarray(\n          this.samplingData.offset + start * 2,\n          this.samplingData.offset + end   * 2\n        )).buffer);\n\n        startLoop -= start;\n        endLoop -= start;\n\n        if (sampleRate > 0) {\n          var adjust = this.adjustSampleData(sample, sampleRate);\n          sample = adjust.sample;\n          sampleRate *= adjust.multiply;\n          startLoop *= adjust.multiply;\n          endLoop *= adjust.multiply;\n        }\n\n        samples.push(sample);\n\n        sampleHeader.push({\n          sampleName: sampleName,\n          /*\n          start: start,\n          end: end,\n          */\n          startLoop: startLoop,\n          endLoop: endLoop,\n          sampleRate: sampleRate,\n          originalPitch: originalPitch,\n          pitchCorrection: pitchCorrection,\n          sampleLink: sampleLink,\n          sampleType: sampleType\n        });\n      }\n    };\n\n    // TODO: This function is questionable;\n    // it doesn't interpolate the sample data\n    // and always forces a sample rate of 22050 or higher. Why?\n    sf2.Parser.prototype.adjustSampleData = function (sample, sampleRate) {\n      /** @type {Int16Array} */\n      var newSample;\n      /** @type {number} */\n      var i;\n      /** @type {number} */\n      var il;\n      /** @type {number} */\n      var j;\n      /** @type {number} */\n      var multiply = 1;\n\n      // buffer\n      while (sampleRate < 22050) {\n        newSample = new Int16Array(sample.length * 2);\n        for (i = j = 0, il = sample.length; i < il; ++i) {\n          newSample[j++] = sample[i];\n          newSample[j++] = sample[i];\n        }\n        sample = newSample;\n        multiply *= 2;\n        sampleRate *= 2;\n      }\n\n      return {\n        sample: sample,\n        multiply: multiply\n      };\n    };\n\n    /**\n     * @param {sf2.Riff.Chunk} chunk\n     * @return {Array.<Object>}\n     */\n    sf2.Parser.prototype.parseModulator = function (chunk) {\n        /** @type {ByteArray} */\n        var data = this.input;\n        /** @type {number} */\n        var ip = chunk.offset;\n        /** @type {number} */\n        var size = chunk.offset + chunk.size;\n        /** @type {number} */\n        var code;\n        /** @type {string} */\n        var key;\n        /** @type {Array.<Object>} */\n        var output = [];\n\n        while (ip < size) {\n          // Src  Oper\n          // TODO\n          ip += 2;\n\n          // Dest Oper\n          code = data[ip++] | (data[ip++] << 8);\n          key = sf2.Parser.GeneratorEnumeratorTable[code];\n          if (key === undefined) {\n            // Amount\n            output.push({\n              type: key,\n              value: {\n                code: code,\n                amount: data[ip] | (data[ip+1] << 8) << 16 >> 16,\n                lo: data[ip++],\n                hi: data[ip++]\n              }\n            });\n          } else {\n            // Amount\n            switch (key) {\n              case 'keyRange': /* FALLTHROUGH */\n              case 'velRange': /* FALLTHROUGH */\n              case 'keynum': /* FALLTHROUGH */\n              case 'velocity':\n                output.push({\n                  type: key,\n                  value: {\n                    lo: data[ip++],\n                    hi: data[ip++]\n                  }\n                });\n                break;\n              default:\n                output.push({\n                  type: key,\n                  value: {\n                    amount: data[ip++] | (data[ip++] << 8) << 16 >> 16\n                  }\n                });\n                break;\n            }\n          }\n\n          // AmtSrcOper\n          // TODO\n          ip += 2;\n\n          // Trans Oper\n          // TODO\n          ip += 2;\n        }\n\n        return output;\n      };\n\n    /**\n     * @param {sf2.Riff.Chunk} chunk\n     * @return {Array.<Object>}\n     */\n    sf2.Parser.prototype.parseGenerator = function (chunk) {\n      /** @type {ByteArray} */\n      var data = this.input;\n      /** @type {number} */\n      var ip = chunk.offset;\n      /** @type {number} */\n      var size = chunk.offset + chunk.size;\n      /** @type {number} */\n      var code;\n      /** @type {string} */\n      var key;\n      /** @type {Array.<Object>} */\n      var output = [];\n\n      while (ip < size) {\n        code = data[ip++] | (data[ip++] << 8);\n        key = sf2.Parser.GeneratorEnumeratorTable[code];\n        if (key === undefined) {\n          output.push({\n            type: key,\n            value: {\n              code: code,\n              amount: data[ip] | (data[ip+1] << 8) << 16 >> 16,\n              lo: data[ip++],\n              hi: data[ip++]\n            }\n          });\n          continue;\n        }\n\n        switch (key) {\n          case 'keynum': /* FALLTHROUGH */\n          case 'keyRange': /* FALLTHROUGH */\n          case 'velRange': /* FALLTHROUGH */\n          case 'velocity':\n            output.push({\n              type: key,\n              value: {\n                lo: data[ip++],\n                hi: data[ip++]\n              }\n            });\n            break;\n          default:\n            output.push({\n              type: key,\n              value: {\n                amount: data[ip++] | (data[ip++] << 8) << 16 >> 16\n              }\n            });\n            break;\n        }\n      }\n\n      return output;\n    };\n\n    sf2.Parser.prototype.getInstruments = function () {\n      /** @type {Array.<Object>} */\n      var instrument = this.instrument;\n      /** @type {Array.<Object>} */\n      var zone = this.instrumentZone;\n      /** @type {Array.<Object>} */\n      var output = [];\n      /** @type {number} */\n      var bagIndex;\n      /** @type {number} */\n      var bagIndexEnd;\n      /** @type {Array.<Object>} */\n      var zoneInfo;\n      /** @type {{generator: Object, generatorInfo: Array.<Object>}} */\n      var instrumentGenerator;\n      /** @type {{modulator: Object, modulatorInfo: Array.<Object>}} */\n      var instrumentModulator;\n      /** @type {number} */\n      var i;\n      /** @type {number} */\n      var il;\n      /** @type {number} */\n      var j;\n      /** @type {number} */\n      var jl;\n\n      // instrument -> instrument bag -> generator / modulator\n      for (i = 0, il = instrument.length; i < il; ++i) {\n        bagIndex    = instrument[i].instrumentBagIndex;\n        bagIndexEnd = instrument[i+1] ? instrument[i+1].instrumentBagIndex : zone.length;\n        zoneInfo = [];\n\n        // instrument bag\n        for (j = bagIndex, jl = bagIndexEnd; j < jl; ++j) {\n          instrumentGenerator = this.createInstrumentGenerator_(zone, j);\n          instrumentModulator = this.createInstrumentModulator_(zone, j);\n\n          zoneInfo.push({\n            generator: instrumentGenerator.generator,\n            generatorSequence: instrumentGenerator.generatorInfo,\n            modulator: instrumentModulator.modulator,\n            modulatorSequence: instrumentModulator.modulatorInfo\n          });\n        }\n\n        output.push({\n          name: instrument[i].instrumentName,\n          info: zoneInfo\n        });\n      }\n\n      return output;\n    };\n\n    sf2.Parser.prototype.getPresets = function () {\n      /** @type {Array.<Object>} */\n      var preset   = this.presetHeader;\n      /** @type {Array.<Object>} */\n      var zone = this.presetZone;\n      /** @type {Array.<Object>} */\n      var output = [];\n      /** @type {number} */\n      var bagIndex;\n      /** @type {number} */\n      var bagIndexEnd;\n      /** @type {Array.<Object>} */\n      var zoneInfo;\n      /** @type {number} */\n      var instrument;\n      /** @type {{generator: Object, generatorInfo: Array.<Object>}} */\n      var presetGenerator;\n      /** @type {{modulator: Object, modulatorInfo: Array.<Object>}} */\n      var presetModulator;\n      /** @type {number} */\n      var i;\n      /** @type {number} */\n      var il;\n      /** @type {number} */\n      var j;\n      /** @type {number} */\n      var jl;\n\n      // preset -> preset bag -> generator / modulator\n      for (i = 0, il = preset.length; i < il; ++i) {\n        bagIndex    = preset[i].presetBagIndex;\n        bagIndexEnd = preset[i+1] ? preset[i+1].presetBagIndex : zone.length;\n        zoneInfo = [];\n\n        // preset bag\n        for (j = bagIndex, jl = bagIndexEnd; j < jl; ++j) {\n          presetGenerator = this.createPresetGenerator_(zone, j);\n          presetModulator = this.createPresetModulator_(zone, j);\n\n          zoneInfo.push({\n            generator: presetGenerator.generator,\n            generatorSequence: presetGenerator.generatorInfo,\n            modulator: presetModulator.modulator,\n            modulatorSequence: presetModulator.modulatorInfo\n          });\n\n          instrument =\n            presetGenerator.generator.instrument !== undefined ?\n              presetGenerator.generator.instrument.amount :\n            presetModulator.modulator.instrument !== undefined ?\n              presetModulator.modulator.instrument.amount :\n            null;\n        }\n\n        output.push({\n          name: preset[i].presetName,\n          info: zoneInfo,\n          header: preset[i],\n          instrument: instrument\n        });\n      }\n\n      return output;\n    };\n\n    /**\n     * @param {Array.<Object>} zone\n     * @param {number} index\n     * @returns {{generator: Object, generatorInfo: Array.<Object>}}\n     * @private\n     */\n    sf2.Parser.prototype.createInstrumentGenerator_ = function (zone, index) {\n      var modgen = this.createBagModGen_(\n        zone,\n        zone[index].instrumentGeneratorIndex,\n        zone[index+1] ? zone[index+1].instrumentGeneratorIndex: this.instrumentZoneGenerator.length,\n        this.instrumentZoneGenerator\n      );\n\n      return {\n        generator: modgen.modgen,\n        generatorInfo: modgen.modgenInfo\n      };\n    };\n\n    /**\n     * @param {Array.<Object>} zone\n     * @param {number} index\n     * @returns {{modulator: Object, modulatorInfo: Array.<Object>}}\n     * @private\n     */\n    sf2.Parser.prototype.createInstrumentModulator_ = function (zone, index) {\n      var modgen = this.createBagModGen_(\n        zone,\n        zone[index].presetModulatorIndex,\n        zone[index+1] ? zone[index+1].instrumentModulatorIndex: this.instrumentZoneModulator.length,\n        this.instrumentZoneModulator\n      );\n\n      return {\n        modulator: modgen.modgen,\n        modulatorInfo: modgen.modgenInfo\n      };\n    };\n\n    /**\n     * @param {Array.<Object>} zone\n     * @param {number} index\n     * @returns {{generator: Object, generatorInfo: Array.<Object>}}\n     * @private\n     */\n    sf2.Parser.prototype.createPresetGenerator_ = function (zone, index) {\n      var modgen = this.createBagModGen_(\n        zone,\n        zone[index].presetGeneratorIndex,\n        zone[index+1] ? zone[index+1].presetGeneratorIndex : this.presetZoneGenerator.length,\n        this.presetZoneGenerator\n      );\n\n      return {\n        generator: modgen.modgen,\n        generatorInfo: modgen.modgenInfo\n      };\n    };\n\n      /**\n       * @param {Array.<Object>} zone\n       * @param {number} index\n       * @returns {{modulator: Object, modulatorInfo: Array.<Object>}}\n       * @private\n       */\n    sf2.Parser.prototype.createPresetModulator_ = function (zone, index) {\n      /** @type {{modgen: Object, modgenInfo: Array.<Object>}} */\n      var modgen = this.createBagModGen_(\n        zone,\n        zone[index].presetModulatorIndex,\n        zone[index+1] ? zone[index+1].presetModulatorIndex : this.presetZoneModulator.length,\n        this.presetZoneModulator\n      );\n\n      return {\n        modulator: modgen.modgen,\n        modulatorInfo: modgen.modgenInfo\n      };\n    };\n\n    /**\n     * @param {Array.<Object>} zone\n     * @param {number} indexStart\n     * @param {number} indexEnd\n     * @param zoneModGen\n     * @returns {{modgen: Object, modgenInfo: Array.<Object>}}\n     * @private\n     */\n    sf2.Parser.prototype.createBagModGen_ = function (zone, indexStart, indexEnd, zoneModGen) {\n      /** @type {Array.<Object>} */\n      var modgenInfo = [];\n      /** @type {Object} */\n      var modgen = {\n        unknown: [],\n        'keyRange': {\n          hi: 127,\n          lo: 0\n        }\n      }; // TODO\n      /** @type {Object} */\n      var info;\n      /** @type {number} */\n      var i;\n      /** @type {number} */\n      var il;\n\n      for (i = indexStart, il = indexEnd; i < il; ++i) {\n        info = zoneModGen[i];\n        modgenInfo.push(info);\n\n        if (info.type === 'unknown') {\n          modgen.unknown.push(info.value);\n        } else {\n          modgen[info.type] = info.value;\n        }\n      }\n\n      return {\n        modgen: modgen,\n        modgenInfo: modgenInfo\n      };\n    };\n\n\n    /**\n     * @type {Array.<string>}\n     * @const\n     */\n    sf2.Parser.GeneratorEnumeratorTable = [\n      'startAddrsOffset',\n      'endAddrsOffset',\n      'startloopAddrsOffset',\n      'endloopAddrsOffset',\n      'startAddrsCoarseOffset',\n      'modLfoToPitch',\n      'vibLfoToPitch',\n      'modEnvToPitch',\n      'initialFilterFc',\n      'initialFilterQ',\n      'modLfoToFilterFc',\n      'modEnvToFilterFc',\n      'endAddrsCoarseOffset',\n      'modLfoToVolume',\n      undefined, // 14\n      'chorusEffectsSend',\n      'reverbEffectsSend',\n      'pan',\n      undefined,\n      undefined,\n      undefined, // 18,19,20\n      'delayModLFO',\n      'freqModLFO',\n      'delayVibLFO',\n      'freqVibLFO',\n      'delayModEnv',\n      'attackModEnv',\n      'holdModEnv',\n      'decayModEnv',\n      'sustainModEnv',\n      'releaseModEnv',\n      'keynumToModEnvHold',\n      'keynumToModEnvDecay',\n      'delayVolEnv',\n      'attackVolEnv',\n      'holdVolEnv',\n      'decayVolEnv',\n      'sustainVolEnv',\n      'releaseVolEnv',\n      'keynumToVolEnvHold',\n      'keynumToVolEnvDecay',\n      'instrument',\n      undefined, // 42\n      'keyRange',\n      'velRange',\n      'startloopAddrsCoarseOffset',\n      'keynum',\n      'velocity',\n      'initialAttenuation',\n      undefined, // 49\n      'endloopAddrsCoarseOffset',\n      'coarseTune',\n      'fineTune',\n      'sampleID',\n      'sampleModes',\n      undefined, // 55\n      'scaleTuning',\n      'exclusiveClass',\n      'overridingRootKey'\n    ];\n\n\n    sf2.Riff = {};\n\n    sf2.Riff.Parser = function (input, options) {\n      options = options || {};\n      /** @type {ByteArray} */\n      this.input = input;\n      /** @type {number} */\n      this.ip = options.index || 0;\n      /** @type {number} */\n      this.length = options.length || input.length - this.ip;\n      /** @type {Array.<sf2.Riff.Chunk>} */\n    //   this.chunkList;\n      /** @type {number} */\n      this.offset = this.ip;\n      /** @type {boolean} */\n      this.padding = options.padding !== undefined ? options.padding : true;\n      /** @type {boolean} */\n      this.bigEndian = options.bigEndian !== undefined ? options.bigEndian : false;\n    };\n\n    /**\n     * @param {string} type\n     * @param {number} size\n     * @param {number} offset\n     * @constructor\n     */\n    sf2.Riff.Chunk = function (type, size, offset) {\n      /** @type {string} */\n      this.type = type;\n      /** @type {number} */\n      this.size = size;\n      /** @type {number} */\n      this.offset = offset;\n    };\n\n    sf2.Riff.Parser.prototype.parse = function () {\n      /** @type {number} */\n      var length = this.length + this.offset;\n\n      this.chunkList = [];\n\n      while (this.ip < length) {\n        this.parseChunk();\n      }\n    };\n\n    sf2.Riff.Parser.prototype.parseChunk = function () {\n      /** @type {ByteArray} */\n      var input = this.input;\n      /** @type {number} */\n      var ip = this.ip;\n      /** @type {number} */\n      var size;\n\n      this.chunkList.push(new sf2.Riff.Chunk(\n        String.fromCharCode(input[ip++], input[ip++], input[ip++], input[ip++]),\n        (size = this.bigEndian ?\n           ((input[ip++] << 24) | (input[ip++] << 16) |\n            (input[ip++] <<  8) | (input[ip++]      )) >>> 0 :\n           ((input[ip++]      ) | (input[ip++] <<  8) |\n            (input[ip++] << 16) | (input[ip++] << 24)) >>> 0\n        ),\n        ip\n      ));\n\n      ip += size;\n\n      // padding\n      if (this.padding && ((ip - this.offset) & 1) === 1) {\n        ip++;\n      }\n\n      this.ip = ip;\n    };\n\n    /**\n     * @param {number} index chunk index.\n     * @return {?sf2.Riff.Chunk}\n     */\n    sf2.Riff.Parser.prototype.getChunk = function (index) {\n      /** @type {sf2.Riff.Chunk} */\n      var chunk = this.chunkList[index];\n\n      if (chunk === undefined) {\n        return null;\n      }\n\n      return chunk;\n    };\n\n    /**\n     * @return {number}\n     */\n    sf2.Riff.Parser.prototype.getNumberOfChunks = function () {\n      return this.chunkList.length;\n    };\n\n\n    return sf2;\n}));",
      "mode": "100644"
    },
    "load-n-play-midi.coffee": {
      "path": "load-n-play-midi.coffee",
      "content": "Ajax = require \"./lib/ajax\"\n\nmodule.exports = (context, Player) ->\n  readFile = require \"./lib/read_file\"\n  Drop = require \"./lib/drop\"\n\n  Drop document, (e) ->\n    file = e.dataTransfer.files[0]\n\n    if file\n      readFile(file, \"readAsArrayBuffer\")\n\n  loadFile = (file) ->\n\n  # Midi loading\n  MidiFile = require \"./lib/midifile\"\n  MidiPlayer = require \"./midi_player\"\n\n  badApple = \"http://whimsy.space/danielx/data/clOXhtZz4VcunDJZdCM8T5pjBPKQaLCYCzbDod39Vbg\"\n  waltz = \"http://whimsy.space/danielx/data/qxIFNrVVEqhwmwUO5wWyZKk1IwGgQIxqvLQ9WX0X20E\"\n  jordan = \"http://whimsy.space/danielx/data/FhSh0qeVTMu9Xwd4vihF6shaPJsD_rM8t1OSKGl-ir4\"\n  # Bad Apple 36MB MIDI\n\n  require(\"./sample\")().then (buffer) ->\n    context.decodeAudioData buffer, (audioBuffer) ->\n      global.sample = audioBuffer\n    , (err) ->\n      console.error 'Iam error'\n\n  Ajax.getBuffer(jordan)\n  .then (buffer) ->\n    array = new Uint8Array(buffer)\n    midiFile = MidiFile(array)\n    console.log midiFile\n\n    player = MidiPlayer(midiFile)\n\n    {playNote, releaseNote} = Player()\n\n    meta = {}\n\n    handleEvent = (event, state) ->\n      {time} = state\n      {deltaTime, noteNumber, subtype, type, velocity} = event\n\n      switch \"#{type}:#{subtype}\"\n        when \"channel:controller\"\n          ; # TODO\n        when \"channel:noteOn\"\n          playNote noteNumber, velocity, time + timeOffset\n        when \"channel:noteOff\"\n          releaseNote noteNumber, time + timeOffset\n        when \"channel:programChange\"\n          ;# console.log \"PROG CH\", event  \n        when \"meta:copyrightNotice\"\n          if meta.copyrightNotice\n            meta.copyrightNotice += \"/n#{event.text}\"\n          else\n            meta.copyrightNotice = event.text\n        when \"meta:keySignature\"\n          meta.keySignature =\n            scale: event.scale\n            key: event.key\n        when \"meta:setTempo\"\n          state.microsecondsPerBeat = event.microsecondsPerBeat\n        when \"meta:text\"\n          if meta.text\n            meta.text += \"/n#{event.text}\"\n          else\n            meta.text = event.text\n        when \"meta:timeSignature\"\n          meta.timeSignature =\n            denominator: event.denominator\n            metronome: event.metronome\n            numerator: event.numerator\n            thirtyseconds: event.thirtySeconds\n        when \"meta:trackName\"\n          # TODO: This needs to be per track\n          meta.trackName = event.text\n        when \"meta:unknown\"\n          ;\n        else\n          console.log \"Unknown\", event\n\n      return state\n\n    timeOffset = context.currentTime\n\n    currentState = player.initialState\n\n    consumeEventsUntilTime = (t) ->\n      count = 0\n\n      while currentState.time < t\n        [event, nextState] = player.readEvent(currentState, true)\n        break unless event\n        currentState = handleEvent(event, nextState)\n        count += 1\n\n      return count\n\n    setInterval ->\n      consumed = consumeEventsUntilTime(context.currentTime - timeOffset + 0.025)\n      # console.log \"Consumed:\", consumed\n    , 15\n",
      "mode": "100644"
    },
    "load-sound-font.coffee": {
      "path": "load-sound-font.coffee",
      "content": "Ajax = require \"./lib/ajax\"\n\nloadSoundFont = ->\n  SF2Parser = require \"./lib/sf2_parser\"\n  console.log SF2Parser\n  soundFontURL = \"http://whimsy.space/danielx/data/nzn8U706GmnxPLSGg4lE7e01iztuivvWwcLDNnWyA0s\"\n\n  Ajax.getBuffer(soundFontURL)\n  .then (buffer) ->\n    parser = new SF2Parser.Parser(new Uint8Array(buffer))\n    data = parser.parse()\n\n    console.log parser, data\n\nloadSoundFont()\n\n",
      "mode": "100644"
    }
  },
  "distribution": {
    "gainer": {
      "path": "gainer",
      "content": "(function() {\n  var __slice = [].slice;\n\n  module.exports = function(osc) {\n    var gain;\n    gain = osc.context.createGain();\n    gain.gain.value = 0;\n    osc.connect(gain);\n    osc.gain = gain.gain;\n    osc.connect = function() {\n      var args;\n      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n      return gain.connect.apply(gain, args);\n    };\n    return osc;\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "lib/ajax": {
      "path": "lib/ajax",
      "content": "(function() {\n  var Ajax, readFile;\n\n  readFile = require(\"./read_file\");\n\n  module.exports = Ajax = {\n    getJSON: function(path, options) {\n      if (options == null) {\n        options = {};\n      }\n      return Ajax.getText(path, options).then(JSON.parse);\n    },\n    getText: function(path, options) {\n      if (options == null) {\n        options = {};\n      }\n      return Ajax.getBlob(path, options).then(readFile);\n    },\n    getBuffer: function(path, options) {\n      if (options == null) {\n        options = {};\n      }\n      return Ajax.getBlob(path, options).then(function(blob) {\n        return readFile(blob, \"readAsArrayBuffer\");\n      });\n    },\n    getBlob: function(path, options) {\n      if (options == null) {\n        options = {};\n      }\n      return new Promise(function(resolve, reject) {\n        var headers, xhr;\n        xhr = new XMLHttpRequest();\n        xhr.open('GET', path, true);\n        xhr.responseType = \"blob\";\n        headers = options.headers;\n        if (headers) {\n          Object.keys(headers).forEach(function(header) {\n            var value;\n            value = headers[header];\n            return xhr.setRequestHeader(header, value);\n          });\n        }\n        xhr.onload = function(e) {\n          var error, _ref;\n          if (((200 <= (_ref = this.status) && _ref < 300)) || this.status === 304) {\n            try {\n              return resolve(this.response);\n            } catch (_error) {\n              error = _error;\n              return reject(error);\n            }\n          } else {\n            return reject(e);\n          }\n        };\n        xhr.onerror = reject;\n        return xhr.send();\n      });\n    }\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "lib/drop": {
      "path": "lib/drop",
      "content": "(function() {\n  module.exports = function(element, handler) {\n    var cancel;\n    cancel = function(e) {\n      e.preventDefault();\n      return false;\n    };\n    element.addEventListener(\"dragover\", cancel);\n    element.addEventListener(\"dragenter\", cancel);\n    return element.addEventListener(\"drop\", function(e) {\n      e.preventDefault();\n      handler(e);\n      return false;\n    });\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "lib/midifile": {
      "path": "lib/midifile",
      "content": "var Stream = require('./stream')\n\n/*\nclass to parse the .mid file format\n(depends on stream.js)\n*/\nmodule.exports = function MidiFile (data) {\n  function readChunk (stream) {\n    var id = stream.read(4)\n    var length = stream.readInt32()\n    return {\n      'id': id,\n      'length': length,\n      'data': stream.subarray(length)\n    }\n  }\n\n  var lastEventTypeByte\n\n  function readEvent (stream) {\n    var event = {}\n    event.deltaTime = stream.readVarInt()\n    var eventTypeByte = stream.readInt8()\n    if ((eventTypeByte & 0xf0) == 0xf0) {\n      /* system / meta event */\n      if (eventTypeByte == 0xff) {\n        /* meta event */\n        event.type = 'meta'\n        var subtypeByte = stream.readInt8()\n        var length = stream.readVarInt()\n        switch (subtypeByte) {\n          case 0x00:\n            event.subtype = 'sequenceNumber'\n            if (length != 2) throw 'Expected length for sequenceNumber event is 2, got ' + length\n            event.number = stream.readInt16()\n            return event\n          case 0x01:\n            event.subtype = 'text'\n            event.text = stream.read(length)\n            return event\n          case 0x02:\n            event.subtype = 'copyrightNotice'\n            event.text = stream.read(length)\n            return event\n          case 0x03:\n            event.subtype = 'trackName'\n            event.text = stream.read(length)\n            return event\n          case 0x04:\n            event.subtype = 'instrumentName'\n            event.text = stream.read(length)\n            return event\n          case 0x05:\n            event.subtype = 'lyrics'\n            event.text = stream.read(length)\n            return event\n          case 0x06:\n            event.subtype = 'marker'\n            event.text = stream.read(length)\n            return event\n          case 0x07:\n            event.subtype = 'cuePoint'\n            event.text = stream.read(length)\n            return event\n          case 0x20:\n            event.subtype = 'midiChannelPrefix'\n            if (length != 1) throw 'Expected length for midiChannelPrefix event is 1, got ' + length\n            event.channel = stream.readInt8()\n            return event\n          case 0x2f:\n            event.subtype = 'endOfTrack'\n            if (length !== 0) throw 'Expected length for endOfTrack event is 0, got ' + length\n            return event\n          case 0x51:\n            event.subtype = 'setTempo'\n            if (length != 3) throw 'Expected length for setTempo event is 3, got ' + length\n            event.microsecondsPerBeat = (\n              (stream.readInt8() << 16)\n              + (stream.readInt8() << 8)\n              + stream.readInt8()\n            )\n            return event\n          case 0x54:\n            event.subtype = 'smpteOffset'\n            if (length != 5) throw 'Expected length for smpteOffset event is 5, got ' + length\n            var hourByte = stream.readInt8()\n            event.frameRate = {\n              0x00: 24, 0x20: 25, 0x40: 29, 0x60: 30\n            }[hourByte & 0x60]\n            event.hour = hourByte & 0x1f\n            event.min = stream.readInt8()\n            event.sec = stream.readInt8()\n            event.frame = stream.readInt8()\n            event.subframe = stream.readInt8()\n            return event\n          case 0x58:\n            event.subtype = 'timeSignature'\n            if (length != 4) throw 'Expected length for timeSignature event is 4, got ' + length\n            event.numerator = stream.readInt8()\n            event.denominator = Math.pow(2, stream.readInt8())\n            event.metronome = stream.readInt8()\n            event.thirtyseconds = stream.readInt8()\n            return event\n          case 0x59:\n            event.subtype = 'keySignature'\n            if (length != 2) throw 'Expected length for keySignature event is 2, got ' + length\n            event.key = stream.readInt8(true)\n            event.scale = stream.readInt8()\n            return event\n          case 0x7f:\n            event.subtype = 'sequencerSpecific'\n            event.data = stream.subarray(length)\n            return event\n          default:\n            // console.log(\"Unrecognised meta event subtype: \" + subtypeByte)\n            event.subtype = 'unknown'\n            event.data = stream.subarray(length)\n            return event\n        }\n        event.data = stream.subarray(length)\n        return event\n      } else if (eventTypeByte == 0xf0) {\n        event.type = 'sysEx'\n        var length = stream.readVarInt()\n        event.data = stream.subarray(length)\n        return event\n      } else if (eventTypeByte == 0xf7) {\n        event.type = 'dividedSysEx'\n        var length = stream.readVarInt()\n        event.data = stream.subarray(length)\n        return event\n      } else {\n        throw 'Unrecognised MIDI event type byte: ' + eventTypeByte\n      }\n    } else {\n      /* channel event */\n      var param1\n      if ((eventTypeByte & 0x80) == 0) {\n        /* running status - reuse lastEventTypeByte as the event type.\n        \teventTypeByte is actually the first parameter\n        */\n        param1 = eventTypeByte\n        eventTypeByte = lastEventTypeByte\n      } else {\n        param1 = stream.readInt8()\n        lastEventTypeByte = eventTypeByte\n      }\n      var eventType = eventTypeByte >> 4\n      event.channel = eventTypeByte & 0x0f\n      event.type = 'channel'\n      switch (eventType) {\n        case 0x08:\n          event.subtype = 'noteOff'\n          event.noteNumber = param1\n          event.velocity = stream.readInt8()\n          return event\n        case 0x09:\n          event.noteNumber = param1\n          event.velocity = stream.readInt8()\n          if (event.velocity == 0) {\n            event.subtype = 'noteOff'\n          } else {\n            event.subtype = 'noteOn'\n          }\n          return event\n        case 0x0a:\n          event.subtype = 'noteAftertouch'\n          event.noteNumber = param1\n          event.amount = stream.readInt8()\n          return event\n        case 0x0b:\n          event.subtype = 'controller'\n          event.controllerType = param1\n          event.value = stream.readInt8()\n          return event\n        case 0x0c:\n          event.subtype = 'programChange'\n          event.programNumber = param1\n          return event\n        case 0x0d:\n          event.subtype = 'channelAftertouch'\n          event.amount = param1\n          return event\n        case 0x0e:\n          event.subtype = 'pitchBend'\n          event.value = param1 + (stream.readInt8() << 7)\n          return event\n        default:\n          throw 'Unrecognised MIDI event type: ' + eventType\n      /*\n      console.log(\"Unrecognised MIDI event type: \" + eventType)\n      stream.readInt8()\n      event.subtype = 'unknown'\n      return event\n      */\n      }\n    }\n  }\n\n  stream = Stream(data)\n  var headerChunk = readChunk(stream)\n  if (headerChunk.id != 'MThd' || headerChunk.length != 6) {\n    throw 'Bad .mid file - header not found'\n  }\n  var headerStream = Stream(headerChunk.data)\n  var formatType = headerStream.readInt16()\n  var trackCount = headerStream.readInt16()\n  var timeDivision = headerStream.readInt16()\n\n  if (timeDivision & 0x8000) {\n    throw 'Expressing time division in SMTPE frames is not supported yet'\n  } else {\n    ticksPerBeat = timeDivision\n  }\n\n  var header = {\n    'formatType': formatType,\n    'trackCount': trackCount,\n    'ticksPerBeat': ticksPerBeat\n  }\n  var tracks = []\n  for (var i = 0; i < header.trackCount; i++) {\n    tracks[i] = []\n    var trackChunk = readChunk(stream)\n    if (trackChunk.id != 'MTrk') {\n      throw 'Unexpected chunk - expected MTrk, got ' + trackChunk.id\n    }\n    var trackStream = Stream(trackChunk.data)\n    while (!trackStream.eof()) {\n      var event = readEvent(trackStream)\n      tracks[i].push(event)\n    // console.log(event)\n    }\n  }\n\n  return {\n    'header': header,\n    'tracks': tracks\n  }\n}\n",
      "type": "blob"
    },
    "lib/read_file": {
      "path": "lib/read_file",
      "content": "(function() {\n  module.exports = function(file, method) {\n    if (method == null) {\n      method = \"readAsText\";\n    }\n    return new Promise(function(resolve, reject) {\n      var reader;\n      reader = new FileReader();\n      reader.onloadend = function() {\n        return resolve(reader.result);\n      };\n      reader.onerror = reject;\n      return reader[method](file);\n    });\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "lib/stream": {
      "path": "lib/stream",
      "content": "module.exports = function (array) {\n  var position = 0;\n\n  function read (length) {\n    var result = String.fromCharCode.apply(String, array.slice(position, position + length));\n    position += length;\n\n    return result;\n  }\n\n  function subarray (length) {\n    var result = array.subarray(position, position + length);\n    position += length;\n\n    return result;\n  }\n\n  /* read a big-endian 32-bit integer */\n  function readInt32 () {\n    var result = (\n        (array[position] << 24)\n      + (array[position + 1] << 16)\n      + (array[position + 2] << 8)\n      + array[position + 3]);\n    position += 4;\n\n    return result;\n  }\n\n  /* read a big-endian 16-bit integer */\n  function readInt16 () {\n    var result = (\n        (array[position] << 8)\n      + array[position + 1]);\n    position += 2;\n\n    return result;\n  }\n\n  /* read an 8-bit integer */\n  function readInt8 (signed) {\n    var result = array[position];\n    if (signed && result > 127) {\n      result -= 256;\n    }\n    position += 1;\n\n    return result;\n  }\n\n  function eof () {\n    return position >= array.length;\n  }\n\n  /* read a MIDI-style variable-length integer\n  \t(big-endian value in groups of 7 bits,\n  \twith top bit set to signify that another byte follows)\n  */\n  function readVarInt () {\n    var result = 0;\n    while (true) {\n      var b = readInt8();\n      if (b & 0x80) {\n        result += (b & 0x7f);\n        result <<= 7;\n      } else {\n        /* b is the last byte */\n        return result + b;\n      }\n    }\n  }\n\n  return {\n    'eof': eof,\n    'read': read,\n    'readInt32': readInt32,\n    'readInt16': readInt16,\n    'readInt8': readInt8,\n    'readVarInt': readVarInt,\n    'subarray' : subarray\n  };\n};\n",
      "type": "blob"
    },
    "lib/viz": {
      "path": "lib/viz",
      "content": "(function() {\n  module.exports = function(analyser) {\n    var bins, frequencyDomain, timeDomain;\n    bins = analyser.frequencyBinCount;\n    frequencyDomain = new Uint8Array(bins);\n    timeDomain = new Uint8Array(bins);\n    return {\n      draw: function(canvas) {\n        var ctx, height, ratio, step, width;\n        analyser.getByteFrequencyData(frequencyDomain);\n        analyser.getByteTimeDomainData(timeDomain);\n        canvas.fill(\"black\");\n        width = canvas.width();\n        height = canvas.height();\n        ctx = canvas.context();\n        ratio = height / 256;\n        step = width / bins;\n        ctx.fillStyle = \"#00F\";\n        ctx.beginPath();\n        ctx.moveTo(0, height);\n        Array.prototype.forEach.call(frequencyDomain, function(value, index) {\n          var x, y;\n          x = index * step;\n          y = ratio * (256 - value);\n          return ctx.lineTo(x, y);\n        });\n        ctx.lineTo(width, height);\n        ctx.fill();\n        ctx.lineWidth = 2;\n        ctx.strokeStyle = \"#F00\";\n        Array.prototype.forEach.call(timeDomain, function(value, index) {\n          var x, y;\n          x = index * step;\n          y = ratio * (256 - value);\n          if (index === 0) {\n            ctx.beginPath();\n            return ctx.moveTo(x, y);\n          } else {\n            return ctx.lineTo(x, y);\n          }\n        });\n        return ctx.stroke();\n      }\n    };\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "main": {
      "path": "main",
      "content": "(function() {\n  var Ajax, BufferPlayer, Gainer, Osc, TouchCanvas, Track, Viz, analyser, canvas, context, handleResize, height, masterGain, noteFrequencies, noteToFreq, playBuffer, track, updateViz, viz, width, _ref;\n\n  (function() {\n    var styleNode;\n    styleNode = document.createElement(\"style\");\n    styleNode.innerHTML = require(\"./style\");\n    return document.head.appendChild(styleNode);\n  })();\n\n  Ajax = require(\"./lib/ajax\");\n\n  TouchCanvas = require(\"touch-canvas\");\n\n  Gainer = require(\"./gainer\");\n\n  Osc = require(\"./noise\");\n\n  _ref = require(\"./pixie\"), width = _ref.width, height = _ref.height;\n\n  canvas = TouchCanvas({\n    width: width,\n    height: height\n  });\n\n  document.body.appendChild(canvas.element());\n\n  handleResize = function() {\n    canvas.width(window.innerWidth);\n    return canvas.height(window.innerHeight);\n  };\n\n  handleResize();\n\n  window.addEventListener(\"resize\", handleResize, false);\n\n  context = new AudioContext;\n\n  Track = require(\"./track\");\n\n  Viz = require(\"./lib/viz\");\n\n  track = Track();\n\n  masterGain = context.createGain();\n\n  masterGain.gain.value = 0.5;\n\n  masterGain.connect(context.destination);\n\n  analyser = context.createAnalyser();\n\n  analyser.smoothingTimeConstant = 0;\n\n  masterGain.connect(analyser);\n\n  viz = Viz(analyser);\n\n  updateViz = function() {\n    viz.draw(canvas);\n    return requestAnimationFrame(updateViz);\n  };\n\n  requestAnimationFrame(updateViz);\n\n  noteFrequencies = require(\"./note_frequencies\");\n\n  noteToFreq = function(note) {\n    return noteFrequencies[note];\n  };\n\n  playBuffer = function(context, buffer, volume, rate, time) {\n    var source;\n    if (rate == null) {\n      rate = 1;\n    }\n    if (time == null) {\n      time = context.currentTime;\n    }\n    source = Gainer(context.createBufferSource());\n    source.buffer = buffer;\n    source.playbackRate.value = rate;\n    source.gain.setValueAtTime(volume, time);\n    source.start(time);\n    return source.connect(masterGain);\n  };\n\n  BufferPlayer = function() {\n    return {\n      playNote: function(note, velocity, time) {\n        var rate, volume;\n        if (global.sample) {\n          volume = velocity / 128;\n          rate = Math.pow(2, (note - 60) / 12);\n          return playBuffer(context, global.sample, volume, rate);\n        }\n      },\n      releaseNote: function() {}\n    };\n  };\n\n  Track = function() {\n    var notes, playNote, releaseNote;\n    notes = {};\n    playNote = function(note, velocity, time) {\n      var freq, osco, volume;\n      if (time == null) {\n        time = context.currentTime;\n      }\n      volume = velocity / 128;\n      if (notes[note]) {\n        osco = notes[note][0];\n        return osco.gain.setValueAtTime(volume, time);\n      } else {\n        freq = noteToFreq(note);\n        osco = context.createOscillator();\n        osco.type = \"square\";\n        osco.frequency.value = freq;\n        osco = Gainer(osco);\n        osco.gain.setValueAtTime(volume, time);\n        osco.connect(masterGain);\n        osco.start(time);\n        return notes[note] = [osco, osco.gain, volume];\n      }\n    };\n    releaseNote = function(note, time) {\n      var gain, osco, volume, _ref1;\n      if (time == null) {\n        time = context.currentTime;\n      }\n      if (!notes[note]) {\n        console.error(\"Double noteOff\");\n        return;\n      }\n      _ref1 = notes[note], osco = _ref1[0], gain = _ref1[1], volume = _ref1[2];\n      return gain.setValueAtTime(0, time);\n    };\n    return {\n      playNote: playNote,\n      releaseNote: releaseNote\n    };\n  };\n\n  require(\"./load-sound-font\");\n\n}).call(this);\n",
      "type": "blob"
    },
    "midi_access": {
      "path": "midi_access",
      "content": "(function() {\n  var __slice = [].slice;\n\n  module.exports = function() {\n    var handler;\n    handler = null;\n    navigator.requestMIDIAccess().then(function(midiAccess) {\n      return midiAccess.inputs.forEach(function(midi) {\n        console.log(midi);\n        return midi.onmidimessage = function() {\n          var args;\n          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n          return typeof handler === \"function\" ? handler.apply(null, args) : void 0;\n        };\n      });\n    });\n    return {\n      handle: function(fn) {\n        return handler = fn;\n      }\n    };\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "midi_player": {
      "path": "midi_player",
      "content": "(function() {\n  var assert, findNextEventTrackIndex, findStuckNotes;\n\n  assert = function(condition, message) {\n    if (message == null) {\n      message = \"Ya' blew it!\";\n    }\n    if (!condition) {\n      throw new Error(message);\n    }\n  };\n\n  findNextEventTrackIndex = function(trackData) {\n    var index, min;\n    min = Infinity;\n    index = void 0;\n    trackData.forEach(function(_arg, i) {\n      var ticksUntilNextEvent;\n      ticksUntilNextEvent = _arg.ticksUntilNextEvent;\n      if (ticksUntilNextEvent < min) {\n        min = ticksUntilNextEvent;\n        return index = i;\n      }\n    });\n    return index;\n  };\n\n  findStuckNotes = function(events) {\n    var checkingNotes, t;\n    checkingNotes = {};\n    t = 0;\n    events.forEach(function(event, i) {\n      var deltaTime, duration, noteNumber, oldEvent, oldIndex, oldT, subtype, velocity, _ref;\n      deltaTime = event.deltaTime, noteNumber = event.noteNumber, subtype = event.subtype, velocity = event.velocity;\n      t += deltaTime;\n      if (subtype === \"noteOn\") {\n        if (checkingNotes[noteNumber]) {\n          console.log(\"Double on!\");\n        } else {\n          checkingNotes[noteNumber] = [event, i, t];\n        }\n      }\n      if (subtype === \"noteOff\") {\n        _ref = checkingNotes[noteNumber], oldEvent = _ref[0], oldIndex = _ref[1], oldT = _ref[2];\n        duration = t - oldT;\n        console.log(duration);\n        if (duration < 1000) {\n\n        } else {\n          console.log(checkingNotes[noteNumber]);\n        }\n        return checkingNotes[noteNumber] = false;\n      }\n    });\n    return console.log(checkingNotes);\n  };\n\n  module.exports = function(midiFile) {\n    var advanceTrackData, advanceTrackTicks, microsecondsPerSecond, playerData, readEvent, tracks;\n    microsecondsPerSecond = 1000000;\n    tracks = midiFile.tracks;\n    playerData = {\n      currentTick: 0,\n      microsecondsPerBeat: 500000,\n      nextEventTrackIndex: null,\n      ticksPerBeat: midiFile.header.ticksPerBeat,\n      time: 0,\n      trackData: tracks.map(function(track, i) {\n        var nextEvent, ticksUntilNextEvent;\n        nextEvent = track[0];\n        ticksUntilNextEvent = nextEvent != null ? nextEvent.deltaTime : void 0;\n        return {\n          id: i,\n          length: track.length,\n          nextEventIndex: 0,\n          ticksUntilNextEvent: ticksUntilNextEvent\n        };\n      })\n    };\n    playerData.nextEventTrackIndex = findNextEventTrackIndex(playerData.trackData);\n    advanceTrackData = function(trackData, inplace) {\n      var nextEvent, nextEventIndex;\n      if (inplace == null) {\n        inplace = true;\n      }\n      nextEventIndex = trackData.nextEventIndex + 1;\n      nextEvent = tracks[trackData.id][nextEventIndex];\n      if (inplace) {\n        trackData.nextEventIndex = nextEventIndex;\n        trackData.ticksUntilNextEvent = nextEvent != null ? nextEvent.deltaTime : void 0;\n        return trackData;\n      } else {\n        return {\n          id: trackData.id,\n          length: trackData.length,\n          nextEventIndex: nextEventIndex,\n          ticksUntilNextEvent: nextEvent != null ? nextEvent.deltaTime : void 0\n        };\n      }\n    };\n    advanceTrackTicks = function(trackData, ticks, inplace) {\n      var ticksUntilNextEvent;\n      if (inplace == null) {\n        inplace = true;\n      }\n      ticksUntilNextEvent = trackData.ticksUntilNextEvent;\n      if (ticksUntilNextEvent != null) {\n        ticksUntilNextEvent -= ticks;\n        assert(ticksUntilNextEvent >= 0);\n      }\n      if (inplace) {\n        return trackData.ticksUntilNextEvent = ticksUntilNextEvent;\n      } else {\n        return {\n          id: trackData.id,\n          length: trackData.length,\n          nextEventIndex: trackData.nextEventIndex,\n          ticksUntilNextEvent: ticksUntilNextEvent\n        };\n      }\n    };\n    readEvent = function(playerData, inplace) {\n      var currentTick, eventTrack, eventTrackIndex, microsecondsPerBeat, newState, newTrackData, nextEvent, nextEventTrackIndex, ticksPerBeat, ticksUntilNextEvent, time, timeAdvance, trackData;\n      if (inplace == null) {\n        inplace = true;\n      }\n      trackData = playerData.trackData;\n      eventTrackIndex = playerData.nextEventTrackIndex;\n      eventTrack = trackData[eventTrackIndex];\n      if (!eventTrack) {\n        return [void 0, playerData];\n      }\n      nextEvent = tracks[eventTrack.id][eventTrack.nextEventIndex];\n      if (!nextEvent) {\n        return [void 0, playerData];\n      }\n      ticksUntilNextEvent = eventTrack.ticksUntilNextEvent;\n      ticksPerBeat = playerData.ticksPerBeat;\n      microsecondsPerBeat = playerData.microsecondsPerBeat;\n      currentTick = playerData.currentTick + ticksUntilNextEvent;\n      timeAdvance = (ticksUntilNextEvent / ticksPerBeat) * (microsecondsPerBeat / microsecondsPerSecond);\n      time = playerData.time + timeAdvance;\n      assert(!isNaN(time));\n      if (inplace) {\n        trackData.forEach(function(data, index) {\n          if (index === eventTrackIndex) {\n            return advanceTrackData(data, true);\n          } else {\n            return advanceTrackTicks(data, ticksUntilNextEvent, true);\n          }\n        });\n        nextEventTrackIndex = findNextEventTrackIndex(trackData);\n      } else {\n        newTrackData = trackData.map(function(data, index) {\n          if (index === eventTrackIndex) {\n            return advanceTrackData(data, false);\n          } else {\n            return advanceTrackTicks(data, ticksUntilNextEvent, false);\n          }\n        });\n        nextEventTrackIndex = findNextEventTrackIndex(newTrackData);\n      }\n      if (inplace) {\n        playerData.currentTick = currentTick;\n        playerData.time = time;\n        playerData.nextEventTrackIndex = nextEventTrackIndex;\n        return [nextEvent, playerData];\n      } else {\n        newState = {\n          currentTick: currentTick,\n          microsecondsPerBeat: microsecondsPerBeat,\n          nextEventTrackIndex: nextEventTrackIndex,\n          ticksPerBeat: ticksPerBeat,\n          time: time,\n          trackData: newTrackData\n        };\n        return [nextEvent, newState];\n      }\n    };\n    return {\n      initialState: playerData,\n      readEvent: readEvent\n    };\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "noise": {
      "path": "noise",
      "content": "\n/*\nCreate a 2 second noise buffer\n */\n\n(function() {\n  module.exports = function(context) {\n    var buffer, data, frameCount, n, node;\n    node = context.createBufferSource();\n    frameCount = context.sampleRate * 2;\n    buffer = context.createBuffer(1, frameCount, context.sampleRate);\n    data = buffer.getChannelData(0);\n    n = 0;\n    while (n < frameCount) {\n      data[n] = Math.random() * 2 - 1;\n      n += 1;\n    }\n    node.buffer = buffer;\n    node.loop = true;\n    node.start(0);\n    return node;\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "note_frequencies": {
      "path": "note_frequencies",
      "content": "(function() {\n  var _i, _results;\n\n  module.exports = (function() {\n    _results = [];\n    for (_i = 0; _i <= 127; _i++){ _results.push(_i); }\n    return _results;\n  }).apply(this).map(function(n) {\n    var semitonesFromA4;\n    semitonesFromA4 = n - 69;\n    return Math.pow(2, semitonesFromA4 / 12) * 440;\n  });\n\n}).call(this);\n",
      "type": "blob"
    },
    "osc": {
      "path": "osc",
      "content": "(function() {\n  module.exports = function(context, type) {\n    var osc;\n    osc = context.createOscillator();\n    osc.type = type;\n    osc.start();\n    return osc;\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "piano": {
      "path": "piano",
      "content": "(function() {\n  var TouchCanvas;\n\n  TouchCanvas = require(\"touch-canvas\");\n\n  module.exports = function() {\n    var canvas, ids, onNotes, range, self;\n    range = 24;\n    onNotes = [];\n    ids = [];\n    canvas = TouchCanvas();\n    canvas.on(\"touch\", function(p) {\n      var note;\n      note = Math.floor(p.x * range);\n      return self.playNote(note, p.identifier);\n    });\n    canvas.on(\"release\", function(p) {\n      return self.releaseNote(p.identifier);\n    });\n    return self = {\n      releaseNote: function(identifier) {\n        return onNotes[ids[identifier]] = false;\n      },\n      playNote: function(note, identifier) {\n        onNotes[note] = true;\n        return ids[identifier] = note;\n      },\n      element: function() {\n        return canvas.element();\n      },\n      draw: function() {\n        var height, n, width, _i, _results;\n        n = range;\n        canvas.clear();\n        width = canvas.width() / n;\n        height = canvas.height();\n        return (function() {\n          _results = [];\n          for (var _i = 0; 0 <= n ? _i < n : _i > n; 0 <= n ? _i++ : _i--){ _results.push(_i); }\n          return _results;\n        }).apply(this).forEach(function(n) {\n          var hue, lightness, saturation;\n          hue = (n % 12) * 360 / 12;\n          saturation = \"75%\";\n          lightness = \"50%\";\n          if (onNotes[n]) {\n            lightness = \"75%\";\n          }\n          return canvas.drawRect({\n            x: width * n,\n            y: 0,\n            width: width,\n            height: height,\n            color: \"hsl(\" + hue + \", \" + saturation + \", \" + lightness + \")\"\n          });\n        });\n      }\n    };\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "pixie": {
      "path": "pixie",
      "content": "module.exports = {\"width\":800,\"height\":450,\"dependencies\":{\"touch-canvas\":\"distri/touch-canvas:v0.3.1\"}};",
      "type": "blob"
    },
    "pulse": {
      "path": "pulse",
      "content": "(function() {\n  var constantOneCurve, pulseCurve, _i, _results;\n\n  pulseCurve = new Float32Array(256);\n\n  (function() {\n    _results = [];\n    for (_i = 0; _i < 256; _i++){ _results.push(_i); }\n    return _results;\n  }).apply(this).forEach(function(i) {\n    if (i < 128) {\n      return pulseCurve[i] = -1;\n    } else {\n      return pulseCurve[i] = 1;\n    }\n  });\n\n  constantOneCurve = new Float32Array(2);\n\n  constantOneCurve[0] = 1;\n\n  constantOneCurve[1] = 1;\n\n  module.exports = function(context) {\n    var constantOneShaper, node, pulseShaper, widthGain;\n    node = context.createOscillator();\n    node.type = \"sawtooth\";\n    node.start();\n    pulseShaper = context.createWaveShaper();\n    pulseShaper.curve = pulseCurve;\n    node.connect(pulseShaper);\n    widthGain = context.createGain();\n    widthGain.gain.value = 0.0;\n    node.width = widthGain.gain;\n    widthGain.connect(pulseShaper);\n    constantOneShaper = context.createWaveShaper();\n    constantOneShaper.curve = constantOneCurve;\n    node.connect(constantOneShaper);\n    constantOneShaper.connect(widthGain);\n    node.connect = function() {\n      return pulseShaper.connect.apply(pulseShaper, arguments);\n    };\n    node.disconnect = function() {\n      return pulseShaper.disconnect.apply(pulseShaper, arguments);\n    };\n    return node;\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "style": {
      "path": "style",
      "content": "module.exports = \"* {\\n  -ms-box-sizing: border-box;\\n  -moz-box-sizing: border-box;\\n  -webkit-box-sizing: border-box;\\n  box-sizing: border-box;\\n}\\n\\nhtml {\\n  height: 100%;\\n}\\n\\nbody {\\n  font-family: \\\"HelveticaNeue-Light\\\", \\\"Helvetica Neue Light\\\", \\\"Helvetica Neue\\\", Helvetica, Arial, \\\"Lucida Grande\\\", sans-serif;\\n  font-weight: 300;\\n  font-size: 18px;\\n  height: 100%;\\n  margin: 0;\\n  overflow: hidden;\\n  -ms-user-select: none;\\n  -moz-user-select: none;\\n  -webkit-user-select: none;\\n  user-select: none;\\n}\\n\\ncanvas {\\n  bottom: 0;\\n  position: absolute;\\n  top: 0;\\n  left: 0;\\n  right: 0;\\n  margin: auto;\\n}\";",
      "type": "blob"
    },
    "track": {
      "path": "track",
      "content": "(function() {\n  var noteFrequencies, noteNames;\n\n  noteFrequencies = require(\"./note_frequencies\");\n\n  noteNames = [\"C\", \"C#0\", \"D\", \"D#0\", \"E\", \"F\", \"F#0\", \"G\", \"G#0\", \"A\", \"A#0\", \"B\", \"C\", \"C#1\", \"D\", \"D#1\", \"E\", \"F\", \"F#1\", \"G\", \"G#1\", \"A\", \"A#1\", \"B\", \"C\", \"C#2\", \"D\", \"D#2\", \"E\", \"F\", \"F#2\", \"G\", \"G#2\", \"A\", \"A#2\", \"B\", \"C\", \"C#3\", \"D\", \"D#3\", \"E\", \"F\", \"F#3\", \"G\", \"G#3\", \"A\", \"A#3\", \"B\", \"C\", \"C#4\", \"D\", \"D#4\", \"E\", \"F\", \"F#4\", \"G\", \"G#4\", \"A\", \"A#4\", \"B\", \"C\", \"C#5\", \"D\", \"D#5\", \"E\", \"F\", \"F#5\", \"G\", \"G#5\", \"A\", \"A#5\", \"B\", \"C\", \"C#6\", \"D\", \"D#6\", \"E\", \"F\", \"F#6\", \"G\", \"G#6\", \"A\", \"A#6\", \"B\", \"C\", \"C#7\", \"D\", \"D#7\", \"E\", \"F\", \"F#7\", \"G\", \"G#7\", \"A\", \"A#7\", \"B\", \"C\", \"C#8\", \"D\", \"D#8\", \"E\", \"F\", \"F#8\", \"G\", \"G#8\", \"A\", \"A#8\", \"B\"].map(function(name, i) {\n    var n;\n    n = Math.floor(i / 12);\n    if (name.endsWith(n)) {\n      return name;\n    } else {\n      return \"\" + name + n;\n    }\n  });\n\n  module.exports = function() {\n    var data, lineHeight, self, size, width;\n    lineHeight = 20;\n    width = 60;\n    data = [32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47];\n    size = data.length;\n    data = data.map(function(d, i) {\n      if (i % 2 === 1) {\n        return 255;\n      } else {\n        return Math.floor(Math.random() * 64) + 12;\n      }\n    });\n    return self = {\n      draw: function(canvas, t, state) {\n        var activeLine;\n        activeLine = state.activeLine;\n        canvas.font(\"bold 20px monospace\");\n        return data.forEach(function(datum, line) {\n          var f, highlight, isActive, s, text, textColor, _ref;\n          textColor = \"#008800\";\n          isActive = line === activeLine;\n          s = line;\n          f = line + 1;\n          if ((s <= (_ref = t * size) && _ref < f)) {\n            highlight = \"#00FF00\";\n          }\n          if (isActive) {\n            highlight = \"#0000FF\";\n            textColor = \"#FFFFFF\";\n          }\n          if (highlight) {\n            canvas.drawRect({\n              x: 20,\n              y: line * lineHeight + 2,\n              width: width,\n              height: lineHeight,\n              color: highlight\n            });\n          }\n          if (datum === 255) {\n            text = \"□\";\n          } else if (datum != null) {\n            text = noteNames[datum];\n          } else {\n            text = \"...\";\n          }\n          return canvas.drawText({\n            x: 20,\n            y: 20 + line * lineHeight,\n            text: text,\n            color: textColor\n          });\n        });\n      },\n      update: function(frequency, vol, t, dt, state) {\n        var freq, i, noteNumber;\n        if (\"toSet\" in state) {\n          self.set(state.activeLine, state.toSet);\n          delete state.toSet;\n        }\n        i = Math.floor(t * size);\n        noteNumber = data[i];\n        if (noteNumber === 255) {\n          return vol.value = 0;\n        } else if (noteNumber != null) {\n          freq = noteFrequencies[noteNumber];\n          if (frequency) {\n            frequency.value = freq;\n          }\n          return vol.value = 1;\n        } else {\n\n        }\n      },\n      set: function(index, value) {\n        return data[index] = value;\n      }\n    };\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "sample": {
      "path": "sample",
      "content": "(function() {\n  var Ajax, toyPianoSample;\n\n  toyPianoSample = \"https://addressable.s3.amazonaws.com/composer/data/b4e7f603e5d18bfd3c97b080fbfab8a57afa9fb6\";\n\n  Ajax = require(\"./lib/ajax\");\n\n  module.exports = function() {\n    return Ajax.getBuffer(toyPianoSample + \"?xdomain\");\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "lib/sf2_parser": {
      "path": "lib/sf2_parser",
      "content": "/*! JavaScript SoundFont 2 Parser. Copyright 2013-2015 imaya/GREE Inc and Colin Clark. Licensed under the MIT License. */\n\n/*\n * JavaScript SoundFont 2 Parser\n *\n * Copyright 2013 imaya/GREE Inc\n * Copyright 2015 Colin Clark\n *\n * Based on code from the \"SoundFont Synthesizer for WebMidiLink\"\n *   https://github.com/gree/sf2synth.js\n *\n * Licensed under the MIT License.\n */\n\n/*global require*/\n\n(function (root, factory) {\n    if (typeof exports === \"object\") {\n        // We're in a CommonJS-style loader.\n        root.sf2 = exports;\n        factory(exports);\n    } else if (typeof define === \"function\" && define.amd) {\n        // We're in an AMD-style loader.\n        define([\"exports\"], function (exports) {\n            root.sf2 = exports;\n            return (root.sf2, factory(exports));\n        });\n    } else {\n        // Plain old browser.\n        root.sf2 = {};\n        factory(root.sf2);\n    }\n}(this, function (exports) {\n    \"use strict\";\n\n    var sf2 = exports;\n\n    sf2.Parser = function (input, options) {\n      options = options || {};\n      /** @type {ByteArray} */\n      this.input = input;\n      /** @type {(Object|undefined)} */\n      this.parserOptions = options.parserOptions;\n\n      /** @type {Array.<Object>} */\n      // this.presetHeader;\n      /** @type {Array.<Object>} */\n      // this.presetZone;\n      /** @type {Array.<Object>} */\n      // this.presetZoneModulator;\n      /** @type {Array.<Object>} */\n      // this.presetZoneGenerator;\n      /** @type {Array.<Object>} */\n      // this.instrument;\n      /** @type {Array.<Object>} */\n      // this.instrumentZone;\n      /** @type {Array.<Object>} */\n      // this.instrumentZoneModulator;\n      /** @type {Array.<Object>} */\n      // this.instrumentZoneGenerator;\n      /** @type {Array.<Object>} */\n      //this.sampleHeader;\n    };\n\n    sf2.Parser.prototype.parse = function () {\n      /** @type {sf2.Riff.Parser} */\n      var parser = new sf2.Riff.Parser(this.input, this.parserOptions);\n      /** @type {?sf2.Riff.Chunk} */\n      var chunk;\n\n      // parse RIFF chunk\n      parser.parse();\n      if (parser.chunkList.length !== 1) {\n        throw new Error('wrong chunk length');\n      }\n\n      chunk = parser.getChunk(0);\n      if (chunk === null) {\n        throw new Error('chunk not found');\n      }\n\n      this.parseRiffChunk(chunk);\n\n      // TODO: Presumably this is here to reduce memory,\n      // but does it really matter? Shouldn't we always be\n      // referencing the underlying ArrayBuffer and thus\n      // it will persist, in which case why delete it?\n      this.input = null;\n    };\n\n    /**\n     * @param {sf2.Riff.Chunk} chunk\n     */\n    sf2.Parser.prototype.parseRiffChunk = function (chunk) {\n      /** @type {sf2.Riff.Parser} */\n      var parser;\n      /** @type {ByteArray} */\n      var data = this.input;\n      /** @type {number} */\n      var ip = chunk.offset;\n      /** @type {string} */\n      var signature;\n\n      // check parse target\n      if (chunk.type !== 'RIFF') {\n        throw new Error('invalid chunk type:' + chunk.type);\n      }\n\n      // check signature\n      signature = String.fromCharCode(data[ip++], data[ip++], data[ip++], data[ip++]);\n      if (signature !== 'sfbk') {\n        throw new Error('invalid signature:' + signature);\n      }\n\n      // read structure\n      parser = new sf2.Riff.Parser(data, {'index': ip, 'length': chunk.size - 4});\n      parser.parse();\n      if (parser.getNumberOfChunks() !== 3) {\n        throw new Error('invalid sfbk structure');\n      }\n\n      // INFO-list\n      this.parseInfoList(/** @type {!sf2.Riff.Chunk} */(parser.getChunk(0)));\n\n      // sdta-list\n      this.parseSdtaList(/** @type {!sf2.Riff.Chunk} */(parser.getChunk(1)));\n\n      // pdta-list\n      this.parsePdtaList(/** @type {!sf2.Riff.Chunk} */(parser.getChunk(2)));\n    };\n\n    /**\n     * @param {sf2.Riff.Chunk} chunk\n     */\n    sf2.Parser.prototype.parseInfoList = function (chunk) {\n      /** @type {sf2.Riff.Parser} */\n      var parser;\n      /** @type {ByteArray} */\n      var data = this.input;\n      /** @type {number} */\n      var ip = chunk.offset;\n      /** @type {string} */\n      var signature;\n\n      // check parse target\n      if (chunk.type !== 'LIST') {\n        throw new Error('invalid chunk type:' + chunk.type);\n      }\n\n      // check signature\n      signature = String.fromCharCode(data[ip++], data[ip++], data[ip++], data[ip++]);\n      if (signature !== 'INFO') {\n        throw new Error('invalid signature:' + signature);\n      }\n\n      // read structure\n      parser = new sf2.Riff.Parser(data, {'index': ip, 'length': chunk.size - 4});\n      parser.parse();\n    };\n\n    /**\n     * @param {sf2.Riff.Chunk} chunk\n     */\n    sf2.Parser.prototype.parseSdtaList = function (chunk) {\n      /** @type {sf2.Riff.Parser} */\n      var parser;\n      /** @type {ByteArray} */\n      var data = this.input;\n      /** @type {number} */\n      var ip = chunk.offset;\n      /** @type {string} */\n      var signature;\n\n      // check parse target\n      if (chunk.type !== 'LIST') {\n        throw new Error('invalid chunk type:' + chunk.type);\n      }\n\n      // check signature\n      signature = String.fromCharCode(data[ip++], data[ip++], data[ip++], data[ip++]);\n      if (signature !== 'sdta') {\n        throw new Error('invalid signature:' + signature);\n      }\n\n      // read structure\n      parser = new sf2.Riff.Parser(data, {'index': ip, 'length': chunk.size - 4});\n      parser.parse();\n      if (parser.chunkList.length !== 1) {\n        throw new Error('TODO');\n      }\n      this.samplingData =\n        /** @type {{type: string, size: number, offset: number}} */\n        (parser.getChunk(0));\n    };\n\n    /**\n     * @param {sf2.Riff.Chunk} chunk\n     */\n    sf2.Parser.prototype.parsePdtaList = function (chunk) {\n      /** @type {sf2.Riff.Parser} */\n      var parser;\n      /** @type {ByteArray} */\n      var data = this.input;\n      /** @type {number} */\n      var ip = chunk.offset;\n      /** @type {string} */\n      var signature;\n\n      // check parse target\n      if (chunk.type !== 'LIST') {\n        throw new Error('invalid chunk type:' + chunk.type);\n      }\n\n      // check signature\n      signature = String.fromCharCode(data[ip++], data[ip++], data[ip++], data[ip++]);\n      if (signature !== 'pdta') {\n        throw new Error('invalid signature:' + signature);\n      }\n\n      // read structure\n      parser = new sf2.Riff.Parser(data, {'index': ip, 'length': chunk.size - 4});\n      parser.parse();\n\n      // check number of chunks\n      if (parser.getNumberOfChunks() !== 9) {\n        throw new Error('invalid pdta chunk');\n      }\n\n      this.parsePhdr(/** @type {sf2.Riff.Chunk} */(parser.getChunk(0)));\n      this.parsePbag(/** @type {sf2.Riff.Chunk} */(parser.getChunk(1)));\n      this.parsePmod(/** @type {sf2.Riff.Chunk} */(parser.getChunk(2)));\n      this.parsePgen(/** @type {sf2.Riff.Chunk} */(parser.getChunk(3)));\n      this.parseInst(/** @type {sf2.Riff.Chunk} */(parser.getChunk(4)));\n      this.parseIbag(/** @type {sf2.Riff.Chunk} */(parser.getChunk(5)));\n      this.parseImod(/** @type {sf2.Riff.Chunk} */(parser.getChunk(6)));\n      this.parseIgen(/** @type {sf2.Riff.Chunk} */(parser.getChunk(7)));\n      this.parseShdr(/** @type {sf2.Riff.Chunk} */(parser.getChunk(8)));\n    };\n\n    /**\n     * @param {sf2.Riff.Chunk} chunk\n     */\n    sf2.Parser.prototype.parsePhdr = function (chunk) {\n      /** @type {ByteArray} */\n      var data = this.input;\n      /** @type {number} */\n      var ip = chunk.offset;\n      /** @type {Array.<Object>} */\n      var presetHeader = this.presetHeader = [];\n      /** @type {number} */\n      var size = chunk.offset + chunk.size;\n\n      // check parse target\n      if (chunk.type !== 'phdr') {\n        throw new Error('invalid chunk type:' + chunk.type);\n      }\n\n      while (ip < size) {\n        presetHeader.push({\n          presetName: String.fromCharCode.apply(null, data.subarray(ip, ip += 20)),\n          preset: data[ip++] | (data[ip++] << 8),\n          bank: data[ip++] | (data[ip++] << 8),\n          presetBagIndex: data[ip++] | (data[ip++] << 8),\n          library: (data[ip++] | (data[ip++] << 8) | (data[ip++] << 16) | (data[ip++] << 24)) >>> 0,\n          genre: (data[ip++] | (data[ip++] << 8) | (data[ip++] << 16) | (data[ip++] << 24)) >>> 0,\n          morphology: (data[ip++] | (data[ip++] << 8) | (data[ip++] << 16) | (data[ip++] << 24)) >>> 0\n        });\n      }\n    };\n\n    /**\n     * @param {sf2.Riff.Chunk} chunk\n     */\n    sf2.Parser.prototype.parsePbag = function (chunk) {\n      /** @type {ByteArray} */\n      var data = this.input;\n      /** @type {number} */\n      var ip = chunk.offset;\n      /** @type {Array.<Object>} */\n      var presetZone = this.presetZone = [];\n      /** @type {number} */\n      var size = chunk.offset + chunk.size;\n\n      // check parse target\n      if (chunk.type !== 'pbag') {\n        throw new Error('invalid chunk type:'  + chunk.type);\n      }\n\n      while (ip < size) {\n        presetZone.push({\n          presetGeneratorIndex: data[ip++] | (data[ip++] << 8),\n          presetModulatorIndex: data[ip++] | (data[ip++] << 8)\n        });\n      }\n    };\n\n    /**\n     * @param {sf2.Riff.Chunk} chunk\n     */\n    sf2.Parser.prototype.parsePmod = function (chunk) {\n      // check parse target\n      if (chunk.type !== 'pmod') {\n        throw new Error('invalid chunk type:' + chunk.type);\n      }\n\n      this.presetZoneModulator = this.parseModulator(chunk);\n    };\n\n    /**\n     * @param {sf2.Riff.Chunk} chunk\n     */\n    sf2.Parser.prototype.parsePgen = function (chunk) {\n      // check parse target\n      if (chunk.type !== 'pgen') {\n        throw new Error('invalid chunk type:' + chunk.type);\n      }\n      this.presetZoneGenerator = this.parseGenerator(chunk);\n    };\n\n    /**\n     * @param {sf2.Riff.Chunk} chunk\n     */\n    sf2.Parser.prototype.parseInst = function (chunk) {\n      /** @type {ByteArray} */\n      var data = this.input;\n      /** @type {number} */\n      var ip = chunk.offset;\n      /** @type {Array.<Object>} */\n      var instrument = this.instrument = [];\n      /** @type {number} */\n      var size = chunk.offset + chunk.size;\n\n      // check parse target\n      if (chunk.type !== 'inst') {\n        throw new Error('invalid chunk type:' + chunk.type);\n      }\n\n      while (ip < size) {\n        instrument.push({\n          instrumentName: String.fromCharCode.apply(null, data.subarray(ip, ip += 20)),\n          instrumentBagIndex: data[ip++] | (data[ip++] << 8)\n        });\n      }\n    };\n\n    /**\n     * @param {sf2.Riff.Chunk} chunk\n     */\n    sf2.Parser.prototype.parseIbag = function (chunk) {\n      /** @type {ByteArray} */\n      var data = this.input;\n      /** @type {number} */\n      var ip = chunk.offset;\n      /** @type {Array.<Object>} */\n      var instrumentZone = this.instrumentZone = [];\n      /** @type {number} */\n      var size = chunk.offset + chunk.size;\n\n      // check parse target\n      if (chunk.type !== 'ibag') {\n        throw new Error('invalid chunk type:' + chunk.type);\n      }\n\n\n      while (ip < size) {\n        instrumentZone.push({\n          instrumentGeneratorIndex: data[ip++] | (data[ip++] << 8),\n          instrumentModulatorIndex: data[ip++] | (data[ip++] << 8)\n        });\n      }\n    };\n\n    /**\n     * @param {sf2.Riff.Chunk} chunk\n     */\n    sf2.Parser.prototype.parseImod = function (chunk) {\n      // check parse target\n      if (chunk.type !== 'imod') {\n        throw new Error('invalid chunk type:' + chunk.type);\n      }\n\n      this.instrumentZoneModulator = this.parseModulator(chunk);\n    };\n\n\n    /**\n     * @param {sf2.Riff.Chunk} chunk\n     */\n    sf2.Parser.prototype.parseIgen = function (chunk) {\n      // check parse target\n      if (chunk.type !== 'igen') {\n        throw new Error('invalid chunk type:' + chunk.type);\n      }\n\n      this.instrumentZoneGenerator = this.parseGenerator(chunk);\n    };\n\n    /**\n     * @param {sf2.Riff.Chunk} chunk\n     */\n    sf2.Parser.prototype.parseShdr = function (chunk) {\n      /** @type {ByteArray} */\n      var data = this.input;\n      /** @type {number} */\n      var ip = chunk.offset;\n      /** @type {Array.<Object>} */\n      var samples = this.sample = [];\n      /** @type {Array.<Object>} */\n      var sampleHeader = this.sampleHeader = [];\n      /** @type {number} */\n      var size = chunk.offset + chunk.size;\n      /** @type {string} */\n      var sampleName;\n      /** @type {number} */\n      var start;\n      /** @type {number} */\n      var end;\n      /** @type {number} */\n      var startLoop;\n      /** @type {number} */\n      var endLoop;\n      /** @type {number} */\n      var sampleRate;\n      /** @type {number} */\n      var originalPitch;\n      /** @type {number} */\n      var pitchCorrection;\n      /** @type {number} */\n      var sampleLink;\n      /** @type {number} */\n      var sampleType;\n\n      // check parse target\n      if (chunk.type !== 'shdr') {\n        throw new Error('invalid chunk type:' + chunk.type);\n      }\n\n      while (ip < size) {\n        sampleName = String.fromCharCode.apply(null, data.subarray(ip, ip += 20));\n        start = (\n          (data[ip++] << 0) | (data[ip++] << 8) | (data[ip++] << 16) | (data[ip++] << 24)\n        ) >>> 0;\n        end = (\n          (data[ip++] << 0) | (data[ip++] << 8) | (data[ip++] << 16) | (data[ip++] << 24)\n        ) >>> 0;\n        startLoop = (\n          (data[ip++] << 0) | (data[ip++] << 8) | (data[ip++] << 16) | (data[ip++] << 24)\n        ) >>> 0;\n        endLoop =  (\n          (data[ip++] << 0) | (data[ip++] << 8) | (data[ip++] << 16) | (data[ip++] << 24)\n        ) >>> 0;\n        sampleRate = (\n          (data[ip++] << 0) | (data[ip++] << 8) | (data[ip++] << 16) | (data[ip++] << 24)\n        ) >>> 0;\n        originalPitch = data[ip++];\n        pitchCorrection = (data[ip++] << 24) >> 24;\n        sampleLink = data[ip++] | (data[ip++] << 8);\n        sampleType = data[ip++] | (data[ip++] << 8);\n\n        var sample = new Int16Array(new Uint8Array(data.subarray(\n          this.samplingData.offset + start * 2,\n          this.samplingData.offset + end   * 2\n        )).buffer);\n\n        startLoop -= start;\n        endLoop -= start;\n\n        if (sampleRate > 0) {\n          var adjust = this.adjustSampleData(sample, sampleRate);\n          sample = adjust.sample;\n          sampleRate *= adjust.multiply;\n          startLoop *= adjust.multiply;\n          endLoop *= adjust.multiply;\n        }\n\n        samples.push(sample);\n\n        sampleHeader.push({\n          sampleName: sampleName,\n          /*\n          start: start,\n          end: end,\n          */\n          startLoop: startLoop,\n          endLoop: endLoop,\n          sampleRate: sampleRate,\n          originalPitch: originalPitch,\n          pitchCorrection: pitchCorrection,\n          sampleLink: sampleLink,\n          sampleType: sampleType\n        });\n      }\n    };\n\n    // TODO: This function is questionable;\n    // it doesn't interpolate the sample data\n    // and always forces a sample rate of 22050 or higher. Why?\n    sf2.Parser.prototype.adjustSampleData = function (sample, sampleRate) {\n      /** @type {Int16Array} */\n      var newSample;\n      /** @type {number} */\n      var i;\n      /** @type {number} */\n      var il;\n      /** @type {number} */\n      var j;\n      /** @type {number} */\n      var multiply = 1;\n\n      // buffer\n      while (sampleRate < 22050) {\n        newSample = new Int16Array(sample.length * 2);\n        for (i = j = 0, il = sample.length; i < il; ++i) {\n          newSample[j++] = sample[i];\n          newSample[j++] = sample[i];\n        }\n        sample = newSample;\n        multiply *= 2;\n        sampleRate *= 2;\n      }\n\n      return {\n        sample: sample,\n        multiply: multiply\n      };\n    };\n\n    /**\n     * @param {sf2.Riff.Chunk} chunk\n     * @return {Array.<Object>}\n     */\n    sf2.Parser.prototype.parseModulator = function (chunk) {\n        /** @type {ByteArray} */\n        var data = this.input;\n        /** @type {number} */\n        var ip = chunk.offset;\n        /** @type {number} */\n        var size = chunk.offset + chunk.size;\n        /** @type {number} */\n        var code;\n        /** @type {string} */\n        var key;\n        /** @type {Array.<Object>} */\n        var output = [];\n\n        while (ip < size) {\n          // Src  Oper\n          // TODO\n          ip += 2;\n\n          // Dest Oper\n          code = data[ip++] | (data[ip++] << 8);\n          key = sf2.Parser.GeneratorEnumeratorTable[code];\n          if (key === undefined) {\n            // Amount\n            output.push({\n              type: key,\n              value: {\n                code: code,\n                amount: data[ip] | (data[ip+1] << 8) << 16 >> 16,\n                lo: data[ip++],\n                hi: data[ip++]\n              }\n            });\n          } else {\n            // Amount\n            switch (key) {\n              case 'keyRange': /* FALLTHROUGH */\n              case 'velRange': /* FALLTHROUGH */\n              case 'keynum': /* FALLTHROUGH */\n              case 'velocity':\n                output.push({\n                  type: key,\n                  value: {\n                    lo: data[ip++],\n                    hi: data[ip++]\n                  }\n                });\n                break;\n              default:\n                output.push({\n                  type: key,\n                  value: {\n                    amount: data[ip++] | (data[ip++] << 8) << 16 >> 16\n                  }\n                });\n                break;\n            }\n          }\n\n          // AmtSrcOper\n          // TODO\n          ip += 2;\n\n          // Trans Oper\n          // TODO\n          ip += 2;\n        }\n\n        return output;\n      };\n\n    /**\n     * @param {sf2.Riff.Chunk} chunk\n     * @return {Array.<Object>}\n     */\n    sf2.Parser.prototype.parseGenerator = function (chunk) {\n      /** @type {ByteArray} */\n      var data = this.input;\n      /** @type {number} */\n      var ip = chunk.offset;\n      /** @type {number} */\n      var size = chunk.offset + chunk.size;\n      /** @type {number} */\n      var code;\n      /** @type {string} */\n      var key;\n      /** @type {Array.<Object>} */\n      var output = [];\n\n      while (ip < size) {\n        code = data[ip++] | (data[ip++] << 8);\n        key = sf2.Parser.GeneratorEnumeratorTable[code];\n        if (key === undefined) {\n          output.push({\n            type: key,\n            value: {\n              code: code,\n              amount: data[ip] | (data[ip+1] << 8) << 16 >> 16,\n              lo: data[ip++],\n              hi: data[ip++]\n            }\n          });\n          continue;\n        }\n\n        switch (key) {\n          case 'keynum': /* FALLTHROUGH */\n          case 'keyRange': /* FALLTHROUGH */\n          case 'velRange': /* FALLTHROUGH */\n          case 'velocity':\n            output.push({\n              type: key,\n              value: {\n                lo: data[ip++],\n                hi: data[ip++]\n              }\n            });\n            break;\n          default:\n            output.push({\n              type: key,\n              value: {\n                amount: data[ip++] | (data[ip++] << 8) << 16 >> 16\n              }\n            });\n            break;\n        }\n      }\n\n      return output;\n    };\n\n    sf2.Parser.prototype.getInstruments = function () {\n      /** @type {Array.<Object>} */\n      var instrument = this.instrument;\n      /** @type {Array.<Object>} */\n      var zone = this.instrumentZone;\n      /** @type {Array.<Object>} */\n      var output = [];\n      /** @type {number} */\n      var bagIndex;\n      /** @type {number} */\n      var bagIndexEnd;\n      /** @type {Array.<Object>} */\n      var zoneInfo;\n      /** @type {{generator: Object, generatorInfo: Array.<Object>}} */\n      var instrumentGenerator;\n      /** @type {{modulator: Object, modulatorInfo: Array.<Object>}} */\n      var instrumentModulator;\n      /** @type {number} */\n      var i;\n      /** @type {number} */\n      var il;\n      /** @type {number} */\n      var j;\n      /** @type {number} */\n      var jl;\n\n      // instrument -> instrument bag -> generator / modulator\n      for (i = 0, il = instrument.length; i < il; ++i) {\n        bagIndex    = instrument[i].instrumentBagIndex;\n        bagIndexEnd = instrument[i+1] ? instrument[i+1].instrumentBagIndex : zone.length;\n        zoneInfo = [];\n\n        // instrument bag\n        for (j = bagIndex, jl = bagIndexEnd; j < jl; ++j) {\n          instrumentGenerator = this.createInstrumentGenerator_(zone, j);\n          instrumentModulator = this.createInstrumentModulator_(zone, j);\n\n          zoneInfo.push({\n            generator: instrumentGenerator.generator,\n            generatorSequence: instrumentGenerator.generatorInfo,\n            modulator: instrumentModulator.modulator,\n            modulatorSequence: instrumentModulator.modulatorInfo\n          });\n        }\n\n        output.push({\n          name: instrument[i].instrumentName,\n          info: zoneInfo\n        });\n      }\n\n      return output;\n    };\n\n    sf2.Parser.prototype.getPresets = function () {\n      /** @type {Array.<Object>} */\n      var preset   = this.presetHeader;\n      /** @type {Array.<Object>} */\n      var zone = this.presetZone;\n      /** @type {Array.<Object>} */\n      var output = [];\n      /** @type {number} */\n      var bagIndex;\n      /** @type {number} */\n      var bagIndexEnd;\n      /** @type {Array.<Object>} */\n      var zoneInfo;\n      /** @type {number} */\n      var instrument;\n      /** @type {{generator: Object, generatorInfo: Array.<Object>}} */\n      var presetGenerator;\n      /** @type {{modulator: Object, modulatorInfo: Array.<Object>}} */\n      var presetModulator;\n      /** @type {number} */\n      var i;\n      /** @type {number} */\n      var il;\n      /** @type {number} */\n      var j;\n      /** @type {number} */\n      var jl;\n\n      // preset -> preset bag -> generator / modulator\n      for (i = 0, il = preset.length; i < il; ++i) {\n        bagIndex    = preset[i].presetBagIndex;\n        bagIndexEnd = preset[i+1] ? preset[i+1].presetBagIndex : zone.length;\n        zoneInfo = [];\n\n        // preset bag\n        for (j = bagIndex, jl = bagIndexEnd; j < jl; ++j) {\n          presetGenerator = this.createPresetGenerator_(zone, j);\n          presetModulator = this.createPresetModulator_(zone, j);\n\n          zoneInfo.push({\n            generator: presetGenerator.generator,\n            generatorSequence: presetGenerator.generatorInfo,\n            modulator: presetModulator.modulator,\n            modulatorSequence: presetModulator.modulatorInfo\n          });\n\n          instrument =\n            presetGenerator.generator.instrument !== undefined ?\n              presetGenerator.generator.instrument.amount :\n            presetModulator.modulator.instrument !== undefined ?\n              presetModulator.modulator.instrument.amount :\n            null;\n        }\n\n        output.push({\n          name: preset[i].presetName,\n          info: zoneInfo,\n          header: preset[i],\n          instrument: instrument\n        });\n      }\n\n      return output;\n    };\n\n    /**\n     * @param {Array.<Object>} zone\n     * @param {number} index\n     * @returns {{generator: Object, generatorInfo: Array.<Object>}}\n     * @private\n     */\n    sf2.Parser.prototype.createInstrumentGenerator_ = function (zone, index) {\n      var modgen = this.createBagModGen_(\n        zone,\n        zone[index].instrumentGeneratorIndex,\n        zone[index+1] ? zone[index+1].instrumentGeneratorIndex: this.instrumentZoneGenerator.length,\n        this.instrumentZoneGenerator\n      );\n\n      return {\n        generator: modgen.modgen,\n        generatorInfo: modgen.modgenInfo\n      };\n    };\n\n    /**\n     * @param {Array.<Object>} zone\n     * @param {number} index\n     * @returns {{modulator: Object, modulatorInfo: Array.<Object>}}\n     * @private\n     */\n    sf2.Parser.prototype.createInstrumentModulator_ = function (zone, index) {\n      var modgen = this.createBagModGen_(\n        zone,\n        zone[index].presetModulatorIndex,\n        zone[index+1] ? zone[index+1].instrumentModulatorIndex: this.instrumentZoneModulator.length,\n        this.instrumentZoneModulator\n      );\n\n      return {\n        modulator: modgen.modgen,\n        modulatorInfo: modgen.modgenInfo\n      };\n    };\n\n    /**\n     * @param {Array.<Object>} zone\n     * @param {number} index\n     * @returns {{generator: Object, generatorInfo: Array.<Object>}}\n     * @private\n     */\n    sf2.Parser.prototype.createPresetGenerator_ = function (zone, index) {\n      var modgen = this.createBagModGen_(\n        zone,\n        zone[index].presetGeneratorIndex,\n        zone[index+1] ? zone[index+1].presetGeneratorIndex : this.presetZoneGenerator.length,\n        this.presetZoneGenerator\n      );\n\n      return {\n        generator: modgen.modgen,\n        generatorInfo: modgen.modgenInfo\n      };\n    };\n\n      /**\n       * @param {Array.<Object>} zone\n       * @param {number} index\n       * @returns {{modulator: Object, modulatorInfo: Array.<Object>}}\n       * @private\n       */\n    sf2.Parser.prototype.createPresetModulator_ = function (zone, index) {\n      /** @type {{modgen: Object, modgenInfo: Array.<Object>}} */\n      var modgen = this.createBagModGen_(\n        zone,\n        zone[index].presetModulatorIndex,\n        zone[index+1] ? zone[index+1].presetModulatorIndex : this.presetZoneModulator.length,\n        this.presetZoneModulator\n      );\n\n      return {\n        modulator: modgen.modgen,\n        modulatorInfo: modgen.modgenInfo\n      };\n    };\n\n    /**\n     * @param {Array.<Object>} zone\n     * @param {number} indexStart\n     * @param {number} indexEnd\n     * @param zoneModGen\n     * @returns {{modgen: Object, modgenInfo: Array.<Object>}}\n     * @private\n     */\n    sf2.Parser.prototype.createBagModGen_ = function (zone, indexStart, indexEnd, zoneModGen) {\n      /** @type {Array.<Object>} */\n      var modgenInfo = [];\n      /** @type {Object} */\n      var modgen = {\n        unknown: [],\n        'keyRange': {\n          hi: 127,\n          lo: 0\n        }\n      }; // TODO\n      /** @type {Object} */\n      var info;\n      /** @type {number} */\n      var i;\n      /** @type {number} */\n      var il;\n\n      for (i = indexStart, il = indexEnd; i < il; ++i) {\n        info = zoneModGen[i];\n        modgenInfo.push(info);\n\n        if (info.type === 'unknown') {\n          modgen.unknown.push(info.value);\n        } else {\n          modgen[info.type] = info.value;\n        }\n      }\n\n      return {\n        modgen: modgen,\n        modgenInfo: modgenInfo\n      };\n    };\n\n\n    /**\n     * @type {Array.<string>}\n     * @const\n     */\n    sf2.Parser.GeneratorEnumeratorTable = [\n      'startAddrsOffset',\n      'endAddrsOffset',\n      'startloopAddrsOffset',\n      'endloopAddrsOffset',\n      'startAddrsCoarseOffset',\n      'modLfoToPitch',\n      'vibLfoToPitch',\n      'modEnvToPitch',\n      'initialFilterFc',\n      'initialFilterQ',\n      'modLfoToFilterFc',\n      'modEnvToFilterFc',\n      'endAddrsCoarseOffset',\n      'modLfoToVolume',\n      undefined, // 14\n      'chorusEffectsSend',\n      'reverbEffectsSend',\n      'pan',\n      undefined,\n      undefined,\n      undefined, // 18,19,20\n      'delayModLFO',\n      'freqModLFO',\n      'delayVibLFO',\n      'freqVibLFO',\n      'delayModEnv',\n      'attackModEnv',\n      'holdModEnv',\n      'decayModEnv',\n      'sustainModEnv',\n      'releaseModEnv',\n      'keynumToModEnvHold',\n      'keynumToModEnvDecay',\n      'delayVolEnv',\n      'attackVolEnv',\n      'holdVolEnv',\n      'decayVolEnv',\n      'sustainVolEnv',\n      'releaseVolEnv',\n      'keynumToVolEnvHold',\n      'keynumToVolEnvDecay',\n      'instrument',\n      undefined, // 42\n      'keyRange',\n      'velRange',\n      'startloopAddrsCoarseOffset',\n      'keynum',\n      'velocity',\n      'initialAttenuation',\n      undefined, // 49\n      'endloopAddrsCoarseOffset',\n      'coarseTune',\n      'fineTune',\n      'sampleID',\n      'sampleModes',\n      undefined, // 55\n      'scaleTuning',\n      'exclusiveClass',\n      'overridingRootKey'\n    ];\n\n\n    sf2.Riff = {};\n\n    sf2.Riff.Parser = function (input, options) {\n      options = options || {};\n      /** @type {ByteArray} */\n      this.input = input;\n      /** @type {number} */\n      this.ip = options.index || 0;\n      /** @type {number} */\n      this.length = options.length || input.length - this.ip;\n      /** @type {Array.<sf2.Riff.Chunk>} */\n    //   this.chunkList;\n      /** @type {number} */\n      this.offset = this.ip;\n      /** @type {boolean} */\n      this.padding = options.padding !== undefined ? options.padding : true;\n      /** @type {boolean} */\n      this.bigEndian = options.bigEndian !== undefined ? options.bigEndian : false;\n    };\n\n    /**\n     * @param {string} type\n     * @param {number} size\n     * @param {number} offset\n     * @constructor\n     */\n    sf2.Riff.Chunk = function (type, size, offset) {\n      /** @type {string} */\n      this.type = type;\n      /** @type {number} */\n      this.size = size;\n      /** @type {number} */\n      this.offset = offset;\n    };\n\n    sf2.Riff.Parser.prototype.parse = function () {\n      /** @type {number} */\n      var length = this.length + this.offset;\n\n      this.chunkList = [];\n\n      while (this.ip < length) {\n        this.parseChunk();\n      }\n    };\n\n    sf2.Riff.Parser.prototype.parseChunk = function () {\n      /** @type {ByteArray} */\n      var input = this.input;\n      /** @type {number} */\n      var ip = this.ip;\n      /** @type {number} */\n      var size;\n\n      this.chunkList.push(new sf2.Riff.Chunk(\n        String.fromCharCode(input[ip++], input[ip++], input[ip++], input[ip++]),\n        (size = this.bigEndian ?\n           ((input[ip++] << 24) | (input[ip++] << 16) |\n            (input[ip++] <<  8) | (input[ip++]      )) >>> 0 :\n           ((input[ip++]      ) | (input[ip++] <<  8) |\n            (input[ip++] << 16) | (input[ip++] << 24)) >>> 0\n        ),\n        ip\n      ));\n\n      ip += size;\n\n      // padding\n      if (this.padding && ((ip - this.offset) & 1) === 1) {\n        ip++;\n      }\n\n      this.ip = ip;\n    };\n\n    /**\n     * @param {number} index chunk index.\n     * @return {?sf2.Riff.Chunk}\n     */\n    sf2.Riff.Parser.prototype.getChunk = function (index) {\n      /** @type {sf2.Riff.Chunk} */\n      var chunk = this.chunkList[index];\n\n      if (chunk === undefined) {\n        return null;\n      }\n\n      return chunk;\n    };\n\n    /**\n     * @return {number}\n     */\n    sf2.Riff.Parser.prototype.getNumberOfChunks = function () {\n      return this.chunkList.length;\n    };\n\n\n    return sf2;\n}));",
      "type": "blob"
    },
    "load-n-play-midi": {
      "path": "load-n-play-midi",
      "content": "(function() {\n  var Ajax;\n\n  Ajax = require(\"./lib/ajax\");\n\n  module.exports = function(context, Player) {\n    var Drop, MidiFile, MidiPlayer, badApple, jordan, loadFile, readFile, waltz;\n    readFile = require(\"./lib/read_file\");\n    Drop = require(\"./lib/drop\");\n    Drop(document, function(e) {\n      var file;\n      file = e.dataTransfer.files[0];\n      if (file) {\n        return readFile(file, \"readAsArrayBuffer\");\n      }\n    });\n    loadFile = function(file) {};\n    MidiFile = require(\"./lib/midifile\");\n    MidiPlayer = require(\"./midi_player\");\n    badApple = \"http://whimsy.space/danielx/data/clOXhtZz4VcunDJZdCM8T5pjBPKQaLCYCzbDod39Vbg\";\n    waltz = \"http://whimsy.space/danielx/data/qxIFNrVVEqhwmwUO5wWyZKk1IwGgQIxqvLQ9WX0X20E\";\n    jordan = \"http://whimsy.space/danielx/data/FhSh0qeVTMu9Xwd4vihF6shaPJsD_rM8t1OSKGl-ir4\";\n    require(\"./sample\")().then(function(buffer) {\n      return context.decodeAudioData(buffer, function(audioBuffer) {\n        return global.sample = audioBuffer;\n      }, function(err) {\n        return console.error('Iam error');\n      });\n    });\n    return Ajax.getBuffer(jordan).then(function(buffer) {\n      var array, consumeEventsUntilTime, currentState, handleEvent, meta, midiFile, playNote, player, releaseNote, timeOffset, _ref;\n      array = new Uint8Array(buffer);\n      midiFile = MidiFile(array);\n      console.log(midiFile);\n      player = MidiPlayer(midiFile);\n      _ref = Player(), playNote = _ref.playNote, releaseNote = _ref.releaseNote;\n      meta = {};\n      handleEvent = function(event, state) {\n        var deltaTime, noteNumber, subtype, time, type, velocity;\n        time = state.time;\n        deltaTime = event.deltaTime, noteNumber = event.noteNumber, subtype = event.subtype, type = event.type, velocity = event.velocity;\n        switch (\"\" + type + \":\" + subtype) {\n          case \"channel:controller\":\n            break;\n          case \"channel:noteOn\":\n            playNote(noteNumber, velocity, time + timeOffset);\n            break;\n          case \"channel:noteOff\":\n            releaseNote(noteNumber, time + timeOffset);\n            break;\n          case \"channel:programChange\":\n            break;\n          case \"meta:copyrightNotice\":\n            if (meta.copyrightNotice) {\n              meta.copyrightNotice += \"/n\" + event.text;\n            } else {\n              meta.copyrightNotice = event.text;\n            }\n            break;\n          case \"meta:keySignature\":\n            meta.keySignature = {\n              scale: event.scale,\n              key: event.key\n            };\n            break;\n          case \"meta:setTempo\":\n            state.microsecondsPerBeat = event.microsecondsPerBeat;\n            break;\n          case \"meta:text\":\n            if (meta.text) {\n              meta.text += \"/n\" + event.text;\n            } else {\n              meta.text = event.text;\n            }\n            break;\n          case \"meta:timeSignature\":\n            meta.timeSignature = {\n              denominator: event.denominator,\n              metronome: event.metronome,\n              numerator: event.numerator,\n              thirtyseconds: event.thirtySeconds\n            };\n            break;\n          case \"meta:trackName\":\n            meta.trackName = event.text;\n            break;\n          case \"meta:unknown\":\n            break;\n          default:\n            console.log(\"Unknown\", event);\n        }\n        return state;\n      };\n      timeOffset = context.currentTime;\n      currentState = player.initialState;\n      consumeEventsUntilTime = function(t) {\n        var count, event, nextState, _ref1;\n        count = 0;\n        while (currentState.time < t) {\n          _ref1 = player.readEvent(currentState, true), event = _ref1[0], nextState = _ref1[1];\n          if (!event) {\n            break;\n          }\n          currentState = handleEvent(event, nextState);\n          count += 1;\n        }\n        return count;\n      };\n      return setInterval(function() {\n        var consumed;\n        return consumed = consumeEventsUntilTime(context.currentTime - timeOffset + 0.025);\n      }, 15);\n    });\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "load-sound-font": {
      "path": "load-sound-font",
      "content": "(function() {\n  var Ajax, loadSoundFont;\n\n  Ajax = require(\"./lib/ajax\");\n\n  loadSoundFont = function() {\n    var SF2Parser, soundFontURL;\n    SF2Parser = require(\"./lib/sf2_parser\");\n    console.log(SF2Parser);\n    soundFontURL = \"http://whimsy.space/danielx/data/nzn8U706GmnxPLSGg4lE7e01iztuivvWwcLDNnWyA0s\";\n    return Ajax.getBuffer(soundFontURL).then(function(buffer) {\n      var data, parser;\n      parser = new SF2Parser.Parser(new Uint8Array(buffer));\n      data = parser.parse();\n      return console.log(parser, data);\n    });\n  };\n\n  loadSoundFont();\n\n}).call(this);\n",
      "type": "blob"
    }
  },
  "progenitor": {
    "url": "http://www.danielx.net/editor/"
  },
  "entryPoint": "main",
  "repository": {
    "branch": "sound-fonts",
    "default_branch": "master",
    "full_name": "STRd6/2A03",
    "homepage": null,
    "description": "Experimenting with NES soundz",
    "html_url": "https://github.com/STRd6/2A03",
    "url": "https://api.github.com/repos/STRd6/2A03",
    "publishBranch": "gh-pages"
  },
  "dependencies": {
    "touch-canvas": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "mode": "100644",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
          "type": "blob"
        },
        "README.md": {
          "path": "README.md",
          "mode": "100644",
          "content": "touch-canvas\n============\n\nA canvas you can touch\n",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "mode": "100644",
          "content": "entryPoint: \"touch_canvas\"\nversion: \"0.3.1\"\ndependencies:\n  \"bindable\": \"distri/bindable:v0.1.0\"\n  \"core\": \"distri/core:v0.6.0\"\n  \"pixie-canvas\": \"distri/pixie-canvas:v0.9.2\"\n",
          "type": "blob"
        },
        "touch_canvas.coffee.md": {
          "path": "touch_canvas.coffee.md",
          "mode": "100644",
          "content": "Touch Canvas\n============\n\nDemo\n----\n\n>     #! demo\n>     paint = (position) ->\n>       x = position.x * canvas.width()\n>       y = position.y * canvas.height()\n>\n>       canvas.drawCircle\n>         radius: 10\n>         color: \"red\"\n>         position:\n>           x: x\n>           y: y\n>\n>     canvas.on \"touch\", (p) ->\n>       paint(p)\n>\n>     canvas.on \"move\", (p) ->\n>       paint(p)\n\n----\n\nImplementation\n--------------\n\nA canvas element that reports mouse and touch events in the range [0, 1].\n\n    Bindable = require \"bindable\"\n    Core = require \"core\"\n    PixieCanvas = require \"pixie-canvas\"\n\nA number really close to 1. We should never actually return 1, but move events\nmay get a little fast and loose with exiting the canvas, so let's play it safe.\n\n    MAX = 0.999999999999\n\n    TouchCanvas = (I={}) ->\n      self = PixieCanvas I\n\n      Core(I, self)\n\n      self.include Bindable\n\n      element = self.element()\n\n      # Keep track of if the mouse is active in the element\n      active = false\n\nWhen we click within the canvas set the value for the position we clicked at.\n\n      listen element, \"mousedown\", (e) ->\n        active = true\n\n        self.trigger \"touch\", localPosition(e)\n\nHandle touch starts\n\n      listen element, \"touchstart\", (e) ->\n        # Global `event`\n        processTouches event, (touch) ->\n          self.trigger \"touch\", localPosition(touch)\n\nWhen the mouse moves apply a change for each x value in the intervening positions.\n\n      listen element, \"mousemove\", (e) ->\n        if active\n          self.trigger \"move\", localPosition(e)\n\nHandle moves outside of the element.\n\n      listen document, \"mousemove\", (e) ->\n        if active\n          self.trigger \"move\", localPosition(e)\n\nHandle touch moves.\n\n      listen element, \"touchmove\", (e) ->\n        # Global `event`\n        processTouches event, (touch) ->\n          self.trigger \"move\", localPosition(touch)\n\nHandle releases.\n\n      listen element, \"mouseup\", (e) ->\n        self.trigger \"release\", localPosition(e)\n        active = false\n\n        return\n\nHandle touch ends.\n\n      listen element, \"touchend\", (e) ->\n        # Global `event`\n        processTouches event, (touch) ->\n          self.trigger \"release\", localPosition(touch)\n\nWhenever the mouse button is released from anywhere, deactivate. Be sure to\ntrigger the release event if the mousedown started within the element.\n\n      listen document, \"mouseup\", (e) ->\n        if active\n          self.trigger \"release\", localPosition(e)\n\n        active = false\n\n        return\n\nHelpers\n-------\n\nProcess touches\n\n      processTouches = (event, fn) ->\n        event.preventDefault()\n\n        if event.type is \"touchend\"\n          # touchend doesn't have any touches, but does have changed touches\n          touches = event.changedTouches\n        else\n          touches = event.touches\n\n        self.debug? Array::map.call touches, ({identifier, pageX, pageY}) ->\n          \"[#{identifier}: #{pageX}, #{pageY} (#{event.type})]\\n\"\n\n        Array::forEach.call touches, fn\n\nLocal event position.\n\n      localPosition = (e) ->\n        rect = element.getBoundingClientRect()\n\n        point =\n          x: clamp (e.pageX - rect.left) / rect.width, 0, MAX\n          y: clamp (e.pageY - rect.top) / rect.height, 0, MAX\n\n        # Add mouse into touch identifiers as 0\n        point.identifier = (e.identifier + 1) or 0\n\n        return point\n\nReturn self\n\n      return self\n\nAttach an event listener to an element\n\n    listen = (element, event, handler) ->\n      element.addEventListener(event, handler, false)\n\nClamp a number to be within a range.\n\n    clamp = (number, min, max) ->\n      Math.min(Math.max(number, min), max)\n\nExport\n\n    module.exports = TouchCanvas\n\nInteractive Examples\n--------------------\n\n>     #! setup\n>     TouchCanvas = require \"/touch_canvas\"\n>\n>     Interactive.register \"demo\", ({source, runtimeElement}) ->\n>       canvas = TouchCanvas\n>         width: 400\n>         height: 200\n>\n>       code = CoffeeScript.compile(source)\n>\n>       runtimeElement.empty().append canvas.element()\n>       Function(\"canvas\", code)(canvas)\n",
          "type": "blob"
        },
        "test/touch.coffee": {
          "path": "test/touch.coffee",
          "mode": "100644",
          "content": "TouchCanvas = require \"../touch_canvas\"\n\nextend = (target, sources...) ->\n  for source in sources\n    for name of source\n      target[name] = source[name]\n\n  return target\n\nfireEvent = (element, type, params={}) ->\n  event = document.createEvent(\"Events\")\n  event.initEvent type, true, false\n  extend event, params\n  element.dispatchEvent event\n\ndescribe \"TouchCanvas\", ->\n  it \"should be creatable\", ->\n    c = TouchCanvas()\n    assert c\n\n    document.body.appendChild(c.element())\n  \n  it \"should fire events\", (done) ->\n    canvas = TouchCanvas()\n\n    canvas.on \"touch\", (e) ->\n      done()\n\n    fireEvent canvas.element(), \"mousedown\"\n",
          "type": "blob"
        }
      },
      "distribution": {
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"entryPoint\":\"touch_canvas\",\"version\":\"0.3.1\",\"dependencies\":{\"bindable\":\"distri/bindable:v0.1.0\",\"core\":\"distri/core:v0.6.0\",\"pixie-canvas\":\"distri/pixie-canvas:v0.9.2\"}};",
          "type": "blob"
        },
        "touch_canvas": {
          "path": "touch_canvas",
          "content": "(function() {\n  var Bindable, Core, MAX, PixieCanvas, TouchCanvas, clamp, listen;\n\n  Bindable = require(\"bindable\");\n\n  Core = require(\"core\");\n\n  PixieCanvas = require(\"pixie-canvas\");\n\n  MAX = 0.999999999999;\n\n  TouchCanvas = function(I) {\n    var active, element, localPosition, processTouches, self;\n    if (I == null) {\n      I = {};\n    }\n    self = PixieCanvas(I);\n    Core(I, self);\n    self.include(Bindable);\n    element = self.element();\n    active = false;\n    listen(element, \"mousedown\", function(e) {\n      active = true;\n      return self.trigger(\"touch\", localPosition(e));\n    });\n    listen(element, \"touchstart\", function(e) {\n      return processTouches(event, function(touch) {\n        return self.trigger(\"touch\", localPosition(touch));\n      });\n    });\n    listen(element, \"mousemove\", function(e) {\n      if (active) {\n        return self.trigger(\"move\", localPosition(e));\n      }\n    });\n    listen(document, \"mousemove\", function(e) {\n      if (active) {\n        return self.trigger(\"move\", localPosition(e));\n      }\n    });\n    listen(element, \"touchmove\", function(e) {\n      return processTouches(event, function(touch) {\n        return self.trigger(\"move\", localPosition(touch));\n      });\n    });\n    listen(element, \"mouseup\", function(e) {\n      self.trigger(\"release\", localPosition(e));\n      active = false;\n    });\n    listen(element, \"touchend\", function(e) {\n      return processTouches(event, function(touch) {\n        return self.trigger(\"release\", localPosition(touch));\n      });\n    });\n    listen(document, \"mouseup\", function(e) {\n      if (active) {\n        self.trigger(\"release\", localPosition(e));\n      }\n      active = false;\n    });\n    processTouches = function(event, fn) {\n      var touches;\n      event.preventDefault();\n      if (event.type === \"touchend\") {\n        touches = event.changedTouches;\n      } else {\n        touches = event.touches;\n      }\n      if (typeof self.debug === \"function\") {\n        self.debug(Array.prototype.map.call(touches, function(_arg) {\n          var identifier, pageX, pageY;\n          identifier = _arg.identifier, pageX = _arg.pageX, pageY = _arg.pageY;\n          return \"[\" + identifier + \": \" + pageX + \", \" + pageY + \" (\" + event.type + \")]\\n\";\n        }));\n      }\n      return Array.prototype.forEach.call(touches, fn);\n    };\n    localPosition = function(e) {\n      var point, rect;\n      rect = element.getBoundingClientRect();\n      point = {\n        x: clamp((e.pageX - rect.left) / rect.width, 0, MAX),\n        y: clamp((e.pageY - rect.top) / rect.height, 0, MAX)\n      };\n      point.identifier = (e.identifier + 1) || 0;\n      return point;\n    };\n    return self;\n  };\n\n  listen = function(element, event, handler) {\n    return element.addEventListener(event, handler, false);\n  };\n\n  clamp = function(number, min, max) {\n    return Math.min(Math.max(number, min), max);\n  };\n\n  module.exports = TouchCanvas;\n\n}).call(this);\n\n//# sourceURL=touch_canvas.coffee",
          "type": "blob"
        },
        "test/touch": {
          "path": "test/touch",
          "content": "(function() {\n  var TouchCanvas, extend, fireEvent,\n    __slice = [].slice;\n\n  TouchCanvas = require(\"../touch_canvas\");\n\n  extend = function() {\n    var name, source, sources, target, _i, _len;\n    target = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n    for (_i = 0, _len = sources.length; _i < _len; _i++) {\n      source = sources[_i];\n      for (name in source) {\n        target[name] = source[name];\n      }\n    }\n    return target;\n  };\n\n  fireEvent = function(element, type, params) {\n    var event;\n    if (params == null) {\n      params = {};\n    }\n    event = document.createEvent(\"Events\");\n    event.initEvent(type, true, false);\n    extend(event, params);\n    return element.dispatchEvent(event);\n  };\n\n  describe(\"TouchCanvas\", function() {\n    it(\"should be creatable\", function() {\n      var c;\n      c = TouchCanvas();\n      assert(c);\n      return document.body.appendChild(c.element());\n    });\n    return it(\"should fire events\", function(done) {\n      var canvas;\n      canvas = TouchCanvas();\n      canvas.on(\"touch\", function(e) {\n        return done();\n      });\n      return fireEvent(canvas.element(), \"mousedown\");\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/touch.coffee",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "http://strd6.github.io/editor/"
      },
      "version": "0.3.1",
      "entryPoint": "touch_canvas",
      "repository": {
        "id": 13783983,
        "name": "touch-canvas",
        "full_name": "distri/touch-canvas",
        "owner": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
          "gravatar_id": null,
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "private": false,
        "html_url": "https://github.com/distri/touch-canvas",
        "description": "A canvas you can touch",
        "fork": false,
        "url": "https://api.github.com/repos/distri/touch-canvas",
        "forks_url": "https://api.github.com/repos/distri/touch-canvas/forks",
        "keys_url": "https://api.github.com/repos/distri/touch-canvas/keys{/key_id}",
        "collaborators_url": "https://api.github.com/repos/distri/touch-canvas/collaborators{/collaborator}",
        "teams_url": "https://api.github.com/repos/distri/touch-canvas/teams",
        "hooks_url": "https://api.github.com/repos/distri/touch-canvas/hooks",
        "issue_events_url": "https://api.github.com/repos/distri/touch-canvas/issues/events{/number}",
        "events_url": "https://api.github.com/repos/distri/touch-canvas/events",
        "assignees_url": "https://api.github.com/repos/distri/touch-canvas/assignees{/user}",
        "branches_url": "https://api.github.com/repos/distri/touch-canvas/branches{/branch}",
        "tags_url": "https://api.github.com/repos/distri/touch-canvas/tags",
        "blobs_url": "https://api.github.com/repos/distri/touch-canvas/git/blobs{/sha}",
        "git_tags_url": "https://api.github.com/repos/distri/touch-canvas/git/tags{/sha}",
        "git_refs_url": "https://api.github.com/repos/distri/touch-canvas/git/refs{/sha}",
        "trees_url": "https://api.github.com/repos/distri/touch-canvas/git/trees{/sha}",
        "statuses_url": "https://api.github.com/repos/distri/touch-canvas/statuses/{sha}",
        "languages_url": "https://api.github.com/repos/distri/touch-canvas/languages",
        "stargazers_url": "https://api.github.com/repos/distri/touch-canvas/stargazers",
        "contributors_url": "https://api.github.com/repos/distri/touch-canvas/contributors",
        "subscribers_url": "https://api.github.com/repos/distri/touch-canvas/subscribers",
        "subscription_url": "https://api.github.com/repos/distri/touch-canvas/subscription",
        "commits_url": "https://api.github.com/repos/distri/touch-canvas/commits{/sha}",
        "git_commits_url": "https://api.github.com/repos/distri/touch-canvas/git/commits{/sha}",
        "comments_url": "https://api.github.com/repos/distri/touch-canvas/comments{/number}",
        "issue_comment_url": "https://api.github.com/repos/distri/touch-canvas/issues/comments/{number}",
        "contents_url": "https://api.github.com/repos/distri/touch-canvas/contents/{+path}",
        "compare_url": "https://api.github.com/repos/distri/touch-canvas/compare/{base}...{head}",
        "merges_url": "https://api.github.com/repos/distri/touch-canvas/merges",
        "archive_url": "https://api.github.com/repos/distri/touch-canvas/{archive_format}{/ref}",
        "downloads_url": "https://api.github.com/repos/distri/touch-canvas/downloads",
        "issues_url": "https://api.github.com/repos/distri/touch-canvas/issues{/number}",
        "pulls_url": "https://api.github.com/repos/distri/touch-canvas/pulls{/number}",
        "milestones_url": "https://api.github.com/repos/distri/touch-canvas/milestones{/number}",
        "notifications_url": "https://api.github.com/repos/distri/touch-canvas/notifications{?since,all,participating}",
        "labels_url": "https://api.github.com/repos/distri/touch-canvas/labels{/name}",
        "releases_url": "https://api.github.com/repos/distri/touch-canvas/releases{/id}",
        "created_at": "2013-10-22T19:46:48Z",
        "updated_at": "2013-11-29T20:46:28Z",
        "pushed_at": "2013-11-29T20:46:28Z",
        "git_url": "git://github.com/distri/touch-canvas.git",
        "ssh_url": "git@github.com:distri/touch-canvas.git",
        "clone_url": "https://github.com/distri/touch-canvas.git",
        "svn_url": "https://github.com/distri/touch-canvas",
        "homepage": null,
        "size": 280,
        "stargazers_count": 0,
        "watchers_count": 0,
        "language": "CoffeeScript",
        "has_issues": true,
        "has_downloads": true,
        "has_wiki": true,
        "forks_count": 0,
        "mirror_url": null,
        "open_issues_count": 0,
        "forks": 0,
        "open_issues": 0,
        "watchers": 0,
        "default_branch": "master",
        "master_branch": "master",
        "permissions": {
          "admin": true,
          "push": true,
          "pull": true
        },
        "organization": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
          "gravatar_id": null,
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "network_count": 0,
        "subscribers_count": 1,
        "branch": "v0.3.1",
        "defaultBranch": "master"
      },
      "dependencies": {
        "bindable": {
          "source": {
            "LICENSE": {
              "path": "LICENSE",
              "mode": "100644",
              "content": "The MIT License (MIT)\n\nCopyright (c) 2014 distri\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
              "type": "blob"
            },
            "README.coffee.md": {
              "path": "README.coffee.md",
              "mode": "100644",
              "content": "Bindable\n========\n\n    Core = require \"core\"\n\nAdd event binding to objects.\n\n>     bindable = Bindable()\n>     bindable.on \"greet\", ->\n>       console.log \"yo!\"\n>     bindable.trigger \"greet\"\n>     #=> \"yo!\" is printed to log\n\nUse as a mixin.\n\n>    self.include Bindable\n\n    module.exports = (I={}, self=Core(I)) ->\n      eventCallbacks = {}\n\n      self.extend\n\nAdds a function as an event listener.\n\nThis will call `coolEventHandler` after `yourObject.trigger \"someCustomEvent\"`\nis called.\n\n>     yourObject.on \"someCustomEvent\", coolEventHandler\n\nHandlers can be attached to namespaces as well. The namespaces are only used\nfor finer control of targeting event removal. For example if you are making a\ncustom drawing system you could unbind `\".Drawable\"` events and add your own.\n\n>     yourObject.on \"\"\n\n        on: (namespacedEvent, callback) ->\n          [event, namespace] = namespacedEvent.split(\".\")\n\n          # HACK: Here we annotate the callback function with namespace metadata\n          # This will probably lead to some strange edge cases, but should work fine\n          # for simple cases.\n          if namespace\n            callback.__PIXIE ||= {}\n            callback.__PIXIE[namespace] = true\n\n          eventCallbacks[event] ||= []\n          eventCallbacks[event].push(callback)\n\n          return self\n\nRemoves a specific event listener, or all event listeners if\nno specific listener is given.\n\nRemoves the handler coolEventHandler from the event `\"someCustomEvent\"` while\nleaving the other events intact.\n\n>     yourObject.off \"someCustomEvent\", coolEventHandler\n\nRemoves all handlers attached to `\"anotherCustomEvent\"`\n\n>     yourObject.off \"anotherCustomEvent\"\n\nRemove all handlers from the `\".Drawable\" namespace`\n\n>     yourObject.off \".Drawable\"\n\n        off: (namespacedEvent, callback) ->\n          [event, namespace] = namespacedEvent.split(\".\")\n\n          if event\n            eventCallbacks[event] ||= []\n\n            if namespace\n              # Select only the callbacks that do not have this namespace metadata\n              eventCallbacks[event] = eventCallbacks.filter (callback) ->\n                !callback.__PIXIE?[namespace]?\n\n            else\n              if callback\n                remove eventCallbacks[event], callback\n              else\n                eventCallbacks[event] = []\n          else if namespace\n            # No event given\n            # Select only the callbacks that do not have this namespace metadata\n            # for any events bound\n            for key, callbacks of eventCallbacks\n              eventCallbacks[key] = callbacks.filter (callback) ->\n                !callback.__PIXIE?[namespace]?\n\n          return self\n\nCalls all listeners attached to the specified event.\n\n>     # calls each event handler bound to \"someCustomEvent\"\n>     yourObject.trigger \"someCustomEvent\"\n\nAdditional parameters can be passed to the handlers.\n\n>     yourObject.trigger \"someEvent\", \"hello\", \"anotherParameter\"\n\n        trigger: (event, parameters...) ->\n          callbacks = eventCallbacks[event]\n\n          if callbacks\n            callbacks.forEach (callback) ->\n              callback.apply(self, parameters)\n\n          return self\n\nLegacy method aliases.\n\n      self.extend\n        bind: self.on\n        unbind: self.off\n\nHelpers\n-------\n\nRemove a value from an array.\n\n    remove = (array, value) ->\n      index = array.indexOf(value)\n\n      if index >= 0\n        array.splice(index, 1)[0]\n",
              "type": "blob"
            },
            "pixie.cson": {
              "path": "pixie.cson",
              "mode": "100644",
              "content": "entryPoint: \"README\"\nversion: \"0.1.0\"\ndependencies:\n  core: \"distri/core:v0.6.0\"\n",
              "type": "blob"
            },
            "test/bindable.coffee": {
              "path": "test/bindable.coffee",
              "mode": "100644",
              "content": "test = it\nok = assert\nequal = assert.equal\n\nBindable = require \"../README\"\n\ndescribe \"Bindable\", ->\n\n  test \"#bind and #trigger\", ->\n    o = Bindable()\n\n    o.bind(\"test\", -> ok true)\n\n    o.trigger(\"test\")\n\n  test \"Multiple bindings\", ->\n    o = Bindable()\n\n    o.bind(\"test\", -> ok true)\n    o.bind(\"test\", -> ok true)\n\n    o.trigger(\"test\")\n\n  test \"#trigger arguments\", ->\n    o = Bindable()\n\n    param1 = \"the message\"\n    param2 = 3\n\n    o.bind \"test\", (p1, p2) ->\n      equal(p1, param1)\n      equal(p2, param2)\n\n    o.trigger \"test\", param1, param2\n\n  test \"#unbind\", ->\n    o = Bindable()\n\n    callback = ->\n      ok false\n\n    o.bind \"test\", callback\n    # Unbind specific event\n    o.unbind \"test\", callback\n    o.trigger \"test\"\n\n    o.bind \"test\", callback\n    # Unbind all events\n    o.unbind \"test\"\n    o.trigger \"test\"\n\n  test \"#trigger namespace\", ->\n    o = Bindable()\n    o.bind \"test.TestNamespace\", ->\n      ok true\n\n    o.trigger \"test\"\n\n    o.unbind \".TestNamespace\"\n    o.trigger \"test\"\n\n  test \"#unbind namespaced\", ->\n    o = Bindable()\n\n    o.bind \"test.TestNamespace\", ->\n      ok true\n\n    o.trigger \"test\"\n\n    o.unbind \".TestNamespace\", ->\n    o.trigger \"test\"\n",
              "type": "blob"
            }
          },
          "distribution": {
            "README": {
              "path": "README",
              "content": "(function() {\n  var Core, remove,\n    __slice = [].slice;\n\n  Core = require(\"core\");\n\n  module.exports = function(I, self) {\n    var eventCallbacks;\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = Core(I);\n    }\n    eventCallbacks = {};\n    self.extend({\n      on: function(namespacedEvent, callback) {\n        var event, namespace, _ref;\n        _ref = namespacedEvent.split(\".\"), event = _ref[0], namespace = _ref[1];\n        if (namespace) {\n          callback.__PIXIE || (callback.__PIXIE = {});\n          callback.__PIXIE[namespace] = true;\n        }\n        eventCallbacks[event] || (eventCallbacks[event] = []);\n        eventCallbacks[event].push(callback);\n        return self;\n      },\n      off: function(namespacedEvent, callback) {\n        var callbacks, event, key, namespace, _ref;\n        _ref = namespacedEvent.split(\".\"), event = _ref[0], namespace = _ref[1];\n        if (event) {\n          eventCallbacks[event] || (eventCallbacks[event] = []);\n          if (namespace) {\n            eventCallbacks[event] = eventCallbacks.filter(function(callback) {\n              var _ref1;\n              return ((_ref1 = callback.__PIXIE) != null ? _ref1[namespace] : void 0) == null;\n            });\n          } else {\n            if (callback) {\n              remove(eventCallbacks[event], callback);\n            } else {\n              eventCallbacks[event] = [];\n            }\n          }\n        } else if (namespace) {\n          for (key in eventCallbacks) {\n            callbacks = eventCallbacks[key];\n            eventCallbacks[key] = callbacks.filter(function(callback) {\n              var _ref1;\n              return ((_ref1 = callback.__PIXIE) != null ? _ref1[namespace] : void 0) == null;\n            });\n          }\n        }\n        return self;\n      },\n      trigger: function() {\n        var callbacks, event, parameters;\n        event = arguments[0], parameters = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n        callbacks = eventCallbacks[event];\n        if (callbacks) {\n          callbacks.forEach(function(callback) {\n            return callback.apply(self, parameters);\n          });\n        }\n        return self;\n      }\n    });\n    return self.extend({\n      bind: self.on,\n      unbind: self.off\n    });\n  };\n\n  remove = function(array, value) {\n    var index;\n    index = array.indexOf(value);\n    if (index >= 0) {\n      return array.splice(index, 1)[0];\n    }\n  };\n\n}).call(this);\n\n//# sourceURL=README.coffee",
              "type": "blob"
            },
            "pixie": {
              "path": "pixie",
              "content": "module.exports = {\"entryPoint\":\"README\",\"version\":\"0.1.0\",\"dependencies\":{\"core\":\"distri/core:v0.6.0\"}};",
              "type": "blob"
            },
            "test/bindable": {
              "path": "test/bindable",
              "content": "(function() {\n  var Bindable, equal, ok, test;\n\n  test = it;\n\n  ok = assert;\n\n  equal = assert.equal;\n\n  Bindable = require(\"../README\");\n\n  describe(\"Bindable\", function() {\n    test(\"#bind and #trigger\", function() {\n      var o;\n      o = Bindable();\n      o.bind(\"test\", function() {\n        return ok(true);\n      });\n      return o.trigger(\"test\");\n    });\n    test(\"Multiple bindings\", function() {\n      var o;\n      o = Bindable();\n      o.bind(\"test\", function() {\n        return ok(true);\n      });\n      o.bind(\"test\", function() {\n        return ok(true);\n      });\n      return o.trigger(\"test\");\n    });\n    test(\"#trigger arguments\", function() {\n      var o, param1, param2;\n      o = Bindable();\n      param1 = \"the message\";\n      param2 = 3;\n      o.bind(\"test\", function(p1, p2) {\n        equal(p1, param1);\n        return equal(p2, param2);\n      });\n      return o.trigger(\"test\", param1, param2);\n    });\n    test(\"#unbind\", function() {\n      var callback, o;\n      o = Bindable();\n      callback = function() {\n        return ok(false);\n      };\n      o.bind(\"test\", callback);\n      o.unbind(\"test\", callback);\n      o.trigger(\"test\");\n      o.bind(\"test\", callback);\n      o.unbind(\"test\");\n      return o.trigger(\"test\");\n    });\n    test(\"#trigger namespace\", function() {\n      var o;\n      o = Bindable();\n      o.bind(\"test.TestNamespace\", function() {\n        return ok(true);\n      });\n      o.trigger(\"test\");\n      o.unbind(\".TestNamespace\");\n      return o.trigger(\"test\");\n    });\n    return test(\"#unbind namespaced\", function() {\n      var o;\n      o = Bindable();\n      o.bind(\"test.TestNamespace\", function() {\n        return ok(true);\n      });\n      o.trigger(\"test\");\n      o.unbind(\".TestNamespace\", function() {});\n      return o.trigger(\"test\");\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/bindable.coffee",
              "type": "blob"
            }
          },
          "progenitor": {
            "url": "http://strd6.github.io/editor/"
          },
          "version": "0.1.0",
          "entryPoint": "README",
          "repository": {
            "id": 17189431,
            "name": "bindable",
            "full_name": "distri/bindable",
            "owner": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "private": false,
            "html_url": "https://github.com/distri/bindable",
            "description": "Event binding",
            "fork": false,
            "url": "https://api.github.com/repos/distri/bindable",
            "forks_url": "https://api.github.com/repos/distri/bindable/forks",
            "keys_url": "https://api.github.com/repos/distri/bindable/keys{/key_id}",
            "collaborators_url": "https://api.github.com/repos/distri/bindable/collaborators{/collaborator}",
            "teams_url": "https://api.github.com/repos/distri/bindable/teams",
            "hooks_url": "https://api.github.com/repos/distri/bindable/hooks",
            "issue_events_url": "https://api.github.com/repos/distri/bindable/issues/events{/number}",
            "events_url": "https://api.github.com/repos/distri/bindable/events",
            "assignees_url": "https://api.github.com/repos/distri/bindable/assignees{/user}",
            "branches_url": "https://api.github.com/repos/distri/bindable/branches{/branch}",
            "tags_url": "https://api.github.com/repos/distri/bindable/tags",
            "blobs_url": "https://api.github.com/repos/distri/bindable/git/blobs{/sha}",
            "git_tags_url": "https://api.github.com/repos/distri/bindable/git/tags{/sha}",
            "git_refs_url": "https://api.github.com/repos/distri/bindable/git/refs{/sha}",
            "trees_url": "https://api.github.com/repos/distri/bindable/git/trees{/sha}",
            "statuses_url": "https://api.github.com/repos/distri/bindable/statuses/{sha}",
            "languages_url": "https://api.github.com/repos/distri/bindable/languages",
            "stargazers_url": "https://api.github.com/repos/distri/bindable/stargazers",
            "contributors_url": "https://api.github.com/repos/distri/bindable/contributors",
            "subscribers_url": "https://api.github.com/repos/distri/bindable/subscribers",
            "subscription_url": "https://api.github.com/repos/distri/bindable/subscription",
            "commits_url": "https://api.github.com/repos/distri/bindable/commits{/sha}",
            "git_commits_url": "https://api.github.com/repos/distri/bindable/git/commits{/sha}",
            "comments_url": "https://api.github.com/repos/distri/bindable/comments{/number}",
            "issue_comment_url": "https://api.github.com/repos/distri/bindable/issues/comments/{number}",
            "contents_url": "https://api.github.com/repos/distri/bindable/contents/{+path}",
            "compare_url": "https://api.github.com/repos/distri/bindable/compare/{base}...{head}",
            "merges_url": "https://api.github.com/repos/distri/bindable/merges",
            "archive_url": "https://api.github.com/repos/distri/bindable/{archive_format}{/ref}",
            "downloads_url": "https://api.github.com/repos/distri/bindable/downloads",
            "issues_url": "https://api.github.com/repos/distri/bindable/issues{/number}",
            "pulls_url": "https://api.github.com/repos/distri/bindable/pulls{/number}",
            "milestones_url": "https://api.github.com/repos/distri/bindable/milestones{/number}",
            "notifications_url": "https://api.github.com/repos/distri/bindable/notifications{?since,all,participating}",
            "labels_url": "https://api.github.com/repos/distri/bindable/labels{/name}",
            "releases_url": "https://api.github.com/repos/distri/bindable/releases{/id}",
            "created_at": "2014-02-25T21:50:35Z",
            "updated_at": "2014-02-25T21:50:35Z",
            "pushed_at": "2014-02-25T21:50:35Z",
            "git_url": "git://github.com/distri/bindable.git",
            "ssh_url": "git@github.com:distri/bindable.git",
            "clone_url": "https://github.com/distri/bindable.git",
            "svn_url": "https://github.com/distri/bindable",
            "homepage": null,
            "size": 0,
            "stargazers_count": 0,
            "watchers_count": 0,
            "language": null,
            "has_issues": true,
            "has_downloads": true,
            "has_wiki": true,
            "forks_count": 0,
            "mirror_url": null,
            "open_issues_count": 0,
            "forks": 0,
            "open_issues": 0,
            "watchers": 0,
            "default_branch": "master",
            "master_branch": "master",
            "permissions": {
              "admin": true,
              "push": true,
              "pull": true
            },
            "organization": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "network_count": 0,
            "subscribers_count": 2,
            "branch": "v0.1.0",
            "defaultBranch": "master"
          },
          "dependencies": {
            "core": {
              "source": {
                "LICENSE": {
                  "path": "LICENSE",
                  "mode": "100644",
                  "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
                  "type": "blob"
                },
                "README.md": {
                  "path": "README.md",
                  "mode": "100644",
                  "content": "core\n====\n\nAn object extension system.\n",
                  "type": "blob"
                },
                "core.coffee.md": {
                  "path": "core.coffee.md",
                  "mode": "100644",
                  "content": "Core\n====\n\nThe Core module is used to add extended functionality to objects without\nextending `Object.prototype` directly.\n\n    Core = (I={}, self={}) ->\n      extend self,\n\nExternal access to instance variables. Use of this property should be avoided\nin general, but can come in handy from time to time.\n\n>     #! example\n>     I =\n>       r: 255\n>       g: 0\n>       b: 100\n>\n>     myObject = Core(I)\n>\n>     [myObject.I.r, myObject.I.g, myObject.I.b]\n\n        I: I\n\nGenerates a public jQuery style getter / setter method for each `String` argument.\n\n>     #! example\n>     myObject = Core\n>       r: 255\n>       g: 0\n>       b: 100\n>\n>     myObject.attrAccessor \"r\", \"g\", \"b\"\n>\n>     myObject.r(254)\n\n        attrAccessor: (attrNames...) ->\n          attrNames.forEach (attrName) ->\n            self[attrName] = (newValue) ->\n              if arguments.length > 0\n                I[attrName] = newValue\n\n                return self\n              else\n                I[attrName]\n\n          return self\n\nGenerates a public jQuery style getter method for each String argument.\n\n>     #! example\n>     myObject = Core\n>       r: 255\n>       g: 0\n>       b: 100\n>\n>     myObject.attrReader \"r\", \"g\", \"b\"\n>\n>     [myObject.r(), myObject.g(), myObject.b()]\n\n        attrReader: (attrNames...) ->\n          attrNames.forEach (attrName) ->\n            self[attrName] = ->\n              I[attrName]\n\n          return self\n\nExtends this object with methods from the passed in object. A shortcut for Object.extend(self, methods)\n\n>     I =\n>       x: 30\n>       y: 40\n>       maxSpeed: 5\n>\n>     # we are using extend to give player\n>     # additional methods that Core doesn't have\n>     player = Core(I).extend\n>       increaseSpeed: ->\n>         I.maxSpeed += 1\n>\n>     player.increaseSpeed()\n\n        extend: (objects...) ->\n          extend self, objects...\n\nIncludes a module in this object. A module is a constructor that takes two parameters, `I` and `self`\n\n>     myObject = Core()\n>     myObject.include(Bindable)\n\n>     # now you can bind handlers to functions\n>     myObject.bind \"someEvent\", ->\n>       alert(\"wow. that was easy.\")\n\n        include: (modules...) ->\n          for Module in modules\n            Module(I, self)\n\n          return self\n\n      return self\n\nHelpers\n-------\n\nExtend an object with the properties of other objects.\n\n    extend = (target, sources...) ->\n      for source in sources\n        for name of source\n          target[name] = source[name]\n\n      return target\n\nExport\n\n    module.exports = Core\n",
                  "type": "blob"
                },
                "pixie.cson": {
                  "path": "pixie.cson",
                  "mode": "100644",
                  "content": "entryPoint: \"core\"\nversion: \"0.6.0\"\n",
                  "type": "blob"
                },
                "test/core.coffee": {
                  "path": "test/core.coffee",
                  "mode": "100644",
                  "content": "Core = require \"../core\"\n\nok = assert\nequals = assert.equal\ntest = it\n\ndescribe \"Core\", ->\n\n  test \"#extend\", ->\n    o = Core()\n  \n    o.extend\n      test: \"jawsome\"\n  \n    equals o.test, \"jawsome\"\n  \n  test \"#attrAccessor\", ->\n    o = Core\n      test: \"my_val\"\n  \n    o.attrAccessor(\"test\")\n  \n    equals o.test(), \"my_val\"\n    equals o.test(\"new_val\"), o\n    equals o.test(), \"new_val\"\n  \n  test \"#attrReader\", ->\n    o = Core\n      test: \"my_val\"\n  \n    o.attrReader(\"test\")\n  \n    equals o.test(), \"my_val\"\n    equals o.test(\"new_val\"), \"my_val\"\n    equals o.test(), \"my_val\"\n  \n  test \"#include\", ->\n    o = Core\n      test: \"my_val\"\n  \n    M = (I, self) ->\n      self.attrReader \"test\"\n  \n      self.extend\n        test2: \"cool\"\n  \n    ret = o.include M\n  \n    equals ret, o, \"Should return self\"\n  \n    equals o.test(), \"my_val\"\n    equals o.test2, \"cool\"\n  \n  test \"#include multiple\", ->\n    o = Core\n      test: \"my_val\"\n  \n    M = (I, self) ->\n      self.attrReader \"test\"\n  \n      self.extend\n        test2: \"cool\"\n  \n    M2 = (I, self) ->\n      self.extend\n        test2: \"coolio\"\n  \n    o.include M, M2\n  \n    equals o.test2, \"coolio\"\n",
                  "type": "blob"
                }
              },
              "distribution": {
                "core": {
                  "path": "core",
                  "content": "(function() {\n  var Core, extend,\n    __slice = [].slice;\n\n  Core = function(I, self) {\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = {};\n    }\n    extend(self, {\n      I: I,\n      attrAccessor: function() {\n        var attrNames;\n        attrNames = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        attrNames.forEach(function(attrName) {\n          return self[attrName] = function(newValue) {\n            if (arguments.length > 0) {\n              I[attrName] = newValue;\n              return self;\n            } else {\n              return I[attrName];\n            }\n          };\n        });\n        return self;\n      },\n      attrReader: function() {\n        var attrNames;\n        attrNames = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        attrNames.forEach(function(attrName) {\n          return self[attrName] = function() {\n            return I[attrName];\n          };\n        });\n        return self;\n      },\n      extend: function() {\n        var objects;\n        objects = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        return extend.apply(null, [self].concat(__slice.call(objects)));\n      },\n      include: function() {\n        var Module, modules, _i, _len;\n        modules = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        for (_i = 0, _len = modules.length; _i < _len; _i++) {\n          Module = modules[_i];\n          Module(I, self);\n        }\n        return self;\n      }\n    });\n    return self;\n  };\n\n  extend = function() {\n    var name, source, sources, target, _i, _len;\n    target = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n    for (_i = 0, _len = sources.length; _i < _len; _i++) {\n      source = sources[_i];\n      for (name in source) {\n        target[name] = source[name];\n      }\n    }\n    return target;\n  };\n\n  module.exports = Core;\n\n}).call(this);\n\n//# sourceURL=core.coffee",
                  "type": "blob"
                },
                "pixie": {
                  "path": "pixie",
                  "content": "module.exports = {\"entryPoint\":\"core\",\"version\":\"0.6.0\"};",
                  "type": "blob"
                },
                "test/core": {
                  "path": "test/core",
                  "content": "(function() {\n  var Core, equals, ok, test;\n\n  Core = require(\"../core\");\n\n  ok = assert;\n\n  equals = assert.equal;\n\n  test = it;\n\n  describe(\"Core\", function() {\n    test(\"#extend\", function() {\n      var o;\n      o = Core();\n      o.extend({\n        test: \"jawsome\"\n      });\n      return equals(o.test, \"jawsome\");\n    });\n    test(\"#attrAccessor\", function() {\n      var o;\n      o = Core({\n        test: \"my_val\"\n      });\n      o.attrAccessor(\"test\");\n      equals(o.test(), \"my_val\");\n      equals(o.test(\"new_val\"), o);\n      return equals(o.test(), \"new_val\");\n    });\n    test(\"#attrReader\", function() {\n      var o;\n      o = Core({\n        test: \"my_val\"\n      });\n      o.attrReader(\"test\");\n      equals(o.test(), \"my_val\");\n      equals(o.test(\"new_val\"), \"my_val\");\n      return equals(o.test(), \"my_val\");\n    });\n    test(\"#include\", function() {\n      var M, o, ret;\n      o = Core({\n        test: \"my_val\"\n      });\n      M = function(I, self) {\n        self.attrReader(\"test\");\n        return self.extend({\n          test2: \"cool\"\n        });\n      };\n      ret = o.include(M);\n      equals(ret, o, \"Should return self\");\n      equals(o.test(), \"my_val\");\n      return equals(o.test2, \"cool\");\n    });\n    return test(\"#include multiple\", function() {\n      var M, M2, o;\n      o = Core({\n        test: \"my_val\"\n      });\n      M = function(I, self) {\n        self.attrReader(\"test\");\n        return self.extend({\n          test2: \"cool\"\n        });\n      };\n      M2 = function(I, self) {\n        return self.extend({\n          test2: \"coolio\"\n        });\n      };\n      o.include(M, M2);\n      return equals(o.test2, \"coolio\");\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/core.coffee",
                  "type": "blob"
                }
              },
              "progenitor": {
                "url": "http://strd6.github.io/editor/"
              },
              "version": "0.6.0",
              "entryPoint": "core",
              "repository": {
                "id": 13567517,
                "name": "core",
                "full_name": "distri/core",
                "owner": {
                  "login": "distri",
                  "id": 6005125,
                  "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
                  "gravatar_id": null,
                  "url": "https://api.github.com/users/distri",
                  "html_url": "https://github.com/distri",
                  "followers_url": "https://api.github.com/users/distri/followers",
                  "following_url": "https://api.github.com/users/distri/following{/other_user}",
                  "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
                  "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
                  "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
                  "organizations_url": "https://api.github.com/users/distri/orgs",
                  "repos_url": "https://api.github.com/users/distri/repos",
                  "events_url": "https://api.github.com/users/distri/events{/privacy}",
                  "received_events_url": "https://api.github.com/users/distri/received_events",
                  "type": "Organization",
                  "site_admin": false
                },
                "private": false,
                "html_url": "https://github.com/distri/core",
                "description": "An object extension system.",
                "fork": false,
                "url": "https://api.github.com/repos/distri/core",
                "forks_url": "https://api.github.com/repos/distri/core/forks",
                "keys_url": "https://api.github.com/repos/distri/core/keys{/key_id}",
                "collaborators_url": "https://api.github.com/repos/distri/core/collaborators{/collaborator}",
                "teams_url": "https://api.github.com/repos/distri/core/teams",
                "hooks_url": "https://api.github.com/repos/distri/core/hooks",
                "issue_events_url": "https://api.github.com/repos/distri/core/issues/events{/number}",
                "events_url": "https://api.github.com/repos/distri/core/events",
                "assignees_url": "https://api.github.com/repos/distri/core/assignees{/user}",
                "branches_url": "https://api.github.com/repos/distri/core/branches{/branch}",
                "tags_url": "https://api.github.com/repos/distri/core/tags",
                "blobs_url": "https://api.github.com/repos/distri/core/git/blobs{/sha}",
                "git_tags_url": "https://api.github.com/repos/distri/core/git/tags{/sha}",
                "git_refs_url": "https://api.github.com/repos/distri/core/git/refs{/sha}",
                "trees_url": "https://api.github.com/repos/distri/core/git/trees{/sha}",
                "statuses_url": "https://api.github.com/repos/distri/core/statuses/{sha}",
                "languages_url": "https://api.github.com/repos/distri/core/languages",
                "stargazers_url": "https://api.github.com/repos/distri/core/stargazers",
                "contributors_url": "https://api.github.com/repos/distri/core/contributors",
                "subscribers_url": "https://api.github.com/repos/distri/core/subscribers",
                "subscription_url": "https://api.github.com/repos/distri/core/subscription",
                "commits_url": "https://api.github.com/repos/distri/core/commits{/sha}",
                "git_commits_url": "https://api.github.com/repos/distri/core/git/commits{/sha}",
                "comments_url": "https://api.github.com/repos/distri/core/comments{/number}",
                "issue_comment_url": "https://api.github.com/repos/distri/core/issues/comments/{number}",
                "contents_url": "https://api.github.com/repos/distri/core/contents/{+path}",
                "compare_url": "https://api.github.com/repos/distri/core/compare/{base}...{head}",
                "merges_url": "https://api.github.com/repos/distri/core/merges",
                "archive_url": "https://api.github.com/repos/distri/core/{archive_format}{/ref}",
                "downloads_url": "https://api.github.com/repos/distri/core/downloads",
                "issues_url": "https://api.github.com/repos/distri/core/issues{/number}",
                "pulls_url": "https://api.github.com/repos/distri/core/pulls{/number}",
                "milestones_url": "https://api.github.com/repos/distri/core/milestones{/number}",
                "notifications_url": "https://api.github.com/repos/distri/core/notifications{?since,all,participating}",
                "labels_url": "https://api.github.com/repos/distri/core/labels{/name}",
                "releases_url": "https://api.github.com/repos/distri/core/releases{/id}",
                "created_at": "2013-10-14T17:04:33Z",
                "updated_at": "2013-12-24T00:49:21Z",
                "pushed_at": "2013-10-14T23:49:11Z",
                "git_url": "git://github.com/distri/core.git",
                "ssh_url": "git@github.com:distri/core.git",
                "clone_url": "https://github.com/distri/core.git",
                "svn_url": "https://github.com/distri/core",
                "homepage": null,
                "size": 592,
                "stargazers_count": 0,
                "watchers_count": 0,
                "language": "CoffeeScript",
                "has_issues": true,
                "has_downloads": true,
                "has_wiki": true,
                "forks_count": 0,
                "mirror_url": null,
                "open_issues_count": 0,
                "forks": 0,
                "open_issues": 0,
                "watchers": 0,
                "default_branch": "master",
                "master_branch": "master",
                "permissions": {
                  "admin": true,
                  "push": true,
                  "pull": true
                },
                "organization": {
                  "login": "distri",
                  "id": 6005125,
                  "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
                  "gravatar_id": null,
                  "url": "https://api.github.com/users/distri",
                  "html_url": "https://github.com/distri",
                  "followers_url": "https://api.github.com/users/distri/followers",
                  "following_url": "https://api.github.com/users/distri/following{/other_user}",
                  "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
                  "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
                  "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
                  "organizations_url": "https://api.github.com/users/distri/orgs",
                  "repos_url": "https://api.github.com/users/distri/repos",
                  "events_url": "https://api.github.com/users/distri/events{/privacy}",
                  "received_events_url": "https://api.github.com/users/distri/received_events",
                  "type": "Organization",
                  "site_admin": false
                },
                "network_count": 0,
                "subscribers_count": 1,
                "branch": "v0.6.0",
                "defaultBranch": "master"
              },
              "dependencies": {}
            }
          }
        },
        "core": {
          "source": {
            "LICENSE": {
              "path": "LICENSE",
              "mode": "100644",
              "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
              "type": "blob"
            },
            "README.md": {
              "path": "README.md",
              "mode": "100644",
              "content": "core\n====\n\nAn object extension system.\n",
              "type": "blob"
            },
            "core.coffee.md": {
              "path": "core.coffee.md",
              "mode": "100644",
              "content": "Core\n====\n\nThe Core module is used to add extended functionality to objects without\nextending `Object.prototype` directly.\n\n    Core = (I={}, self={}) ->\n      extend self,\n\nExternal access to instance variables. Use of this property should be avoided\nin general, but can come in handy from time to time.\n\n>     #! example\n>     I =\n>       r: 255\n>       g: 0\n>       b: 100\n>\n>     myObject = Core(I)\n>\n>     [myObject.I.r, myObject.I.g, myObject.I.b]\n\n        I: I\n\nGenerates a public jQuery style getter / setter method for each `String` argument.\n\n>     #! example\n>     myObject = Core\n>       r: 255\n>       g: 0\n>       b: 100\n>\n>     myObject.attrAccessor \"r\", \"g\", \"b\"\n>\n>     myObject.r(254)\n\n        attrAccessor: (attrNames...) ->\n          attrNames.forEach (attrName) ->\n            self[attrName] = (newValue) ->\n              if arguments.length > 0\n                I[attrName] = newValue\n\n                return self\n              else\n                I[attrName]\n\n          return self\n\nGenerates a public jQuery style getter method for each String argument.\n\n>     #! example\n>     myObject = Core\n>       r: 255\n>       g: 0\n>       b: 100\n>\n>     myObject.attrReader \"r\", \"g\", \"b\"\n>\n>     [myObject.r(), myObject.g(), myObject.b()]\n\n        attrReader: (attrNames...) ->\n          attrNames.forEach (attrName) ->\n            self[attrName] = ->\n              I[attrName]\n\n          return self\n\nExtends this object with methods from the passed in object. A shortcut for Object.extend(self, methods)\n\n>     I =\n>       x: 30\n>       y: 40\n>       maxSpeed: 5\n>\n>     # we are using extend to give player\n>     # additional methods that Core doesn't have\n>     player = Core(I).extend\n>       increaseSpeed: ->\n>         I.maxSpeed += 1\n>\n>     player.increaseSpeed()\n\n        extend: (objects...) ->\n          extend self, objects...\n\nIncludes a module in this object. A module is a constructor that takes two parameters, `I` and `self`\n\n>     myObject = Core()\n>     myObject.include(Bindable)\n\n>     # now you can bind handlers to functions\n>     myObject.bind \"someEvent\", ->\n>       alert(\"wow. that was easy.\")\n\n        include: (modules...) ->\n          for Module in modules\n            Module(I, self)\n\n          return self\n\n      return self\n\nHelpers\n-------\n\nExtend an object with the properties of other objects.\n\n    extend = (target, sources...) ->\n      for source in sources\n        for name of source\n          target[name] = source[name]\n\n      return target\n\nExport\n\n    module.exports = Core\n",
              "type": "blob"
            },
            "pixie.cson": {
              "path": "pixie.cson",
              "mode": "100644",
              "content": "entryPoint: \"core\"\nversion: \"0.6.0\"\n",
              "type": "blob"
            },
            "test/core.coffee": {
              "path": "test/core.coffee",
              "mode": "100644",
              "content": "Core = require \"../core\"\n\nok = assert\nequals = assert.equal\ntest = it\n\ndescribe \"Core\", ->\n\n  test \"#extend\", ->\n    o = Core()\n  \n    o.extend\n      test: \"jawsome\"\n  \n    equals o.test, \"jawsome\"\n  \n  test \"#attrAccessor\", ->\n    o = Core\n      test: \"my_val\"\n  \n    o.attrAccessor(\"test\")\n  \n    equals o.test(), \"my_val\"\n    equals o.test(\"new_val\"), o\n    equals o.test(), \"new_val\"\n  \n  test \"#attrReader\", ->\n    o = Core\n      test: \"my_val\"\n  \n    o.attrReader(\"test\")\n  \n    equals o.test(), \"my_val\"\n    equals o.test(\"new_val\"), \"my_val\"\n    equals o.test(), \"my_val\"\n  \n  test \"#include\", ->\n    o = Core\n      test: \"my_val\"\n  \n    M = (I, self) ->\n      self.attrReader \"test\"\n  \n      self.extend\n        test2: \"cool\"\n  \n    ret = o.include M\n  \n    equals ret, o, \"Should return self\"\n  \n    equals o.test(), \"my_val\"\n    equals o.test2, \"cool\"\n  \n  test \"#include multiple\", ->\n    o = Core\n      test: \"my_val\"\n  \n    M = (I, self) ->\n      self.attrReader \"test\"\n  \n      self.extend\n        test2: \"cool\"\n  \n    M2 = (I, self) ->\n      self.extend\n        test2: \"coolio\"\n  \n    o.include M, M2\n  \n    equals o.test2, \"coolio\"\n",
              "type": "blob"
            }
          },
          "distribution": {
            "core": {
              "path": "core",
              "content": "(function() {\n  var Core, extend,\n    __slice = [].slice;\n\n  Core = function(I, self) {\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = {};\n    }\n    extend(self, {\n      I: I,\n      attrAccessor: function() {\n        var attrNames;\n        attrNames = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        attrNames.forEach(function(attrName) {\n          return self[attrName] = function(newValue) {\n            if (arguments.length > 0) {\n              I[attrName] = newValue;\n              return self;\n            } else {\n              return I[attrName];\n            }\n          };\n        });\n        return self;\n      },\n      attrReader: function() {\n        var attrNames;\n        attrNames = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        attrNames.forEach(function(attrName) {\n          return self[attrName] = function() {\n            return I[attrName];\n          };\n        });\n        return self;\n      },\n      extend: function() {\n        var objects;\n        objects = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        return extend.apply(null, [self].concat(__slice.call(objects)));\n      },\n      include: function() {\n        var Module, modules, _i, _len;\n        modules = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        for (_i = 0, _len = modules.length; _i < _len; _i++) {\n          Module = modules[_i];\n          Module(I, self);\n        }\n        return self;\n      }\n    });\n    return self;\n  };\n\n  extend = function() {\n    var name, source, sources, target, _i, _len;\n    target = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n    for (_i = 0, _len = sources.length; _i < _len; _i++) {\n      source = sources[_i];\n      for (name in source) {\n        target[name] = source[name];\n      }\n    }\n    return target;\n  };\n\n  module.exports = Core;\n\n}).call(this);\n\n//# sourceURL=core.coffee",
              "type": "blob"
            },
            "pixie": {
              "path": "pixie",
              "content": "module.exports = {\"entryPoint\":\"core\",\"version\":\"0.6.0\"};",
              "type": "blob"
            },
            "test/core": {
              "path": "test/core",
              "content": "(function() {\n  var Core, equals, ok, test;\n\n  Core = require(\"../core\");\n\n  ok = assert;\n\n  equals = assert.equal;\n\n  test = it;\n\n  describe(\"Core\", function() {\n    test(\"#extend\", function() {\n      var o;\n      o = Core();\n      o.extend({\n        test: \"jawsome\"\n      });\n      return equals(o.test, \"jawsome\");\n    });\n    test(\"#attrAccessor\", function() {\n      var o;\n      o = Core({\n        test: \"my_val\"\n      });\n      o.attrAccessor(\"test\");\n      equals(o.test(), \"my_val\");\n      equals(o.test(\"new_val\"), o);\n      return equals(o.test(), \"new_val\");\n    });\n    test(\"#attrReader\", function() {\n      var o;\n      o = Core({\n        test: \"my_val\"\n      });\n      o.attrReader(\"test\");\n      equals(o.test(), \"my_val\");\n      equals(o.test(\"new_val\"), \"my_val\");\n      return equals(o.test(), \"my_val\");\n    });\n    test(\"#include\", function() {\n      var M, o, ret;\n      o = Core({\n        test: \"my_val\"\n      });\n      M = function(I, self) {\n        self.attrReader(\"test\");\n        return self.extend({\n          test2: \"cool\"\n        });\n      };\n      ret = o.include(M);\n      equals(ret, o, \"Should return self\");\n      equals(o.test(), \"my_val\");\n      return equals(o.test2, \"cool\");\n    });\n    return test(\"#include multiple\", function() {\n      var M, M2, o;\n      o = Core({\n        test: \"my_val\"\n      });\n      M = function(I, self) {\n        self.attrReader(\"test\");\n        return self.extend({\n          test2: \"cool\"\n        });\n      };\n      M2 = function(I, self) {\n        return self.extend({\n          test2: \"coolio\"\n        });\n      };\n      o.include(M, M2);\n      return equals(o.test2, \"coolio\");\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/core.coffee",
              "type": "blob"
            }
          },
          "progenitor": {
            "url": "http://strd6.github.io/editor/"
          },
          "version": "0.6.0",
          "entryPoint": "core",
          "repository": {
            "id": 13567517,
            "name": "core",
            "full_name": "distri/core",
            "owner": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "private": false,
            "html_url": "https://github.com/distri/core",
            "description": "An object extension system.",
            "fork": false,
            "url": "https://api.github.com/repos/distri/core",
            "forks_url": "https://api.github.com/repos/distri/core/forks",
            "keys_url": "https://api.github.com/repos/distri/core/keys{/key_id}",
            "collaborators_url": "https://api.github.com/repos/distri/core/collaborators{/collaborator}",
            "teams_url": "https://api.github.com/repos/distri/core/teams",
            "hooks_url": "https://api.github.com/repos/distri/core/hooks",
            "issue_events_url": "https://api.github.com/repos/distri/core/issues/events{/number}",
            "events_url": "https://api.github.com/repos/distri/core/events",
            "assignees_url": "https://api.github.com/repos/distri/core/assignees{/user}",
            "branches_url": "https://api.github.com/repos/distri/core/branches{/branch}",
            "tags_url": "https://api.github.com/repos/distri/core/tags",
            "blobs_url": "https://api.github.com/repos/distri/core/git/blobs{/sha}",
            "git_tags_url": "https://api.github.com/repos/distri/core/git/tags{/sha}",
            "git_refs_url": "https://api.github.com/repos/distri/core/git/refs{/sha}",
            "trees_url": "https://api.github.com/repos/distri/core/git/trees{/sha}",
            "statuses_url": "https://api.github.com/repos/distri/core/statuses/{sha}",
            "languages_url": "https://api.github.com/repos/distri/core/languages",
            "stargazers_url": "https://api.github.com/repos/distri/core/stargazers",
            "contributors_url": "https://api.github.com/repos/distri/core/contributors",
            "subscribers_url": "https://api.github.com/repos/distri/core/subscribers",
            "subscription_url": "https://api.github.com/repos/distri/core/subscription",
            "commits_url": "https://api.github.com/repos/distri/core/commits{/sha}",
            "git_commits_url": "https://api.github.com/repos/distri/core/git/commits{/sha}",
            "comments_url": "https://api.github.com/repos/distri/core/comments{/number}",
            "issue_comment_url": "https://api.github.com/repos/distri/core/issues/comments/{number}",
            "contents_url": "https://api.github.com/repos/distri/core/contents/{+path}",
            "compare_url": "https://api.github.com/repos/distri/core/compare/{base}...{head}",
            "merges_url": "https://api.github.com/repos/distri/core/merges",
            "archive_url": "https://api.github.com/repos/distri/core/{archive_format}{/ref}",
            "downloads_url": "https://api.github.com/repos/distri/core/downloads",
            "issues_url": "https://api.github.com/repos/distri/core/issues{/number}",
            "pulls_url": "https://api.github.com/repos/distri/core/pulls{/number}",
            "milestones_url": "https://api.github.com/repos/distri/core/milestones{/number}",
            "notifications_url": "https://api.github.com/repos/distri/core/notifications{?since,all,participating}",
            "labels_url": "https://api.github.com/repos/distri/core/labels{/name}",
            "releases_url": "https://api.github.com/repos/distri/core/releases{/id}",
            "created_at": "2013-10-14T17:04:33Z",
            "updated_at": "2013-12-24T00:49:21Z",
            "pushed_at": "2013-10-14T23:49:11Z",
            "git_url": "git://github.com/distri/core.git",
            "ssh_url": "git@github.com:distri/core.git",
            "clone_url": "https://github.com/distri/core.git",
            "svn_url": "https://github.com/distri/core",
            "homepage": null,
            "size": 592,
            "stargazers_count": 0,
            "watchers_count": 0,
            "language": "CoffeeScript",
            "has_issues": true,
            "has_downloads": true,
            "has_wiki": true,
            "forks_count": 0,
            "mirror_url": null,
            "open_issues_count": 0,
            "forks": 0,
            "open_issues": 0,
            "watchers": 0,
            "default_branch": "master",
            "master_branch": "master",
            "permissions": {
              "admin": true,
              "push": true,
              "pull": true
            },
            "organization": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "network_count": 0,
            "subscribers_count": 1,
            "branch": "v0.6.0",
            "defaultBranch": "master"
          },
          "dependencies": {}
        },
        "pixie-canvas": {
          "source": {
            "pixie.cson": {
              "path": "pixie.cson",
              "mode": "100644",
              "content": "entryPoint: \"pixie_canvas\"\nversion: \"0.9.2\"\n",
              "type": "blob"
            },
            "pixie_canvas.coffee.md": {
              "path": "pixie_canvas.coffee.md",
              "mode": "100644",
              "content": "Pixie Canvas\n============\n\nPixieCanvas provides a convenient wrapper for working with Context2d.\n\nMethods try to be as flexible as possible as to what arguments they take.\n\nNon-getter methods return `this` for method chaining.\n\n    TAU = 2 * Math.PI\n\n    module.exports = (options={}) ->\n        defaults options,\n          width: 400\n          height: 400\n          init: ->\n\n        canvas = document.createElement \"canvas\"\n        canvas.width = options.width\n        canvas.height = options.height\n\n        context = undefined\n\n        self =\n\n`clear` clears the entire canvas (or a portion of it).\n\nTo clear the entire canvas use `canvas.clear()`\n\n>     #! paint\n>     # Set up: Fill canvas with blue\n>     canvas.fill(\"blue\")\n>\n>     # Clear a portion of the canvas\n>     canvas.clear\n>       x: 50\n>       y: 50\n>       width: 50\n>       height: 50\n\n          clear: ({x, y, width, height}={}) ->\n            x ?= 0\n            y ?= 0\n            width = canvas.width unless width?\n            height = canvas.height unless height?\n\n            context.clearRect(x, y, width, height)\n\n            return this\n\nFills the entire canvas (or a specified section of it) with\nthe given color.\n\n>     #! paint\n>     # Paint the town (entire canvas) red\n>     canvas.fill \"red\"\n>\n>     # Fill a section of the canvas white (#FFF)\n>     canvas.fill\n>       x: 50\n>       y: 50\n>       width: 50\n>       height: 50\n>       color: \"#FFF\"\n\n          fill: (color={}) ->\n            unless (typeof color is \"string\") or color.channels\n              {x, y, width, height, bounds, color} = color\n\n            {x, y, width, height} = bounds if bounds\n\n            x ||= 0\n            y ||= 0\n            width = canvas.width unless width?\n            height = canvas.height unless height?\n\n            @fillColor(color)\n            context.fillRect(x, y, width, height)\n\n            return this\n\nA direct map to the Context2d draw image. `GameObject`s\nthat implement drawable will have this wrapped up nicely,\nso there is a good chance that you will not have to deal with\nit directly.\n\n>     #! paint\n>     $ \"<img>\",\n>       src: \"https://secure.gravatar.com/avatar/33117162fff8a9cf50544a604f60c045\"\n>       load: ->\n>         canvas.drawImage(this, 25, 25)\n\n          drawImage: (args...) ->\n            context.drawImage(args...)\n\n            return this\n\nDraws a circle at the specified position with the specified\nradius and color.\n\n>     #! paint\n>     # Draw a large orange circle\n>     canvas.drawCircle\n>       radius: 30\n>       position: Point(100, 75)\n>       color: \"orange\"\n>\n>     # You may also set a stroke\n>     canvas.drawCircle\n>       x: 25\n>       y: 50\n>       radius: 10\n>       color: \"blue\"\n>       stroke:\n>         color: \"red\"\n>         width: 1\n\nYou can pass in circle objects as well.\n\n>     #! paint\n>     # Create a circle object to set up the next examples\n>     circle =\n>       radius: 20\n>       x: 50\n>       y: 50\n>\n>     # Draw a given circle in yellow\n>     canvas.drawCircle\n>       circle: circle\n>       color: \"yellow\"\n>\n>     # Draw the circle in green at a different position\n>     canvas.drawCircle\n>       circle: circle\n>       position: Point(25, 75)\n>       color: \"green\"\n\nYou may set a stroke, or even pass in only a stroke to draw an unfilled circle.\n\n>     #! paint\n>     # Draw an outline circle in purple.\n>     canvas.drawCircle\n>       x: 50\n>       y: 75\n>       radius: 10\n>       stroke:\n>         color: \"purple\"\n>         width: 2\n>\n\n          drawCircle: ({x, y, radius, position, color, stroke, circle}) ->\n            {x, y, radius} = circle if circle\n            {x, y} = position if position\n\n            radius = 0 if radius < 0\n\n            context.beginPath()\n            context.arc(x, y, radius, 0, TAU, true)\n            context.closePath()\n\n            if color\n              @fillColor(color)\n              context.fill()\n\n            if stroke\n              @strokeColor(stroke.color)\n              @lineWidth(stroke.width)\n              context.stroke()\n\n            return this\n\nDraws a rectangle at the specified position with given\nwidth and height. Optionally takes a position, bounds\nand color argument.\n\n\n          drawRect: ({x, y, width, height, position, bounds, color, stroke}) ->\n            {x, y, width, height} = bounds if bounds\n            {x, y} = position if position\n\n            if color\n              @fillColor(color)\n              context.fillRect(x, y, width, height)\n\n            if stroke\n              @strokeColor(stroke.color)\n              @lineWidth(stroke.width)\n              context.strokeRect(x, y, width, height)\n\n            return @\n\n>     #! paint\n>     # Draw a red rectangle using x, y, width and height\n>     canvas.drawRect\n>       x: 50\n>       y: 50\n>       width: 50\n>       height: 50\n>       color: \"#F00\"\n\n----\n\nYou can mix and match position, witdth and height.\n\n>     #! paint\n>     canvas.drawRect\n>       position: Point(0, 0)\n>       width: 50\n>       height: 50\n>       color: \"blue\"\n>       stroke:\n>         color: \"orange\"\n>         width: 3\n\n----\n\nA bounds can be reused to draw multiple rectangles.\n\n>     #! paint\n>     bounds =\n>       x: 100\n>       y: 0\n>       width: 100\n>       height: 100\n>\n>     # Draw a purple rectangle using bounds\n>     canvas.drawRect\n>       bounds: bounds\n>       color: \"green\"\n>\n>     # Draw the outline of the same bounds, but at a different position\n>     canvas.drawRect\n>       bounds: bounds\n>       position: Point(0, 50)\n>       stroke:\n>         color: \"purple\"\n>         width: 2\n\n----\n\nDraw a line from `start` to `end`.\n\n>     #! paint\n>     # Draw a sweet diagonal\n>     canvas.drawLine\n>       start: Point(0, 0)\n>       end: Point(200, 200)\n>       color: \"purple\"\n>\n>     # Draw another sweet diagonal\n>     canvas.drawLine\n>       start: Point(200, 0)\n>       end: Point(0, 200)\n>       color: \"red\"\n>       width: 6\n>\n>     # Now draw a sweet horizontal with a direction and a length\n>     canvas.drawLine\n>       start: Point(0, 100)\n>       length: 200\n>       direction: Point(1, 0)\n>       color: \"orange\"\n\n          drawLine: ({start, end, width, color, direction, length}) ->\n            width ||= 3\n\n            if direction\n              end = direction.norm(length).add(start)\n\n            @lineWidth(width)\n            @strokeColor(color)\n\n            context.beginPath()\n            context.moveTo(start.x, start.y)\n            context.lineTo(end.x, end.y)\n            context.closePath()\n            context.stroke()\n\n            return this\n\nDraw a polygon.\n\n>     #! paint\n>     # Draw a sweet rhombus\n>     canvas.drawPoly\n>       points: [\n>         Point(50, 25)\n>         Point(75, 50)\n>         Point(50, 75)\n>         Point(25, 50)\n>       ]\n>       color: \"purple\"\n>       stroke:\n>         color: \"red\"\n>         width: 2\n\n          drawPoly: ({points, color, stroke}) ->\n            context.beginPath()\n            points.forEach (point, i) ->\n              if i == 0\n                context.moveTo(point.x, point.y)\n              else\n                context.lineTo(point.x, point.y)\n            context.lineTo points[0].x, points[0].y\n\n            if color\n              @fillColor(color)\n              context.fill()\n\n            if stroke\n              @strokeColor(stroke.color)\n              @lineWidth(stroke.width)\n              context.stroke()\n\n            return @\n\nDraw a rounded rectangle.\n\nAdapted from http://js-bits.blogspot.com/2010/07/canvas-rounded-corner-rectangles.html\n\n>     #! paint\n>     # Draw a purple rounded rectangle with a red outline\n>     canvas.drawRoundRect\n>       position: Point(25, 25)\n>       radius: 10\n>       width: 150\n>       height: 100\n>       color: \"purple\"\n>       stroke:\n>         color: \"red\"\n>         width: 2\n\n          drawRoundRect: ({x, y, width, height, radius, position, bounds, color, stroke}) ->\n            radius = 5 unless radius?\n\n            {x, y, width, height} = bounds if bounds\n            {x, y} = position if position\n\n            context.beginPath()\n            context.moveTo(x + radius, y)\n            context.lineTo(x + width - radius, y)\n            context.quadraticCurveTo(x + width, y, x + width, y + radius)\n            context.lineTo(x + width, y + height - radius)\n            context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)\n            context.lineTo(x + radius, y + height)\n            context.quadraticCurveTo(x, y + height, x, y + height - radius)\n            context.lineTo(x, y + radius)\n            context.quadraticCurveTo(x, y, x + radius, y)\n            context.closePath()\n\n            if color\n              @fillColor(color)\n              context.fill()\n\n            if stroke\n              @lineWidth(stroke.width)\n              @strokeColor(stroke.color)\n              context.stroke()\n\n            return this\n\nDraws text on the canvas at the given position, in the given color.\nIf no color is given then the previous fill color is used.\n\n>     #! paint\n>     # Fill canvas to indicate bounds\n>     canvas.fill\n>       color: '#eee'\n>\n>     # A line to indicate the baseline\n>     canvas.drawLine\n>       start: Point(25, 50)\n>       end: Point(125, 50)\n>       color: \"#333\"\n>       width: 1\n>\n>     # Draw some text, note the position of the baseline\n>     canvas.drawText\n>       position: Point(25, 50)\n>       color: \"red\"\n>       text: \"It's dangerous to go alone\"\n\n\n          drawText: ({x, y, text, position, color, font}) ->\n            {x, y} = position if position\n\n            @fillColor(color)\n            @font(font) if font\n            context.fillText(text, x, y)\n\n            return this\n\nCenters the given text on the canvas at the given y position. An x position\nor point position can also be given in which case the text is centered at the\nx, y or position value specified.\n\n>     #! paint\n>     # Fill canvas to indicate bounds\n>     canvas.fill\n>       color: \"#eee\"\n>\n>     # Center text on the screen at y value 25\n>     canvas.centerText\n>       y: 25\n>       color: \"red\"\n>       text: \"It's dangerous to go alone\"\n>\n>     # Center text at point (75, 75)\n>     canvas.centerText\n>       position: Point(75, 75)\n>       color: \"green\"\n>       text: \"take this\"\n\n          centerText: ({text, x, y, position, color, font}) ->\n            {x, y} = position if position\n\n            x = canvas.width / 2 unless x?\n\n            textWidth = @measureText(text)\n\n            @drawText {\n              text\n              color\n              font\n              x: x - (textWidth) / 2\n              y\n            }\n\nSetting the fill color:\n\n`canvas.fillColor(\"#FF0000\")`\n\nPassing no arguments returns the fillColor:\n\n`canvas.fillColor() # => \"#FF000000\"`\n\nYou can also pass a Color object:\n\n`canvas.fillColor(Color('sky blue'))`\n\n          fillColor: (color) ->\n            if color\n              if color.channels\n                context.fillStyle = color.toString()\n              else\n                context.fillStyle = color\n\n              return @\n            else\n              return context.fillStyle\n\nSetting the stroke color:\n\n`canvas.strokeColor(\"#FF0000\")`\n\nPassing no arguments returns the strokeColor:\n\n`canvas.strokeColor() # => \"#FF0000\"`\n\nYou can also pass a Color object:\n\n`canvas.strokeColor(Color('sky blue'))`\n\n          strokeColor: (color) ->\n            if color\n              if color.channels\n                context.strokeStyle = color.toString()\n              else\n                context.strokeStyle = color\n\n              return this\n            else\n              return context.strokeStyle\n\nDetermine how wide some text is.\n\n`canvas.measureText('Hello World!') # => 55`\n\nIt may have accuracy issues depending on the font used.\n\n          measureText: (text) ->\n            context.measureText(text).width\n\nPasses this canvas to the block with the given matrix transformation\napplied. All drawing methods called within the block will draw\ninto the canvas with the transformation applied. The transformation\nis removed at the end of the block, even if the block throws an error.\n\n          withTransform: (matrix, block) ->\n            context.save()\n\n            context.transform(\n              matrix.a,\n              matrix.b,\n              matrix.c,\n              matrix.d,\n              matrix.tx,\n              matrix.ty\n            )\n\n            try\n              block(this)\n            finally\n              context.restore()\n\n            return this\n\nStraight proxy to context `putImageData` method.\n\n          putImageData: (args...) ->\n            context.putImageData(args...)\n\n            return this\n\nContext getter.\n\n          context: ->\n            context\n\nGetter for the actual html canvas element.\n\n          element: ->\n            canvas\n\nStraight proxy to context pattern creation.\n\n          createPattern: (image, repitition) ->\n            context.createPattern(image, repitition)\n\nSet a clip rectangle.\n\n          clip: (x, y, width, height) ->\n            context.beginPath()\n            context.rect(x, y, width, height)\n            context.clip()\n\n            return this\n\nGenerate accessors that get properties from the context object.\n\n        contextAttrAccessor = (attrs...) ->\n          attrs.forEach (attr) ->\n            self[attr] = (newVal) ->\n              if newVal?\n                context[attr] = newVal\n                return @\n              else\n                context[attr]\n\n        contextAttrAccessor(\n          \"font\",\n          \"globalAlpha\",\n          \"globalCompositeOperation\",\n          \"lineWidth\",\n          \"textAlign\",\n        )\n\nGenerate accessors that get properties from the canvas object.\n\n        canvasAttrAccessor = (attrs...) ->\n          attrs.forEach (attr) ->\n            self[attr] = (newVal) ->\n              if newVal?\n                canvas[attr] = newVal\n                return @\n              else\n                canvas[attr]\n\n        canvasAttrAccessor(\n          \"height\",\n          \"width\",\n        )\n\n        context = canvas.getContext('2d')\n\n        options.init(self)\n\n        return self\n\nHelpers\n-------\n\nFill in default properties for an object, setting them only if they are not\nalready present.\n\n    defaults = (target, objects...) ->\n      for object in objects\n        for name of object\n          unless target.hasOwnProperty(name)\n            target[name] = object[name]\n\n      return target\n\nInteractive Examples\n--------------------\n\n>     #! setup\n>     Canvas = require \"/pixie_canvas\"\n>\n>     window.Point ?= (x, y) ->\n>       x: x\n>       y: y\n>\n>     Interactive.register \"paint\", ({source, runtimeElement}) ->\n>       canvas = Canvas\n>         width: 400\n>         height: 200\n>\n>       code = CoffeeScript.compile(source)\n>\n>       runtimeElement.empty().append canvas.element()\n>       Function(\"canvas\", code)(canvas)\n",
              "type": "blob"
            },
            "test/test.coffee": {
              "path": "test/test.coffee",
              "mode": "100644",
              "content": "Canvas = require \"../pixie_canvas\"\n\ndescribe \"pixie canvas\", ->\n  it \"Should create a canvas\", ->\n    canvas = Canvas\n      width: 400\n      height: 150\n\n    assert canvas\n\n    assert canvas.width() is 400\n",
              "type": "blob"
            }
          },
          "distribution": {
            "pixie": {
              "path": "pixie",
              "content": "module.exports = {\"entryPoint\":\"pixie_canvas\",\"version\":\"0.9.2\"};",
              "type": "blob"
            },
            "pixie_canvas": {
              "path": "pixie_canvas",
              "content": "(function() {\n  var TAU, defaults,\n    __slice = [].slice;\n\n  TAU = 2 * Math.PI;\n\n  module.exports = function(options) {\n    var canvas, canvasAttrAccessor, context, contextAttrAccessor, self;\n    if (options == null) {\n      options = {};\n    }\n    defaults(options, {\n      width: 400,\n      height: 400,\n      init: function() {}\n    });\n    canvas = document.createElement(\"canvas\");\n    canvas.width = options.width;\n    canvas.height = options.height;\n    context = void 0;\n    self = {\n      clear: function(_arg) {\n        var height, width, x, y, _ref;\n        _ref = _arg != null ? _arg : {}, x = _ref.x, y = _ref.y, width = _ref.width, height = _ref.height;\n        if (x == null) {\n          x = 0;\n        }\n        if (y == null) {\n          y = 0;\n        }\n        if (width == null) {\n          width = canvas.width;\n        }\n        if (height == null) {\n          height = canvas.height;\n        }\n        context.clearRect(x, y, width, height);\n        return this;\n      },\n      fill: function(color) {\n        var bounds, height, width, x, y, _ref;\n        if (color == null) {\n          color = {};\n        }\n        if (!((typeof color === \"string\") || color.channels)) {\n          _ref = color, x = _ref.x, y = _ref.y, width = _ref.width, height = _ref.height, bounds = _ref.bounds, color = _ref.color;\n        }\n        if (bounds) {\n          x = bounds.x, y = bounds.y, width = bounds.width, height = bounds.height;\n        }\n        x || (x = 0);\n        y || (y = 0);\n        if (width == null) {\n          width = canvas.width;\n        }\n        if (height == null) {\n          height = canvas.height;\n        }\n        this.fillColor(color);\n        context.fillRect(x, y, width, height);\n        return this;\n      },\n      drawImage: function() {\n        var args;\n        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        context.drawImage.apply(context, args);\n        return this;\n      },\n      drawCircle: function(_arg) {\n        var circle, color, position, radius, stroke, x, y;\n        x = _arg.x, y = _arg.y, radius = _arg.radius, position = _arg.position, color = _arg.color, stroke = _arg.stroke, circle = _arg.circle;\n        if (circle) {\n          x = circle.x, y = circle.y, radius = circle.radius;\n        }\n        if (position) {\n          x = position.x, y = position.y;\n        }\n        if (radius < 0) {\n          radius = 0;\n        }\n        context.beginPath();\n        context.arc(x, y, radius, 0, TAU, true);\n        context.closePath();\n        if (color) {\n          this.fillColor(color);\n          context.fill();\n        }\n        if (stroke) {\n          this.strokeColor(stroke.color);\n          this.lineWidth(stroke.width);\n          context.stroke();\n        }\n        return this;\n      },\n      drawRect: function(_arg) {\n        var bounds, color, height, position, stroke, width, x, y;\n        x = _arg.x, y = _arg.y, width = _arg.width, height = _arg.height, position = _arg.position, bounds = _arg.bounds, color = _arg.color, stroke = _arg.stroke;\n        if (bounds) {\n          x = bounds.x, y = bounds.y, width = bounds.width, height = bounds.height;\n        }\n        if (position) {\n          x = position.x, y = position.y;\n        }\n        if (color) {\n          this.fillColor(color);\n          context.fillRect(x, y, width, height);\n        }\n        if (stroke) {\n          this.strokeColor(stroke.color);\n          this.lineWidth(stroke.width);\n          context.strokeRect(x, y, width, height);\n        }\n        return this;\n      },\n      drawLine: function(_arg) {\n        var color, direction, end, length, start, width;\n        start = _arg.start, end = _arg.end, width = _arg.width, color = _arg.color, direction = _arg.direction, length = _arg.length;\n        width || (width = 3);\n        if (direction) {\n          end = direction.norm(length).add(start);\n        }\n        this.lineWidth(width);\n        this.strokeColor(color);\n        context.beginPath();\n        context.moveTo(start.x, start.y);\n        context.lineTo(end.x, end.y);\n        context.closePath();\n        context.stroke();\n        return this;\n      },\n      drawPoly: function(_arg) {\n        var color, points, stroke;\n        points = _arg.points, color = _arg.color, stroke = _arg.stroke;\n        context.beginPath();\n        points.forEach(function(point, i) {\n          if (i === 0) {\n            return context.moveTo(point.x, point.y);\n          } else {\n            return context.lineTo(point.x, point.y);\n          }\n        });\n        context.lineTo(points[0].x, points[0].y);\n        if (color) {\n          this.fillColor(color);\n          context.fill();\n        }\n        if (stroke) {\n          this.strokeColor(stroke.color);\n          this.lineWidth(stroke.width);\n          context.stroke();\n        }\n        return this;\n      },\n      drawRoundRect: function(_arg) {\n        var bounds, color, height, position, radius, stroke, width, x, y;\n        x = _arg.x, y = _arg.y, width = _arg.width, height = _arg.height, radius = _arg.radius, position = _arg.position, bounds = _arg.bounds, color = _arg.color, stroke = _arg.stroke;\n        if (radius == null) {\n          radius = 5;\n        }\n        if (bounds) {\n          x = bounds.x, y = bounds.y, width = bounds.width, height = bounds.height;\n        }\n        if (position) {\n          x = position.x, y = position.y;\n        }\n        context.beginPath();\n        context.moveTo(x + radius, y);\n        context.lineTo(x + width - radius, y);\n        context.quadraticCurveTo(x + width, y, x + width, y + radius);\n        context.lineTo(x + width, y + height - radius);\n        context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);\n        context.lineTo(x + radius, y + height);\n        context.quadraticCurveTo(x, y + height, x, y + height - radius);\n        context.lineTo(x, y + radius);\n        context.quadraticCurveTo(x, y, x + radius, y);\n        context.closePath();\n        if (color) {\n          this.fillColor(color);\n          context.fill();\n        }\n        if (stroke) {\n          this.lineWidth(stroke.width);\n          this.strokeColor(stroke.color);\n          context.stroke();\n        }\n        return this;\n      },\n      drawText: function(_arg) {\n        var color, font, position, text, x, y;\n        x = _arg.x, y = _arg.y, text = _arg.text, position = _arg.position, color = _arg.color, font = _arg.font;\n        if (position) {\n          x = position.x, y = position.y;\n        }\n        this.fillColor(color);\n        if (font) {\n          this.font(font);\n        }\n        context.fillText(text, x, y);\n        return this;\n      },\n      centerText: function(_arg) {\n        var color, font, position, text, textWidth, x, y;\n        text = _arg.text, x = _arg.x, y = _arg.y, position = _arg.position, color = _arg.color, font = _arg.font;\n        if (position) {\n          x = position.x, y = position.y;\n        }\n        if (x == null) {\n          x = canvas.width / 2;\n        }\n        textWidth = this.measureText(text);\n        return this.drawText({\n          text: text,\n          color: color,\n          font: font,\n          x: x - textWidth / 2,\n          y: y\n        });\n      },\n      fillColor: function(color) {\n        if (color) {\n          if (color.channels) {\n            context.fillStyle = color.toString();\n          } else {\n            context.fillStyle = color;\n          }\n          return this;\n        } else {\n          return context.fillStyle;\n        }\n      },\n      strokeColor: function(color) {\n        if (color) {\n          if (color.channels) {\n            context.strokeStyle = color.toString();\n          } else {\n            context.strokeStyle = color;\n          }\n          return this;\n        } else {\n          return context.strokeStyle;\n        }\n      },\n      measureText: function(text) {\n        return context.measureText(text).width;\n      },\n      withTransform: function(matrix, block) {\n        context.save();\n        context.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);\n        try {\n          block(this);\n        } finally {\n          context.restore();\n        }\n        return this;\n      },\n      putImageData: function() {\n        var args;\n        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        context.putImageData.apply(context, args);\n        return this;\n      },\n      context: function() {\n        return context;\n      },\n      element: function() {\n        return canvas;\n      },\n      createPattern: function(image, repitition) {\n        return context.createPattern(image, repitition);\n      },\n      clip: function(x, y, width, height) {\n        context.beginPath();\n        context.rect(x, y, width, height);\n        context.clip();\n        return this;\n      }\n    };\n    contextAttrAccessor = function() {\n      var attrs;\n      attrs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n      return attrs.forEach(function(attr) {\n        return self[attr] = function(newVal) {\n          if (newVal != null) {\n            context[attr] = newVal;\n            return this;\n          } else {\n            return context[attr];\n          }\n        };\n      });\n    };\n    contextAttrAccessor(\"font\", \"globalAlpha\", \"globalCompositeOperation\", \"lineWidth\", \"textAlign\");\n    canvasAttrAccessor = function() {\n      var attrs;\n      attrs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n      return attrs.forEach(function(attr) {\n        return self[attr] = function(newVal) {\n          if (newVal != null) {\n            canvas[attr] = newVal;\n            return this;\n          } else {\n            return canvas[attr];\n          }\n        };\n      });\n    };\n    canvasAttrAccessor(\"height\", \"width\");\n    context = canvas.getContext('2d');\n    options.init(self);\n    return self;\n  };\n\n  defaults = function() {\n    var name, object, objects, target, _i, _len;\n    target = arguments[0], objects = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n    for (_i = 0, _len = objects.length; _i < _len; _i++) {\n      object = objects[_i];\n      for (name in object) {\n        if (!target.hasOwnProperty(name)) {\n          target[name] = object[name];\n        }\n      }\n    }\n    return target;\n  };\n\n}).call(this);\n\n//# sourceURL=pixie_canvas.coffee",
              "type": "blob"
            },
            "test/test": {
              "path": "test/test",
              "content": "(function() {\n  var Canvas;\n\n  Canvas = require(\"../pixie_canvas\");\n\n  describe(\"pixie canvas\", function() {\n    return it(\"Should create a canvas\", function() {\n      var canvas;\n      canvas = Canvas({\n        width: 400,\n        height: 150\n      });\n      assert(canvas);\n      return assert(canvas.width() === 400);\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/test.coffee",
              "type": "blob"
            }
          },
          "progenitor": {
            "url": "http://strd6.github.io/editor/"
          },
          "version": "0.9.2",
          "entryPoint": "pixie_canvas",
          "repository": {
            "id": 12096899,
            "name": "pixie-canvas",
            "full_name": "distri/pixie-canvas",
            "owner": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "private": false,
            "html_url": "https://github.com/distri/pixie-canvas",
            "description": "A pretty ok HTML5 canvas wrapper",
            "fork": false,
            "url": "https://api.github.com/repos/distri/pixie-canvas",
            "forks_url": "https://api.github.com/repos/distri/pixie-canvas/forks",
            "keys_url": "https://api.github.com/repos/distri/pixie-canvas/keys{/key_id}",
            "collaborators_url": "https://api.github.com/repos/distri/pixie-canvas/collaborators{/collaborator}",
            "teams_url": "https://api.github.com/repos/distri/pixie-canvas/teams",
            "hooks_url": "https://api.github.com/repos/distri/pixie-canvas/hooks",
            "issue_events_url": "https://api.github.com/repos/distri/pixie-canvas/issues/events{/number}",
            "events_url": "https://api.github.com/repos/distri/pixie-canvas/events",
            "assignees_url": "https://api.github.com/repos/distri/pixie-canvas/assignees{/user}",
            "branches_url": "https://api.github.com/repos/distri/pixie-canvas/branches{/branch}",
            "tags_url": "https://api.github.com/repos/distri/pixie-canvas/tags",
            "blobs_url": "https://api.github.com/repos/distri/pixie-canvas/git/blobs{/sha}",
            "git_tags_url": "https://api.github.com/repos/distri/pixie-canvas/git/tags{/sha}",
            "git_refs_url": "https://api.github.com/repos/distri/pixie-canvas/git/refs{/sha}",
            "trees_url": "https://api.github.com/repos/distri/pixie-canvas/git/trees{/sha}",
            "statuses_url": "https://api.github.com/repos/distri/pixie-canvas/statuses/{sha}",
            "languages_url": "https://api.github.com/repos/distri/pixie-canvas/languages",
            "stargazers_url": "https://api.github.com/repos/distri/pixie-canvas/stargazers",
            "contributors_url": "https://api.github.com/repos/distri/pixie-canvas/contributors",
            "subscribers_url": "https://api.github.com/repos/distri/pixie-canvas/subscribers",
            "subscription_url": "https://api.github.com/repos/distri/pixie-canvas/subscription",
            "commits_url": "https://api.github.com/repos/distri/pixie-canvas/commits{/sha}",
            "git_commits_url": "https://api.github.com/repos/distri/pixie-canvas/git/commits{/sha}",
            "comments_url": "https://api.github.com/repos/distri/pixie-canvas/comments{/number}",
            "issue_comment_url": "https://api.github.com/repos/distri/pixie-canvas/issues/comments/{number}",
            "contents_url": "https://api.github.com/repos/distri/pixie-canvas/contents/{+path}",
            "compare_url": "https://api.github.com/repos/distri/pixie-canvas/compare/{base}...{head}",
            "merges_url": "https://api.github.com/repos/distri/pixie-canvas/merges",
            "archive_url": "https://api.github.com/repos/distri/pixie-canvas/{archive_format}{/ref}",
            "downloads_url": "https://api.github.com/repos/distri/pixie-canvas/downloads",
            "issues_url": "https://api.github.com/repos/distri/pixie-canvas/issues{/number}",
            "pulls_url": "https://api.github.com/repos/distri/pixie-canvas/pulls{/number}",
            "milestones_url": "https://api.github.com/repos/distri/pixie-canvas/milestones{/number}",
            "notifications_url": "https://api.github.com/repos/distri/pixie-canvas/notifications{?since,all,participating}",
            "labels_url": "https://api.github.com/repos/distri/pixie-canvas/labels{/name}",
            "releases_url": "https://api.github.com/repos/distri/pixie-canvas/releases{/id}",
            "created_at": "2013-08-14T01:15:34Z",
            "updated_at": "2013-11-29T20:54:07Z",
            "pushed_at": "2013-11-29T20:54:07Z",
            "git_url": "git://github.com/distri/pixie-canvas.git",
            "ssh_url": "git@github.com:distri/pixie-canvas.git",
            "clone_url": "https://github.com/distri/pixie-canvas.git",
            "svn_url": "https://github.com/distri/pixie-canvas",
            "homepage": null,
            "size": 664,
            "stargazers_count": 0,
            "watchers_count": 0,
            "language": "CoffeeScript",
            "has_issues": true,
            "has_downloads": true,
            "has_wiki": true,
            "forks_count": 0,
            "mirror_url": null,
            "open_issues_count": 1,
            "forks": 0,
            "open_issues": 1,
            "watchers": 0,
            "default_branch": "master",
            "master_branch": "master",
            "permissions": {
              "admin": true,
              "push": true,
              "pull": true
            },
            "organization": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "network_count": 0,
            "subscribers_count": 1,
            "branch": "v0.9.2",
            "publishBranch": "gh-pages"
          },
          "dependencies": {}
        }
      }
    }
  }
});