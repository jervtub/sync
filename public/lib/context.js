class Context {
  constructor(context = null) {
    if (context !== null) this.context = context
    else this.context = new (AudioContext || window.AudioContext || window.webkitAudioContext || window.mozAudioContext)({
      // don't set (attempt to enforce) samplerate, let browser decide this
      // we might down/upsample, and will not know,
      // besides, if used as mic input sample rate must be at mic input rate or crash
      // sampleRate: null
    })
    this.lin = null
  }

  resume() { this.context.resume() }
  close() { this.context.close() }
  suspend() { this.context.suspend() }
  state() { this.context.state } // suspended|running|closed
  samplerate() { return this.context.sampleRate }
  time() { return this.context.currentTime }

  regress() {
    return new Promise((resolve, reject) => {
      let ds = []
      let cs = []
			let pred = null
			let real = null
			let res = []
      let interval = 100
      let count = 50
			let canceller = everyXMilliSeconds(() => {
        let dt = Date.now()
        let ct = this.context.currentTime
        if (dt % interval > 3) { // more than 3ms deviation
          ds.push(null)
          cs.push(null)
        } else {
          ds.push(dt)
          cs.push(ct)
        }
				if (ds.length < 20) { return }
        ds = ds.tail(count)
        cs = cs.tail(count)
        let dl = ds.lin_regress()
        let de = ds.lin_err(dl)
        let cl = cs.lin_regress()
        let ce = cs.lin_err(cl) * 1000
				let dstable = de < 10 // less than 10ms deviation in Date.now()
				let cstable = ce < 10 // less than 10ms deviation in context.currentTime
				if (dstable && cstable) {
					pred = cl.b+cl.a*cs.length
          this.lin = {date: {a: dl.a, b: dl.b+dl.a*ds.length}, cont: {a: cl.a, b: cl.b+cl.a*cs.length}}
          resolve(this.lin)
          canceller()
				}
      }, interval)

    })
  }

  predict() { // predict context.currentTime
    let dt = Date.now()

    let date = this.lin.date
    let cont = this.lin.cont
    let counter = (dt - date.b)/100

    let pred = cont.b+cont.a*counter

    return pred
  }

  predict_ct_err() {
    let real = this.context.currentTime
    let pred = this.predict()
    return (real - pred) * 1000
  }

  is_stable () {
    return this.predict_ct_err() < 10
  }
}
