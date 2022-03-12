/**
 * Download WAV. file in raw Uint8Array.
 * @param   {string} url URL download link.
 * @returns {ArrayBuffer}     WAV data, raw Uint8Array.
 */
async function download_wav(url) {
  const response = await fetch(url);
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

/**
 * Decode WAV. file in raw Uint8Array to a Float32Array.
 * @param   {ArrayBuffer} data Raw WAV data.
 * @returns {Float32Array} Audio data.
 */
function decode_wav( data ) {
  let data_recording = new Float32Array( Math.floor( (data.byteLength - 44) / 2));
  // let view = new DataView( new ArrayBuffer( data ));
  let view = new DataView( data );
  const INT16MAX = Math.pow(2, 14) - 1; // Signed, first bit sets pos or neg.
  for (let i = 0; i < Math.floor( (data.byteLength - 44) / 2); i++) {
    data_recording[i] = view.getInt16(44 + 2 * i, true) / INT16MAX;
  }
  return data_recording;
}

async function get_wav ( url ) {
  let data = await download_wav ( url );
  return decode_wav ( data );
}
