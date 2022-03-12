# Splitting client and server
  For socket support, split client and server.
  Bypass the work in progress of svelte kit, that is trying to unify both.
  Currently it does not work. I am afraid the socket connection for hot reloading is influencing socket connectivity.

# Getting microphone sample rate
  So rumors on the internet mention how the web browser re-samples the microphone input. Also we won't know the actual microphone input, nor whether/how it got resampled.

  However, it wouldn't matter either way. Namely, the underlying architecture could as well adjust the sample rate of it's input device, so even _if_ this functionality was implemented correctly, there has to be a fault tolerance mechanism in place.

  A physical test may enlighten us for tracing any conversion.
  Note however, we must be aware that audio output may be resampled for the speaker as well.

# Testing correlation on clean audio samples
  In the audio file, the spoken words, we want to integrate a correlation signal.
  Alternatively, we could adhere to the spoken audio itself, however this is not preferred due to duplicate signaling.

  Ideally there is a benchmarking environment:
  * One where we can hear the sounds that we are playing
  * Additionally, being able to deduce how well a receiver manages to correlate against the signal
  * And furthermore, selecting a threshold level and/or function to work with
    If you think about it, if we could transfer such encoding unhearable, that would be impressive.

  Figure out mathematically how the correlation signal influences SNR.
  For the time being, start with 65536 (2^16) samples of material. (1.3653 to 1.486 seconds)

  We then should run this code every (0.683 to 0.743) seconds to analyze the input signal fully.

  We can pick +-10 seconds (65536 * 10 samples) of audio material to test with.
