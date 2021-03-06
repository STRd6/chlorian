// From https://github.com/gasman/jasmid/blob/master/stream.js
// Modified to use byte array

module.exports = function (array) {
  var position = 0;

  function read (length) {
    var result = String.fromCharCode.apply(String, array.slice(position, position + length));
    position += length;

    return result;
  }

  function subarray (length) {
    var result = array.subarray(position, position + length);
    position += length;

    return result;
  }

  /* read a big-endian 32-bit integer */
  function readInt32 () {
    var result = (
        (array[position] << 24)
      + (array[position + 1] << 16)
      + (array[position + 2] << 8)
      + array[position + 3]);
    position += 4;

    return result;
  }

  /* read a big-endian 16-bit integer */
  function readInt16 () {
    var result = (
        (array[position] << 8)
      + array[position + 1]);
    position += 2;

    return result;
  }

  /* read an 8-bit integer */
  function readInt8 (signed) {
    var result = array[position];
    if (signed && result > 127) {
      result -= 256;
    }
    position += 1;

    return result;
  }

  function eof () {
    return position >= array.length;
  }

  /* read a MIDI-style variable-length integer
  	(big-endian value in groups of 7 bits,
  	with top bit set to signify that another byte follows)
  */
  function readVarInt () {
    var result = 0;
    while (true) {
      var b = readInt8();
      if (b & 0x80) {
        result += (b & 0x7f);
        result <<= 7;
      } else {
        /* b is the last byte */
        return result + b;
      }
    }
  }

  return {
    'eof': eof,
    'read': read,
    'readInt32': readInt32,
    'readInt16': readInt16,
    'readInt8': readInt8,
    'readVarInt': readVarInt,
    'subarray' : subarray
  };
};
