let mount_generate = () => {
  let onMount = async () => {
    let context = null;
    let microphone = null;
    let error = null;
    try {
      // derive sample rate of microphone
      context = new (AudioContext || window.AudioContext || window.webkitAudioContext || window.mozAudioContext)({
        // Sample rate is disabled, since microphone input sample rate is unknown yet must be equal. Thus let input decide this.
      });
      if ( window.isSecureContext == false ) {
        throw new Error( "Insecure window context, microphone inaccessible." );
      }
      let mediastream = await navigator.mediaDevices.getUserMedia({ // May throw NotAllowedError or NotFoundError
        audio: { // constraints
          noiseSuppression: false,
          echoCancellation: false,
          autoGainControl: false,
          // sampleRate: 44100, // enforce constraint
          // sampleSize: 128,
          channelCount: 1,
        },
        video: false
      });
      if (mediastream.getAudioTracks().length < 1) { throw new Error("No audio input media track created"); }
      if (mediastream.getAudioTracks().length > 1) { throw new Error("Expected exactly one input media track"); }
      microphone = mediastream.getAudioTracks()[0];
    } catch (e) {
      error = "Failed to retrieve microphone"
    }
    let response = await fetch(`/gen?rate=${context.sampleRate}`)
    console.log(await response.json())
  	em_s.innerText = context.sampleRate
  	div_generate.style.display = "block"
    // console.log(new URL(document.URL).origin)
    // window.location.href = new URL(document.URL).origin
  }
  onMount()
}
