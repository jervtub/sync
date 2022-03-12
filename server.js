// 2022-01-28
let port = 3000
let url = "localhost"

let express = require('express')
let app = express()
let http = require('http')
let io = require('socket.io')

let fs = require("fs")
let path = require("path")
let jsfft = require("jsfft")

{ // signal-generator code
  { // math.js
  let sqrt = Math.sqrt
  let min = Math.min
  let max = Math.max
  let pow = Math.pow
  let floor = Math.floor
  let ceil = Math.ceil

  function onFull(t,x) { return x-(t%x) }
  function clone(o) {
  	let p = {}
  	Object.keys(o).forEach(b => p[b] = o[b])
  	return p
  }

  Float32Array.prototype.head = function ( n ) {
  	if (n >= this.length) {
  		return this
  	} else {
  		return this.slice(0,n)
  	}
  }

  Float32Array.prototype.tail = function ( n ) {
  	if (n >= this.length) {
  		return this
  	} else {
  		return this.slice(-n)
  	}
  }

  Float32Array.prototype.abs = function () {
  	return this.map( x => Math.abs( x ) );
  }

  Float32Array.prototype.sum = function () {
  	return this.reduce((acc,v) => acc+v);
  }

  Float32Array.prototype.diff = function (other) {
  	if (other.length !== this.length) { throw Error("Expected same length.", this.length, other.length) }
  	let diff = new Array(this.length).fill(null)
  	for (let i = 0; i < this.length; i++) {
  		if (this[i] !== null && other[i] !== null) {
  			diff[i] = this[i]-other[i]
  		}
  	}
  	return diff
  }

  Float32Array.prototype.diffs = function () {
  	let diffs = []
  	for (let i = 1; i < this.length; i++) {
  		diffs.push(this[i]-this[i-1])
  	}
  	return diffs
  }

  // Analytics
  Float32Array.prototype.avg = function () {
  	return this.reduce( ( acc, val, ind ) => acc += Math.abs( val ), 0 ) / this.length;
  }

  Float32Array.prototype.sub = function(other) {
  	return this.map((v,i)=>v-other[i])
  }
  Float32Array.prototype.add = function(other) {
  	return this.map((v,i)=>v+other[i])
  }

  Float32Array.prototype.var = function () {
  	return this.sub(this.extrapolate({a:0,b:this.avg()})).abs().sum() / this.length
  }

  Float32Array.prototype.var2 = function () {
  	return this.sub(this.extrapolate({a:0,b:this.avg()})).squared().sum() / this.length
  }

  Float32Array.prototype.stats = function () {
  	return {
  		avg: this.avg(),
  		min: this.min(),
  		max: this.max(),
  		var: this.var(),
  	}
  }

  Float32Array.prototype.min = function () {
  	return this.reduce( ( acc, val, ind ) => val < acc ? val : acc, this[ 0 ] ) ;
  }

  Float32Array.prototype.max = function () {
  	return this.reduce( ( acc, val, ind ) => max(val, acc), this[ 0 ] ) ;
  }

  Float32Array.prototype.correlate = function ( target ) {
  	let result = new Float32Array( this.length - target.length + 1 );
  	for ( let tau = 0; tau < this.length - target.length + 1; tau++ )
      for ( let i = 0; i < target.length; i ++ )
        result[ tau ] += target[ i ] * this[ i + tau ];
    return result;
  }

  Float32Array.prototype.peak = function ( ) {
    return this.reduce( ( acc, val, ind ) =>
      val > acc.value ? { value: Math.abs( val ), index: ind } : acc
    , { value: 0, index: -1 });
  }

  Float32Array.prototype.peaks = function ( n ) {
    let r = new Array(n).fill({ value: 0, index: -1 });
    let lowest = 0;
    let index, v, i;
    for (i = 0; i < this.length; i++) {
      v = Math.abs( this[i] );
      if (v > lowest) {
        r.splice(r.findIndex(o => o.value < v ), 0, { value: v, index: i })
        lowest = r.pop().value
      }
    }
    return r
  }

  Float32Array.prototype.dot = function (other) {
  	if (other.length !== this.length) { throw Error("Expected same length.", this.length, other.length) }
    return this.reduce( ( acc, val, ind ) => acc + (val * other[ind]) , 0);
  };

  Float32Array.prototype.indices_new = function (x) {
  	let result = []
  	for (let i = 0; i < x; i++) {
  		result.push(i)
  	}
  	return result
  }

  Float32Array.prototype.indices = function () {
  	return this.map((v, i) => i)
  };

  Float32Array.prototype.lin_regress = function() {
    // linear regression
  	let items = []
    let indices = []
    let n = this.length
  	if (n === 0) return ({a:0,b:0})
  	let first = this.filter(t => t !== null).first()
  	if (first === null) return ({a:0,b:0})
  	let first_index = this.indexOf(first)
  	for (let i = first_index; i < n; i++) {
  		if (this[i] === null) { // increment index
  		} else {
  			indices.push(i-first_index)
  			items.push(this[i] - first)
  		}
  	}
    let a = (n*items.dot(indices)-(items.sum()*indices.sum()))/(n*indices.map(x => x*x).sum()-pow(indices.sum(),2))
    let b = (items.avg()-a*indices.avg()+first)-(a*first_index)
  	return ({a,b})
  }

  Float32Array.prototype.extrapolate = function ({a,b}) {
  	return this.indices().map(i => a*i+b)
  };

  Float32Array.prototype.squared = function () {
  	return this.map(v => v*v)
  };

  Float32Array.prototype.lin_err = function(lin) {
  	return sqrt(this.diff(this.extrapolate(lin)).abs().sum()) / this.length
  }

  Float32Array.prototype.lin_err2 = function(lin) {
  	return sqrt(this.diff(this.extrapolate(lin)).squared().sum()) / this.length
  }

  Float32Array.prototype.last = function() {
  	if (this.length > 0) return this[this.length - 1]
  	return null
  }

  Float32Array.prototype.first = function() {
  	if (this.length > 0) return this[0]
  	return null
  }

  function faculty(x) {
  	let result = 1
  	while (x > 0) {
  		result *= x--
  	}
  	return result
  }


  Float32Array.prototype.comb = function() {
  	let comb = []
  	let n = this.length
  	let pows = this.indices_new(n).map(v => pow(2,v))

  	let result = []
  	for (let i = 0; i < pow(2,n); i++) {
  		let item = new Array(n).fill(null)
  		for (let j = 0; j < n; j++) {
  			if (i&pows[j]) {
  				item[j] = this[j]
  			}
  		}
  		result.push(item)
  	}
  	return result
  }

  Float32Array.prototype.combinations = function(taillength = 10, activecount = 3, keeplast = true) {
  	// all linear combinations of the last 10 items of which at least 3 points present and always the last point
  	let combs = this.comb(this.tail(taillength))
  	return combs.filter(item => (!keeplast || item.last()) && item.filter(v => v !== null).length >= activecount)
  }

  Float32Array.prototype.best_lin_regr = function(keeplast = false) {
  	let n = min(this.length,10)
  	let m = floor(n*0.8) // allow dropping 20% of samples
  	let combs = this.combinations(n, m, keeplast)
  	let best = {i: 0, err: Number.MAX_SAFE_INTEGER}
  	for (let i = combs.length - 1; i >= 0; i--) { // reverse
  		let comb = combs[i]
  		// console.log(comb)
  		let lin = comb.lin_regress()
  		// console.log(lin)
  		let err = comb.lin_err(lin)
  		// console.log(err)
  		if (err < best.err) {
  			best = {i,err}
  		}
  	}
  	return combs[best.i]
  }

  Array.prototype.min = Float32Array.prototype.min
  Array.prototype.max = Float32Array.prototype.max
  Array.prototype.abs = Float32Array.prototype.abs
  Array.prototype.product = Float32Array.prototype.product
  Array.prototype.sum = Float32Array.prototype.sum
  Array.prototype.peak = Float32Array.prototype.peak
  Array.prototype.peaks = Float32Array.prototype.peaks
  Array.prototype.correlate = Float32Array.prototype.correlate
  Array.prototype.avg = Float32Array.prototype.avg
  Array.prototype.var = Float32Array.prototype.var
  Array.prototype.var2 = Float32Array.prototype.var2
  Array.prototype.diff = Float32Array.prototype.diff
  Array.prototype.diffs = Float32Array.prototype.diffs
  Array.prototype.dot = Float32Array.prototype.dot
  Array.prototype.indices = Float32Array.prototype.indices
  Array.prototype.indices_new = Float32Array.prototype.indices_new
  Array.prototype.lin_regress = Float32Array.prototype.lin_regress
  Array.prototype.stats = Float32Array.prototype.stats
  Array.prototype.tail = Float32Array.prototype.tail
  Array.prototype.head = Float32Array.prototype.head
  Array.prototype.squared = Float32Array.prototype.squared
  Array.prototype.lin_err = Float32Array.prototype.lin_err
  Array.prototype.lin_err2 = Float32Array.prototype.lin_err2
  Array.prototype.extrapolate = Float32Array.prototype.extrapolate
  Array.prototype.sub = Float32Array.prototype.sub
  Array.prototype.add = Float32Array.prototype.add
  Array.prototype.first = Float32Array.prototype.first
  Array.prototype.last = Float32Array.prototype.last
  Array.prototype.comb = Float32Array.prototype.comb
  Array.prototype.combinations = Float32Array.prototype.combinations
  Array.prototype.best_lin_regr = Float32Array.prototype.best_lin_regr
  }
  { // music.js
    function encodeWAV(samples, sampleRate = 48000, isMono = true) {
      /** [jervtub 2020-05-11 10:05]
        * Additional specifications:
        * [Documentation for module RiffFile.](http://www.lightlink.com/tjweber/StripWav/RIFFFile.txt)
        * [Documentation for module WAVE.](http://www.lightlink.com/tjweber/StripWav/WAVE.txt)
        * [RIFF file structure](https://johnloomis.org/cpe102/asgn/asgn1/riff.html)
        **/

      function writeString(view, offset, str) {
        for (let i = 0; i < str.length; i++) {
          view.setUint8(offset + i, new TextEncoder("utf-8").encode(str[i]), true);
        }
      }

      // Correct for single channel.
      if (isMono) {
        // Header (44 bytes) + content (16 bit = 2 byte per sample) (yet mono, so we have 2 bytes filled, then two bytes skipped)
        let buffer = new ArrayBuffer(44 + samples.length * 2);
        let view = new DataView(buffer);

        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + samples.length * 2, true); // Length of the entire file - 8
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true); // Describing WAVE data format (16-bit PCM)
        view.setUint16(20, 1, true); // formatTag
        view.setUint16(22, 1, true); // channels
        view.setUint32(24, sampleRate, true); // samples per sec
        view.setUint32(28, sampleRate * 2, true); // avg bytes per sec
        view.setUint16(32, 2, true); // block align
        view.setUint16(34, 16, true); // bits per sample
        writeString(view, 36, 'data');
        view.setUint32(40, samples.length * 2, true);

        //float32 to Int 16 pcm
        const INT16MAX = Math.pow(2, 14) - 1; // Signed, first bit sets pos or neg.
        for (let i = 0; i < samples.length - 1; i ++) {
          // view.setInt16(44 + 2 * i , (INT16MAX * samples[i] ) >> 0 );
          view.setUint16(44 + 2 * i , (INT16MAX * samples[i] ) >> 0, true );
          // view.setInt16(44 + 2 * i ,  samples[i]); // <-- incorrect, must be converted to 16-bit PCM.
        }

        // console.log(view);
        return view;
      } else {
        // Header (44 bytes) + content (16 bit = 2 byte per sample)
        let buffer = new ArrayBuffer(44 + samples.length * 2);
        let view = new DataView(buffer);

        writeString(view, 0, 'RIFF');
        view.setUint32(4, 32 + samples.length * 2, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 2, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 4, true);
        view.setUint16(32, 4, true);
        view.setUint16(34, 16, true);
        writeString(view, 36, 'data');
        view.setUint32(40, samples.length * 2, true);

        //float32 to Int 16 pcm
        const INT16MAX = Math.pow(2, 14) - 1; // Signed, first bit sets pos or neg.
        for (let i = 0; i < samples.length - 1; i ++) {
          view.setInt16(44 + 2 * i , (INT16MAX * samples[i] ) >> 0 );
        }

        return view;
      }
    }
  }
  { // gen signal
    function tukey(data, alpha) {
      // alpha = 0.01 -> 65000 samples implies 650 samples start and stop
      let N = data.length
      for (let i = 0; i < N; i++) {
        if ( i < alpha*(N/2)) {
          data[i] = data[i] * (0.5 * (1.0-Math.cos((2*Math.PI*i)/(alpha*N))))
        } else if (i > N - (alpha*(N/2))) {
          data[i] = data[i] * (0.5 * (1.0-Math.cos((2*Math.PI*(N-i))/(alpha*N))))
        }
        else {
          // dont change data
        }
      }
    }

    function generate_sound(samplerate, low_freq, high_freq, gpu_target_size) {
      let time = gpu_target_size / samplerate
      let ratio = time

      const data = new jsfft.ComplexArray(samplerate * ratio).map((value, i, n) => {
        let v = i / ratio
        if (v >= low_freq && v <= high_freq) {
          value.real = Math.random()
          value.imag = Math.random()
        } else {
          value.real = 0
          value.imag = 0
        }
      });
      const signal = jsfft.InvFFT(data)
      let sound = signal.real
      tukey(sound, 0.10)
      return sound
    }

    function gen(samplerate) {
      let low_freq = 17000
      let high_freq = 21500
      // let ({samplerate, low_freq, high_freq}) = JSON.parse(body);
      let gpu_target_size = Math.pow(2,7)*Math.pow(2,7)*4

      let sounds = []
      for(let i = 0; i < 5; i++) {
        // generate sound
        let sound = generate_sound(samplerate, low_freq, high_freq, gpu_target_size)
        // console.log(sound)
        sounds.push(sound)
        // store signal as file
        let name = `${i}.wav`;
        let file = path.resolve(".","public","audio","noises",name);
        let wav = encodeWAV(sound, samplerate, true);
        fs.writeFileSync(file, wav);
      }
      alog(console.log, server_time(), "", "", "samples generated: ", samplerate, low_freq, high_freq, gpu_target_size)
      return ({
        body: {
          sounds
        }
      })
    }
  }
}

function get_log_lines(max_lines) {
	let dirlist = fs.opendirSync(path.resolve( ".", "logs" ))
	let file_paths = []
	while (subitem = dirlist.readSync()) {
		file_paths.push(subitem.name)
	}
	dirlist.close()
	file_paths.sort()
	// console.log(file_paths)
	file_paths = file_paths.reverse()
	let lines_read = 0
	let lines = []
	file_paths.forEach(p => {
		if (max_lines - lines_read > 0) {
			let text = fs.readFileSync(path.resolve('.','logs',p), {encoding: "utf-8"})
			let text_lines = text.split("\n").reverse()
			let lines_to_read = Math.min(max_lines - lines_read, text_lines.length)
			// console.log(text_lines)
			// console.log(lines_to_read)
			lines.push(...text_lines.slice(0,lines_to_read))
			lines_read += lines_to_read
		}
	})
	return lines.reverse()
}

// server logic
let server = http.createServer(app)
server.listen(3000, "localhost")

// paths to directory
app.use(express.static('public'))
app.use("/gen", (req, res) => {
	let search = new URLSearchParams(req._parsedUrl.search)
	let rate = search.get("rate")
  gen(rate)
  res.send(rate)
})
app.use("/loglines", (req, res) => {
  res.send(get_log_lines(1000))
})

function get_date ( time ) {
  function format_zeros ( v, l ) { return `${ ( new Array( ( l - `${v}`.length ))).fill(0).join("") }${v}` }
  let d = new Date( time );
  let t = [];
  t.push( format_zeros( d.getFullYear()    , 4 ) );
  t.push( "-")
  t.push( format_zeros( d.getMonth() + 1   , 2 ) );
  t.push( "-")
  t.push( format_zeros( d.getDay()         , 2 ) );
  t.push( " ")
  t.push( format_zeros( d.getHours()       , 2 ) );
  t.push( ":")
  t.push( format_zeros( d.getMinutes()     , 2 ) );
  t.push( ":")
  t.push( format_zeros( d.getSeconds()     , 2 ) );
  t.push( ".")
  t.push( format_zeros( d.getMilliseconds(), 3 ) );
  return t.join( "" );
}
function server_time() { return get_date(Date.now() )}
function alog(f, time, addr, name, ...args) {
  time = time === null ? "" : time
  addr = addr === null ? "" : addr
  name = name === null ? "" : name
  return f(time.padEnd(23), addr.padEnd(15), name.padEnd(5), ...args)
}
alog(console.log, server_time(), "", "", "server start")

// socket logic
let wss = io(server)
let organizer = null
let clients = [null,null,null,null,null]; // support up to 5 clients
wss.on('connection', (socket) => {
  let address = socket.handshake.address
  let name = null
  let id = null
  let clog = (...args) => alog(console.log, server_time(), address, name, ...args)
  let elog = (...args) => alog(console.error, server_time(), address, name, ...args)

  socket.on("ntp", (cb) => {
    clog("ntp")
    cb(Date.now())
  })
  socket.on("organizer", () => {
    name = "o "
    clog("connect")
    organizer = socket
  })
  socket.on("client", (cb) => {
    let ind = clients.indexOf(null)
    if (ind !== -1) {
      id = ind
      name = "p"+id
      clog("connect")
      clients[Number(id)] = socket
    } else {
      clog("session full")
    }
    cb(ind)
  })
  socket.on("detection", (id, ts) => {
    clog("detection", ts)
    if (clients[Number(id)] !== null) {
      clients[Number(id)].emit("detection", ts)
    }
  })
  socket.on("disconnect", () => {
    if (name === "o ") {
      organizer = null
    } else if (id !== null) {
      clients[id] = null
    }
    clog("disconnect")
  })

  socket.on("play", (data) => { io.emit("play", data) })
  socket.on("stop", (data) => { io.emit("stop", data) })

  // log information
  socket.on("delta", (delta) => { clog("delta", delta)})
  socket.on("theta", (theta) => { clog("theta", theta)})
  socket.on("gamma", (gamma) => { clog("gamma", gamma)})
  socket.on("sigma", (sigma) => { clog("sigma", sigma)})
  socket.on("cerror", (e) => {
    let obj = JSON.parse(e)
    // console.error(name, "error", JSON.parse(e))
    elog("error")
    Object.keys(obj).forEach(key => {
      elog(`   ${key}:`)
      if (key === "stack") {
        let stack = obj[key]
        stack.split('\n').filter(line => line.length > 0).forEach(line => {
          elog("   ", "   ", line)
        })
      } else {
        elog("   ", "   ", obj[key])
      }
    })
  })
})
