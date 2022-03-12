async function signal ( context, sound, ctime, target_node ) {
  try {
    let buffer      = context.createBuffer( 1, sound.length, context.sampleRate );
        buffer.copyToChannel( sound, 0 );
    let node        = context.createBufferSource();
        node.buffer = buffer;
        node.connect( target_node );
        node.start( ctime );
  } catch (e) {
    console.error("Failed to produce signal")
    console.error(e)
    return false
  }
  return true
}

async function stream_sound( context, sound, target_node ) {
  let sound_frames = sound.length
  let samplerate = context.sampleRate
  let time_to_play = sound_frames/samplerate;
  let counter = 0
  let scheduled = context.currentTime + time_to_play + 0.1
  let current = context.currentTime
  // Schedule two extra ahead
  console.log(scheduled,current,time_to_play)
  let interval = setInterval(async () => {
    while (scheduled < current + 3 * time_to_play) {
      console.log("Scheduling at " + scheduled)
      let res = await signal( context, sound, scheduled, target_node  )
      if (!res) {
        console.error("Failed to stream sound");
        clearInterval(interval)
        break;
      }
      scheduled += time_to_play
    }
    current = context.currentTime
  }, time_to_play * 1000);
  return interval
  // clearInterval(interval)
}

async function stream_sounds( context, sounds, target_node ) {
  let sound_frames = sounds[0].length
  let samplerate = context.sampleRate
  let time_to_play = sound_frames/samplerate;
  let counter = 0
  let scheduled = context.currentTime
  let current = context.currentTime
  // Schedule two extra ahead
  // console.log(scheduled,current,time_to_play)
  let interval = setInterval(async () => {
    while (scheduled < current + 3 * time_to_play) {
      console.log("scheduled ", scheduled, " counter ", counter)
      let res = await signal( context, sounds[counter], scheduled, target_node  )
      counter = (counter + 1) % sounds.length;
      if (!res) {
        console.error("Failed to stream sound");
        clearInterval(interval)
        break;
      }
      scheduled += time_to_play
    }
    current = scheduled
  }, time_to_play * 1000);
  return interval
  // clearInterval(interval)
}
