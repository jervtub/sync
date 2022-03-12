class Recorder {
  constructor ({context, input_node, batch_count, batch_size, fetch_size, threshold }) {
    this.fetch_size = fetch_size ? fetch_size : 2048; // size per drain of audio samples
    this.context   = context; // the audio context
    this.input_node = input_node ? input_node : null; // the input_node (microphone) audio node
    this.processor = context.createScriptProcessor(this.fetch_size, 1, 1); // processor node that will drain the input_node samples

    this.batch_count = batch_count ? batch_count : 20; // the number of batches. More batches implies longer history retention.
    this.batch_size  = batch_size ? batch_size : pow(2,7)*pow(2,7)*4; // the size of a batch, directly pulled by analyzer, probably 65536

    assert.assert(this.fetch_size)
    assert.assert(this.context)
    assert.assert(this.processor)

    this.subrecording = new Array(this.batch_count).fill( new Float32Array( this.batch_size ) ); // initiation of subrecords
    this.start_fetch_counter = new Array( this.batch_count ).fill(0);

    assert.equal((this.batch_size / this.fetch_size) % 1, 0); // expect exact number of fetches to fill one batch
    this.number_of_fetches_per_batch = this.batch_size / this.fetch_size;

    this.reset()

    this.is_recording = false;

    this.pull_prom = {}
    this.pull_prom.prom = new Promise((res, rej) => {
      this.pull_prom.res = res;
      this.pull_prom.rej = rej;
    })

    this.times = null
    this.threshold = threshold ? threshold : 1;
    this.instability = 100
    this.measurecount = 0
    this.measuremax = 200

  }

  // Pull the first fully fetched batch from the front of the recorder once ready/filled.
  async pull() {
    await this.pull_prom.prom
    // Since promise is finalized, we can assume current read_index batch is ready to be read
    let data = {
      start_fetch_counter: this.start_fetch_counter[this.batch_read_index],
      samples: [...this.subrecording[this.batch_read_index]],
      lin: clone(this.lin)
    }
    // Setup new promise
    this.pull_prom = {}
    this.pull_prom.prom = new Promise((res, rej) => {
      this.pull_prom.res = res;
      this.pull_prom.rej = rej;
    })
    this.batch_read_index = (this.batch_read_index + 1) % this.batch_count
    // State whether next pull ready to be performed
    if (this.batch_read_index !== this.batch_write_index) {
      this.pull_prom.res()
    }
    // console.log(this.batch_read_index,this.batch_write_index)
    return data
  }

  async setup () {
    // mic input
    if (this.input_node === null) {
      let mediastream =  await navigator.mediaDevices.getUserMedia({ // May throw NotAllowedError or NotFoundError
        audio: {
          noiseSuppression: false,
          echoCancellation: false,
          autoGainControl: false,
          // sampleRate: 48000, // let device decide sample rate, I dont want it to have some hidden conversion in the background
          sampleSize: 128,
        },
         video: false
      })
      if (mediastream.getAudioTracks().length < 1) { throw new Error("No audio input media track created") }
      if (mediastream.getAudioTracks().length > 1) { throw new Error("Expected exactly one input media track") }
      this.input_node = this.context.createMediaStreamSource( mediastream )
    }

    // Describe what processor node should do
		let is = []
    let miss = 0
    this.processor.onaudioprocess = (event) => {
      // console.log(event.timeStamp);
      let time = Date.now()
      this.times = time
      this.fetch_counter ++

      // regress continuously
			is.push(time)
      this.measurecount = is.length
			if (is.length % 100 === 0) {
        is = is.tail( 2000 )
        this.threshold = 0.1
        let il = is.lin_regress()
        let ie = is.lin_err(il)

  			let istable = ie < this.threshold // less than threshold ms deviation

        // remove high variance samples
        is.diff(is.extrapolate(il)).abs().map((val,ind) => {
          if (val > 500*ie) {
            is[ind] = null
          }
        })

  			if (istable) {
  				// console.log('stable')
          this.lin = {
            a: il.a, // time per fetch
            b: il.b+is.length*il.a, // time of fetch i
            i: this.fetch_counter+1 // index fetched at time b
          }
  			}
        this.instability = ie
      }

      if ( this.is_recording ) {
        try {
          let frame = event.inputBuffer.getChannelData(0)
          assert.equal(frame.length, this.fetch_size, "frame length and fetch size mismatches");
          if ( frame.length + this.index <= this.batch_size ) {
            this.subrecording[ this.batch_write_index ].set ( frame, this.index )
            this.index += frame.length
          } else {
            assert.equal(this.batch_size, this.index, "index not pointing at index of value batch size")
            // move to next batch index
            this.batch_write_index = (this.batch_write_index + 1) % this.batch_count
            this.subrecording[ this.batch_write_index ].set ( frame, 0 )
            this.index = frame.length;
            this.start_fetch_counter[ this.batch_write_index ] = this.fetch_counter
            // doesn't matter what read_index was, it is ready to be read
            this.pull_prom.res()
            if (this.batch_write_index === this.batch_read_index ) {
              console.error("Ringbuffer overflown")
              // this.stop();
              // throw Error("Ringbuffer overflow")
            }
          }
        } catch ( e ) {
          this.is_recording = false;
          try {
            this.input_node.disconnect( this.processor );
          } catch (err) {
            console.error(err);
          }
          throw Error( e );
        }
      }
    };
  }

  start() {
    this.input_node.connect( this.processor );
    this.batch_write_index = 0; // batch index we are writing samples to
    this.batch_read_index  = 0; // batch index we are reading from
    this.index     = 0; // index pointer within current batch
    this.is_recording = true;
  }

  stop() {
    this.is_recording = false;
    try {
      this.input_node.disconnect( this.processor );
    } catch ( e ) {
      // Already disconnected.
    }
  }

  reset () {
    this.batch_write_index = 0; // batch index we are writing samples to
    this.batch_read_index  = 0; // batch index we are reading from
    this.index             = 0; // index pointer within current batch
    this.fetch_counter     = 0; //
    this.lin               = 0; //
  }

  predict_fetch_counter () { // predict fetch_counter
    let dt = Date.now()
    let a = this.lin.a
    let b = this.lin.b
    let i = this.lin.i
    let pred = (dt-b)/a+i
    return pred
  }

  predict_fc_err () {
    let real = this.fetch_counter
    let pred = this.predict_fetch_counter()
    return real - pred
  }

  predict_dn_err () { // predict last fetch time based on current fetch_counter
    let real = this.times
    let fc = this.fetch_counter
    let a = this.lin.a
    let b = this.lin.b
    let i = this.lin.i
    let pred = (fc-i)*a+b
    return real - pred
  }

  predict_dn (sample_index) { // predict time of sample
    let real = this.times
    let fc = this.fetch_counter
    let a = this.lin.a  // time per fetch
    let b = this.lin.b  // time at fetch i
    let i = this.lin.i  // index of fetch time b
    let c = this.batch_size/this.fetch_size // number of fetches per batch
    let si

  }

  is_stable () {
    return this.predict_dn_err() < 10
  }


}
