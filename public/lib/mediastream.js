class MediaStream {
  constructor(context) {
    this.context = context
    this.ended = () => {}
    this.mute = () => {}
    this.unmute = () => {}
  }

  async init() {
    // TODO: Add polyfill for old browsers (https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#using_the_new_api_in_older_browsers)
    if ( window.isSecureContext == false ) {
      throw new Error( "Insecure window context, microphone inaccessible." );
    }
    let mediastream = await navigator.mediaDevices.getUserMedia({ // May throw NotAllowedError or NotFoundError
      audio: { // constraints
        noiseSuppression: false,
        echoCancellation: false,
        autoGainControl: false,
        sampleRate: 44100, // enforce constraint
        sampleSize: 128,
        channelCount: 1,
      },
      video: false
    });

    mediastream.addEventListener("removetrack", () => {
      // not expected to occur
      endedcb();
    });
    mediastream.addEventListener("addtrack", () => {
      // not handled
    });

    if (mediastream.getAudioTracks().length < 1) {
      throw new Error("No audio input media track created")
    }
    if (mediastream.getAudioTracks().length > 1) {
      throw new Error("Expected exactly one input media track");
    }
    this.stream = mediastream
    this.mic = mediastream.getAudioTracks()[0];

    this.mic.addEventListener("ended" , this.ended);
    this.mic.addEventListener("mute"  , this.mute);
    this.mic.addEventListener("unmute", this.unmute);
  }
  close() {
      this.mediastream.getAudioTracks().forEach(track => { track.stop(); });
      this.mediastream = null;
  }
  properties() {
  // if (!Array.isArray(mediastream.getAudioTracks())) {
  //   throw Error("No audio track in mediastream")
  // }
  // if (mediastream.getAudioTracks().length == 0) {
  //   throw Error("No audio track in mediastream")
  // }
  // let microphone = mediastream.getAudioTracks()[0];
  // // List input rate
  }
}
