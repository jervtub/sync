function play(context, data_recording) {
  return new Promise(function(resolve, reject) {
    // Add playback.
    let audio_buffer = context.createBuffer( 1, data_recording.length, 44100 );
    audio_buffer.copyToChannel(data_recording, 0);
    let node_play = context.createBufferSource();
    node_play.buffer = audio_buffer;

    // Connect to destination.
    node_play.connect(context.destination);
    // Begin playback.
    node_play.start();
    node_play.addEventListener("ended", () => {
      resolve();
    });
  });
}

function loop_start( context, data_recording, loop_node = null) {
  // Stop loop, if so.
  try {
    loop_stop( loop_node );
  } catch ( err ) { ; }

  // Setup audio buffer.
  let audio_buffer = context.createBuffer(
    1,
    data_recording.length,
    context.sampleRate
  );
  audio_buffer.copyToChannel( data_recording, 0 );

  // Setup audio node.
  let node_play = context.createBufferSource();
  node_play.buffer = audio_buffer;
  node_play.loop = true;
  node_play.connect( context.destination );
  node_play.start();
  return node_play;
}

function loop_stop( loop_node ) {
  if ( !loop_node ) {
    throw Error( "Loop node does not exist." );
  } else if ( typeof loop_node.stop !== "function" ){
    throw Error( "Stop function not defined on loop node." )
  } else {
    try {
      loop_node.stop();
    } catch( err ) {
      throw Error( "Could not stop loop node." );
    }
  }
}

async function download_wav(url) {
  const response = await fetch(url);
  console.log(response)
  const reader = response.body.getReader();
  let { value: chunk, done: is_reader_done } = await reader.read();
  let arrs = [chunk]
  for (;;) {
    ({ value: chunk, done: is_reader_done } = await reader.read());
    if ( is_reader_done ) { break; }
    arrs.push( chunk );
  }
  let size = arrs.reduce(( acc, val, ind ) => acc += val.byteLength, 0);
  const wav = new ArrayBuffer( size );
  const uint8 = new Uint8Array( wav );
  arrs.reduce(( acc, val, ind ) => {
    uint8.set( val, acc );
    return acc + val.byteLength;
  }, 0 );
  return wav;
}

async function fetch_song(context, url) {
  return new Promise(function(resolve, reject) {
    download_wav(url)
    .then(wav => {
      context.decodeAudioData(wav, function(buffer) {
        resolve(buffer.getChannelData(0))
      })
    })
  });
}

async function fetch_buffer(context, url) {
  return new Promise(function(resolve, reject) {
    download_wav(url)
    .then(wav => {
      context.decodeAudioData(wav, function(buffer) {
        resolve(buffer)
      })
    })
    .catch(e => {
      console.error("Error with decoding audio data" + e.err)
    })
  });
}

async function fetch_song_samples(context, url) {
  return new Promise(function(resolve, reject) {
    download_wav(url)
    .then(wav => {
      context.decodeAudioData(wav, function(buffer) {
        resolve(buffer.getChannelData(0))
      })
    })
  });
}

/**
 * Decode WAV. file in raw Uint8Array to a Float32Array.
 * @param   {ArrayBuffer} data Raw WAV data.
 * @returns {Float32Array} Audio data.
 */
function decode_wav( data ) {
  let data_recording = new Float32Array((data.byteLength - 44) / 2);
  // let view = new DataView( new ArrayBuffer( data ));
  let view = new DataView( data );
  const INT16MAX = Math.pow(2, 14) - 1; // Signed, first bit sets pos or neg.
  for (let i = 0; i < (data.byteLength - 44) / 2; i++) {
    console.log(i)
    data_recording[i] = view.getInt16(44 + 2 * i, true) / INT16MAX;
  }
  return data_recording;
}

function load_wav(file) {
  console.log("load wav")
  return new Promise(function(resolve, reject) {
    let reader = new FileReader();
    reader.addEventListener('load', function loading(e) {
      console.log("Read occured");
      // Read data.
      let data = e.target.result;
      let data_recording = new Float32Array((data.byteLength - 44) / 2);
      let view = new DataView(data);
      const INT16MAX = Math.pow(2, 14) - 1; // Signed, first bit sets pos or neg.
      for (let i = 0; i < (data.byteLength - 44) / 2; i++) {
        data_recording[i] = view.getInt16(44 + 2 * i, true) / INT16MAX;
      }
      reader.removeEventListener("load", loading);
      resolve(data_recording);
    });
    // https://developer.mozilla.org/en-US/docs/Web/API/FileReader
    reader.readAsArrayBuffer(file);
    console.log("Reading");
  });
}

// import FileSaver from "file-saver";
function encodeWAV(samples, sampleRate = 48000, isMono = true) {
  /** [jervtub 2020-05-11 10:05]
    * Additional specifications:
    * [Documentation for module RiffFile.](http://www.lightlink.com/tjweber/StripWav/RIFFFile.txt)
    * [Documentation for module WAVE.](http://www.lightlink.com/tjweber/StripWav/WAVE.txt)
    * [RIFF file structure](https://johnloomis.org/cpe102/asgn/asgn1/riff.html)
    **/

  function writeString(view, offset, str) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, new TextEncoder("utf-8").encode(str[i]), true);
    }
  }

  // Correct for single channel.
  if (isMono) {
    // Header (44 bytes) + content (16 bit = 2 byte per sample) (yet mono, so we have 2 bytes filled, then two bytes skipped)
    let buffer = new ArrayBuffer(44 + samples.length * 2);
    let view = new DataView(buffer);

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true); // Length of the entire file - 8
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Describing WAVE data format (16-bit PCM)
    view.setUint16(20, 1, true); // formatTag
    view.setUint16(22, 1, true); // channels
    view.setUint32(24, sampleRate, true); // samples per sec
    view.setUint32(28, sampleRate * 2, true); // avg bytes per sec
    view.setUint16(32, 2, true); // block align
    view.setUint16(34, 16, true); // bits per sample
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);

    //float32 to Int 16 pcm
    const INT16MAX = Math.pow(2, 14) - 1; // Signed, first bit sets pos or neg.
    for (let i = 0; i < samples.length - 1; i ++) {
      // view.setInt16(44 + 2 * i , (INT16MAX * samples[i] ) >> 0 );
      view.setUint16(44 + 2 * i , (INT16MAX * samples[i] ) >> 0, true );
      // view.setInt16(44 + 2 * i ,  samples[i]); // <-- incorrect, must be converted to 16-bit PCM.
    }

    console.log(view);
    return view;
  } else {
    // Header (44 bytes) + content (16 bit = 2 byte per sample)
    let buffer = new ArrayBuffer(44 + samples.length * 2);
    let view = new DataView(buffer);

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 32 + samples.length * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 2, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 4, true);
    view.setUint16(32, 4, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);

    //float32 to Int 16 pcm
    const INT16MAX = Math.pow(2, 14) - 1; // Signed, first bit sets pos or neg.
    for (let i = 0; i < samples.length - 1; i ++) {
      view.setInt16(44 + 2 * i , (INT16MAX * samples[i] ) >> 0 );
    }

    return view;
  }
}
// function save_wav(context, data_recording) {
//   let recording_wav = new Blob(
//     [encodeWAV(data_recording, 44100)],
//     { type: "audio/mpeg" });
//   FileSaver.saveAs(recording_wav, "recording.wav");
// }
