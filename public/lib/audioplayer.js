class AudioPlayer {
  constructor(context) {
    this.context = context
  }

  play(data_recording) {
    context = this.context
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

  loop_start( data_recording, loop_node = null) {
    context = this.context
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

  loop_stop( loop_node ) {
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
}
