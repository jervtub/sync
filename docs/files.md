## Files
  - [server.js](../server.js): Server code for file handling and session management.
  - [public](../public): Code required to be public for serving client.
    - [main.html](../public/main.html): Homepage of the website.
    - [global.css](../public/main.html): Some styling tweaks.
    - [lib](../public/lib): Library code.
      - [classes](../public/lib/classes): Classes.
        - [audioplayer](../public/lib/classes/audioplayer.js): Playback (scheduling) related activities.
        - [context](../public/lib/classes/context.js): AudioContext wrapper.
        - [correlator](../public/lib/classes/correlator.js): Cross-correlation wrapper.
        - [detector](../public/lib/classes/detector.js): Peak detection handler.
        - [input analyser](../public/lib/classes/input_analyser.js): todo
        - [recorder](../public/lib/classes/recorder.js):
      - [utils](../public/lib/utils): Helper functionality
        - [audionodes](../public/lib/utils/audionodes.js): AudioNode-related functionality
        - [import](../public/lib/utils/import.js): Import function
        - [math](../public/lib/utils/math.js): All math related functionality
        - [music](../public/lib/utils/music.js): Music
        - [ntp](../public/lib/utils/ntp.js): NTP function
        - [signal](../public/lib/utils/signal.js): Signal
        - [sleep](../public/lib/utils/sleep.js): Sleep
        - [wav](../public/lib/utils/wav.js): WAV-file functionality (import/export)
      - [external](../public/external/): External code
        - [simple.css](../public/external/simple.css): Overall webpage styling
        - [toast.css](../public/external/toast.css): Simplifying grid-layout styling
        - [socket.io-client.js](../public/external/socket.io-client.js): Socket.io client-sided code
        - [gpu](../public/external/gpu): GPU cross-correlation dependencies
          - [m4.js](../public/external/gpu/m4.js):
          - [webgl-utils](../public/external/gpu/webgl-utils.js):
        - [jsfft](../public/external/jsfft): Frequency analysis dependencies
          - [Complex Array class definition](../public/external/jsfft/complex_array.js):
          - [FFT base functionality](../public/external/jsfft/fft.js):