function noise( sample_size ) {
  // Prepare noise data.
  let data_noise = new Float32Array( sample_size );
  for (let i = 0; i < sample_size; i++) {
    data_noise[i] = Math.random() * 2 - 1;
  }
  return data_noise;
}

function osc( sample_size, frequency ) {
  let data_osc = new Float32Array( sample_size );
  let dt = ( 2 * Math.PI * frequency ) / sample_size;
  for ( let i = 0; i < sample_size; i++ ) {
    data_osc[i] = Math.cos(i * dt);
  }
  return data_osc;
}
