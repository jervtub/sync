let organizer = () => {
  let target_size = Math.pow(2,7)*Math.pow(2,7)*4
  let error = null
  let socket = null
  let context = null
  let cc = null
  let input_node = null
  let recorder = null
  let signals = null
  let gpu = null
  let correlator = null
  let detector = null

  let correlator_is_stable = [false,false,false,false,false]
  let thresh = 10

  let schedule_hit = () => {}
  function onFull(t,x) { return x-(t%x) }
  function errorHandler(e) {
		let obj = {
			name: e.name,
			stack: e.stack,
			lineNumber: e.lineNumber,
			fileName: e.fileName,
			message: e.message,
			columnNumber: e.columnNumber,
		}
    console.error(obj)
    if (socket !== null) {
  		socket.emit("cerror", JSON.stringify(obj))
    }
  }
  function clone(o) {
  	let p = {}
  	Object.keys(o).forEach(b => p[b] = o[b])
  	return p
  }
  let onMount = async () => {
  	{ // setup socket
      socket = io ( "/", { transports: ["websocket"] } )
  		socket.emit("organizer")
			td_role.innerHTML = `organizer`
  	}
    try {
  		{ // ntp
  	    let interval = setInterval(async() => {
  				let result = await ntp(socket)
  				delta = result.delta
  				if (result.delta < 100) {
  					theta = result.theta
  					console.log("ntp valid: ", theta)
  					socket.emit("delta", delta)
  					socket.emit("theta", theta)
  				}
  				clearInterval(interval)
  	    }, 1000);
  		}
      { // audio context
        context = new (AudioContext || window.AudioContext || window.webkitAudioContext || window.mozAudioContext)({ })
				context.suspend()
    	}
	    { // first get user input to resume context
	      await new Promise((resolve, reject) => {
	        let button = document.createElement("button")
					button.innerHTML = "Click to start";
	        button.addEventListener("click", (event) => {
						context.resume() // resume context
	          // enable table
	          tablestatus.style.display = ""
	          button.style.display = "none"
	          resolve()
	        })
	        div_play.appendChild(button)
	      })
	    }
      { // recorder
        recorder = new Recorder({ context, threshold: 0.1 })
        await recorder.setup()
        recorder.start()
        _recorder = recorder
      }
    	{ // signals
    		signals = []
        for (let i = 0; i < 5; i++) {
          signals.push( new Float32Array(await fetch_song(context, `/audio/noises/${i}.wav`)))
          if ((signals[i].length / target_size) % 1 !== 0) {
            throw Error("Buffer ${i} invalid: ", {expected: target_size, actual: signals[i].length})
          }
        }
    	}
    	{ // gpu
    		gpu = new GPU(console.log, (e) => { console.error(e); error = e; })
    		gpu.init()
        gpu.setup(signals)
    		gpu.check()
    	}
    	{ // correlator
    		correlator = new Correlator(gpu, target_size)
    	}
    	{ // detector
    		detector = new Detector(thresh)
    	}
    	{ // handle recorded input
        (async ()=> { // quick fix to not hang procedure call chain
    			let s = context.sampleRate
          let pulled = null // retrieve audio samples and times of fetch
    			let prev = null
    			let times = [] // times of recorder mic input fetches
    			let peak_times = [[],[],[],[],[]] // peaks discovered
    			let count = -1 // count in use for peak index offset
    			let lin_rec = null // linear regression of recorder input samples

          while( pulled = await recorder.pull()) {
    				count ++
    				{ // recorder stability
    					sigma = recorder.predict_dn_err()
    					if (sigma > 10) {
    						console.log("Recorder not stable: ", sigma)
    						prev = clone(pulled)
    						continue
    					}
              if (count % 20 === 0) {
  							socket.emit( "sigma", sigma)
              }
    				}
    				{ // peak detection
              // let t1 = Date.now() // how much time does this hang the system?
    					let correlations = correlator.handle(pulled.samples)
              if (pulled.samples.slice(100).every(x => x === 0)) {
                mic_off.style.display = ""
              } else {
                mic_off.style.display = "none"
              }
    					let detections = correlations.map(c => detector.handle(c))
    					// peak interval stability
    					correlator_is_stable = detections.map((detection,i) => { // store peak indices per channel
    						if (detection) {
                  // no need to track more than 5 seconds of peak history
                  // per pull is

    							let index = detection.index // actually index of previous fetch, given the buffer of correlator
    							// deduce time of sample
    							let sfc = prev.start_fetch_counter
    							let fc = index / recorder.fetch_size + sfc // fetch count of this sample
    							let a = prev.lin.a
    							let b = prev.lin.b
    							let c = prev.lin.i
    							console.log(sfc,fc,a,b,c)
    							let time = (fc - c) * a + b // extrapolate sample
    							console.log("Detection in correlator ", i, " at index ", detection.index, " time ", time)
    							peak_times[i].push( time )
    							// inject nulls for missed peaks
    							if (peak_times[i].length > 1) {
    								let last_diff = peak_times[i].tail(2).diffs().last()
    								let missed = floor(last_diff/2000+0.2) - 1 // allow 200ms missing target time
    								for (let j = 0; j < missed; j++) {
    									console.log("inject missed")
    									peak_times[i].splice(peak_times[i].length-1, 0, null)
    								}
    							}
    							peak_times[i] = peak_times[i].tail(5) // only rely on recent peaks
    							// check peak stability
    							console.log(peak_times)
    							let best = peak_times[i].combinations(5, 3, true)
    																			 .map(comb => comb.lin_regress())
    																			 .map(l => abs(l.a/1000-2.0)).min()
    							console.log(best)
    							return best > 0.000001 && best < 0.005 // less than 5ms offset
    						} else { // no peak found, so not stable
    							return false
    						}
    					})
              // console.log(Date.now()-t1)
    				}
    				{ // send data to client for stable correlators
    					for (let i = 0; i < 5; i++) {
    						if (correlator_is_stable[i]) { // send interval type to client
    							// console.log("Detection in correlator ", i, " is stable")
    							let ts = peak_times[i].last()
    							// console.log("send detection result ", ts)
    							socket.emit( "detection", i, ts - theta)
    						}
    					}
    				}

    				prev = clone(pulled)
          }
        })()
    	}
		} catch (e) {
      errorHandler(e)
		}
  }
  onMount()
}
