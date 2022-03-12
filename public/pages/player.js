let player = () => {
	// 2022-01-25 average gamma
	let id = null
	let context = null
	let cc = null
	let relation = null
	let buffer = null
	let hit = null
	let socket = null
	let scheduled = []
	let gs = []

	let canceller = () => {}
	let schedule_hit = () => {}
	let start_hit = () => {}
	let schedule_sig = () => {}

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

	let onMount = (async () => {
		{ // setup socket
	    socket = io ( "/", { transports: ["websocket"] } )
			while (!socket.connected) {
				await sleep(100)
				console.log("sleeping...")
			}
			id = await new Promise((resolve, reject) => {
				console.log(socket)
				socket.emit("client", (_id) => {
					resolve(_id)
				})
			})
			if (id === -1) {
				return // todo: show that client cannot connect
			}
			td_role.innerHTML = `player ${id}`
		}
		try {
			{ // ntp
				await new Promise((resolve, reject) => {
			    let interval = setInterval(async() => {
						let result = await ntp(socket)
						delta = result.delta
						if (result.delta < 100) {
							theta = result.theta
							console.log("ntp valid: ", theta)
							socket.emit("delta", delta)
							socket.emit("theta", theta)
							resolve()
						}
						clearInterval(interval)
			    }, 1000);
				})
			}
		  { // audio context
		    context = new (AudioContext || window.AudioContext || window.webkitAudioContext || window.mozAudioContext)({ })
				context.suspend()
		    cc = new Context(context)
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
			{ // output regression, relate Date.now() to context.currentTime
				// over time stabilization can be lost, but we do not have to completely restart and/or abruptly lose stabilization
				console.log("initiate output regression")
				let handle = async () => {
					let a = cc.regress()
					await a
				}
				await handle()
				console.log("output regressed")
				let func = async () => {
					await handle()
					func()
				}
				func()
			}
			{ // prepare sig
				let sig = await fetch_buffer(context,`/audio/noises/${id}.wav`)
				console.log("sig: ", sig)
				schedule_sig = (ct) => {
			    let source = context.createBufferSource()
					source.buffer = sig
		      source.connect(context.destination)
					source.start(ct)
				}
			}
			{ // prepare hit
				let hit  = await fetch_buffer(context,`/audio/hit.wav`)
				console.log("hit: ", hit)
				schedule_hit = (ct) => {
			    let source = context.createBufferSource()
					source.buffer = hit
		      source.connect(context.destination)
					source.start(ct)
				}
			}
			{ // signal scheduler
				// todo: ensure no duplicates or outliers
				phase = "calibration only"
				canceller = everyXMilliSeconds(() => {
					sigma = cc.predict_ct_err()
		      if (sigma < 10) {
						let d = Date.now()
						let time = d - (d % 1000)
						let date_sched = time + 2000
						let change = date_sched - cc.lin.date.b
						let cont_sched = change/1000 + cc.lin.cont.b
						console.log(date_sched)
						scheduled.push(date_sched)
						scheduled = scheduled.tail(30)
						schedule_sig(cont_sched-(theta/1000))
		      } else {
		        console.log("cc not stable: ", sigma)
		      }
				},2*1000)
		  }
			{ // receiver
				socket.on("detection", (ts) => {
					if (theta !== null) {
						let gammas = scheduled.map(tc=> (ts) - tc)
						// what if theta === -400?
						console.log("received detection result:")
						console.log("gammas: ", gammas)
						console.log("ts: ", ts)
						console.log("theta: ", theta)
						console.log("delta: ", delta)
						let actual = gammas.reverse().filter(gamma => gamma > -delta).first()
		        console.log(actual)
		        gs.push(actual)
		        console.log(gs.avg(), gs.length, gs.var())
						let variance = gs.tail(10).var()
		        if (gs.length >= 10 && variance < 5) {
							phase = "playback only"
		          gamma = gs.avg()
							socket.emit("gamma", gamma)
							console.log("canceller")
							canceller()
							td_gamma.innerHTML = variance
		        } else if (gs.length >= 3 && variance < 10) {
							phase = "calibration and playback"
		          gamma = gs.avg()
							socket.emit("gamma", gamma)
		          start_hit()
							start_hit = () => {}
							console.log("gamma: ", gamma)
							td_gamma.innerHTML = variance
		        } else if (gs.length >= 3){
							td_gamma.innerHTML = variance
						} else {
							td_gamma.innerHTML = `${gammas.length} results out of 3`
						}
		      }
				})
			}
		  {
				// hit scheduler
		    start_hit = () =>
				everyXMilliSeconds(() => {
					sigma = cc.predict_ct_err()
		      if (cc.is_stable()) {
						let d = Date.now()
						let time = d - (d % 1000)
						let date_sched = time + 2000
						let change = date_sched - cc.lin.date.b
						let cont_sched = change/1000 + cc.lin.cont.b
						schedule_hit(cont_sched-(gamma/1000)-(theta/1000))
		      } else {
		        console.log("cc not stable: ", cc.predict_ct_err())
		      }
				},3*1000)
		  }
		} catch (e) {
      showerror(e)
		}
	})
	onMount()
}
