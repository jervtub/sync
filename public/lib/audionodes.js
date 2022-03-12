function delay_node(audiocontext) {
  // Create a delay-node (delay-node)
  let delay_node = audiocontext.createDelay(10); // Delay with 10 seconds buffer
      delay_node.delayTime.value = 0;
  // Create a constant-node to manipulate the delay level of the delay-node
  let delay_value = audiocontext.createConstantSource();
      delay_value.connect(delay_node.delayTime);
      delay_value.offset.value = 0; // no delay
      delay_value.start();
  return [delay_node, delay_value]
}

function gain_node(audiocontext) {
  // Create a gain-node (gain-node)
  let gain_node = audiocontext.createGain();
      gain_node.gain.value = 0;
  // Create a constant-node to manipulate the gain level of the gain-node
  let gain_value = audiocontext.createConstantSource();
      gain_value.connect(gain_node.gain);
      gain_value.offset.value = 0.0; // silent
      gain_value.start()
  return [gain_node, gain_value]
}

function play_signal(audiocontext, arraybuf, localtime ) {
  let buffer      = audiocontext.createBuffer( 1, arraybuf.length, samplerate(audiocontext))
      buffer.copyToChannel( sound, 0 );
  let node        = audiocontext.createBufferSource();
      node.buffer = buffer;
      node.connect( audiocontext.destination );
  let ctime = audiocontext.currentTime + ((time - Date.now()) / 1000) ;
      node.start( ctime );
}
