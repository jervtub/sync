# Motivation

The [design](design.md) explains the approach to achieve the [goal](../README.md#Goal). I have found some solutions that do not rely on audio recording and target signal scheduling, yet these did not work for me. Below I elaborate on this.

### Neglect audio output latency
This is the naive solution, and sadly works insufficient. Audio output latency in practice can deviate significantly under some circumstances: differences in devices, operating systems, availability of resources (memory and processing time), lengths of audio paths (e.g. using internal speakers versus external Bluetooth speakers).

### Manual calibration
A previous prototype relied on user input to calibrate output. A beep is made every full second and it is up to the user to align the beeps with other phones. This solution works quite well, however, this project aims for an automated solution.

### With the Web Audio API
With [outputLatency](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/outputLatency) and [baseLatency](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/baseLatency) API functionalities we can request the necessary information for calibrating directly, however there are two problems with these API functions:
1. Incomplete vendor support: currently only for Firefox and Firefox Android (April 2022) support these functions.
2. No guarantee for synchronized behavior: It provides an estimation, therefore a certain precision cannot be assumed if functionality is supported.

To switch to this solution, I think there are two requirements:
1. Proper support. This is however not just a web-browser task, it relies on the entire software (and hardware) stack the audio path relies on.
2. Guarantee a precision in the audio output latency, ideally something sufficiently high (e.g. 5 or 10 milliseconds).
3. Make the latency variables dynamically adjustable to its current status. In such a web application can request over time and adapt to the changes in output latency appropriately. Current specification implies a new audio-context has to be build to obtain a fresh value.

### With the Timing Object API
With the [Timing Object API](http://webtiming.github.io/timingobject/) the process as a whole is abstracted and no additional code is necessary.
The specification aims partially at _"Synchronized playback of multi-device linear media ..."_, which is exactly the goal of this project (for the audio domain specifically). In overall, the specification of this API is very promising and I think the simplifications it will bring for web applications will be massive (once it is widely supported by web-browsers).

Since such synchronization could only be possible if the web-browser knows its audio output latency, I assume the Timing Object API (for the audio domain) will be elaborating on support of the [Web Audio API solution provided above](motivation.md#With the Web Audio API), therefore I expect the previous solution (with the Web Audio API) to be a widely supported solution first.
