let abs = Math.abs
let ceil = Math.ceil
let floor = Math.floor
let max = Math.max
let min = Math.min
let pow = Math.pow
let sqrt = Math.sqrt
let random = Math.random

function onFull(t,x) { return x-(t%x) }
function clone(o) {
	let p = {}
	Object.keys(o).forEach(b => p[b] = o[b])
	return p
}

function faculty(x) {
	let result = 1
	while (x > 0) {
		result *= x--
	}
	return result
}

function extendPrototype(T) {

	// Positional
	T.prototype.last = function() {
		if (this.length > 0) return this[this.length - 1]
		return null
	}

	T.prototype.first = function() {
		if (this.length > 0) return this[0]
		return null
	}

	T.prototype.head = function ( n ) {
		if (n >= this.length) {
			return this
		} else {
			return this.slice(0,n)
		}
	}

	T.prototype.tail = function ( n ) {
		if (n >= this.length) {
			return this
		} else {
			return this.slice(-n)
		}
	}


	// Basic manipulations
	T.prototype.abs = function () {
		return this.map( x => abs( x ) );
	}

	T.prototype.negate = function () {
		return this.map( x => -x );
	}

	T.prototype.sum = function () {
		return this.reduce((acc,v) => acc+v);
	}

	T.prototype.indices = function () {
		return this.map( (val, ind) => ind )
	}

	T.prototype.indices_new = function (x = 0) {
		let result = []
		for (let i = 0; i < x; i++) {
			result.push(i)
		}
		return result
	}

	T.prototype.diffs = function () {
		return this.slice(1).map( (val, ind) => abs(val - this[ind]) )
	}

	T.prototype.subs = function () {
		return this.slice(1).map( (val, ind) => val - this[ind] )
	}

	T.prototype.indices = function () {
		return this.map((v, i) => i)
	};

	T.prototype.squared = function () {
		return this.map(v => v*v)
	};


	// Basic relational manipulation
	T.prototype.diff = function (other) {
		if (this.length !== other.length) { throw Error("Expected same length.", this.length, other.length) }
		return this.map( (val, ind) => abs(this[ind]-other[ind]) )
	}

	T.prototype.sub = function(other) {
		if (this.length !== other.length) { throw Error("Expected same length.", this.length, other.length) }
		return this.map((v,i)=>v-other[i])
	}

	T.prototype.add = function(other) {
		if (this.length !== other.length) { throw Error("Expected same length.", this.length, other.length) }
		return this.map((v,i)=>v+other[i])
	}

	T.prototype.dot = function (other) {
		if (other.length !== this.length) { throw Error("Expected same length.", this.length, other.length) }
	  if (this.length > 0) return this.reduce( ( acc, val, ind ) => acc + (val * other[ind]) , 0);
		return null
	};


	// Analytics
	T.prototype.min = function () {
		if (this.length > 0) return this.reduce( ( acc, val, ind ) => val < acc ? val : acc, this[ 0 ] ) ;
		return null
	}

	T.prototype.max = function () {
		if (this.length > 0) return this.reduce( ( acc, val, ind ) => max(val, acc), this[ 0 ] ) ;
		return null
	}

	T.prototype.avg = function () {
		if (this.length > 0) return this.reduce( ( acc, val, ind ) => acc +=  val, 0 ) / this.length;
		return null
	}

	// Extrapolate given linear function onto array
	T.prototype.extrapolate = function ({a,b}) {
		if (a === null || b === null) return this.map(i => null)
		return this.indices().map(i => a*i+b)
	};

	T.prototype.var = function () {
		if (this.length > 0) return this.sub(this.extrapolate({a:0,b:this.avg()})).abs().sum() / this.length
		return null
	}

	T.prototype.var2 = function () {
		if (this.length > 0) return this.sub(this.extrapolate({a:0,b:this.avg()})).squared().sum() / this.length
		return null
	}

	T.prototype.stats = function () {
		return {
			avg: this.avg(),
			min: this.min(),
			max: this.max(),
			var: this.var(),
		}
	}

	// Correlate two signals
	T.prototype.correlate = function ( target ) {
		if (this.length < target.length) { throw Error("Expected source to have equal or greater length than target.", this.length, target.length)}
		if (target.length === 0 ) { throw Error("Expected target to have non-zero length.", this.length, target.length)}
		if (this.length === 0 )   { throw Error("Expected source to have non-zero length.", this.length, target.length)}
		let n = this.length - target.length + 1
		let result = new T( n ).fill(0)
		for ( let tau = 0; tau < n; tau++ )
	    for ( let i = 0; i < target.length; i ++ )
	      result[ tau ] += target[ i ] * this[ i + tau ]
	  return result
	}

	// Applications
	T.prototype.peak = function ( ) {
	  if (this.length > 0) return this.reduce( ( acc, val, ind ) =>
	    val > acc.value ? { value: abs( val ), index: ind } : acc
	  , { value: 0, index: -1 })
		return null
	}

	T.prototype.peaks = function ( n = 0 ) {
		if (this.length < n) { throw Error("Expected length to be larger than n.", this.length, n)}
		if (n === 0) { return [] }
	  let r = new Array(n).fill({ value: Number.MIN_SAFE_INTEGER, index: -1 })
	  let lowest = Number.MIN_SAFE_INTEGER
	  for (let i = 0; i < this.length; i++) {
	    let v = this[i]
	    if (v > lowest) {
	      r.splice(r.findIndex(o => o.value < v ), 0, { value: v, index: i })
				r = r.head(n)
	      lowest = r.last().value
	    }
	  }
	  return r
	}

	T.prototype.lin_regress = function() { // Linear regression
		let items = []
	  let indices = []
	  let n = this.length

		let filtered = this.filter(t => t !== null)
		if (filtered.length === 0) return null
		if (filtered.length === 1) return ({a: null, b: filtered[0]})

		let first = this.filter(t => t !== null).first()
		let first_index = this.indexOf(first)
		for (let i = first_index; i < n; i++) {
			if (this[i] === null) { // Increment index, skip null items
			} else {
				indices.push(i-first_index)
				items.push(this[i])
			}
		}
		console.log()
		console.log("this: ", this)
		console.log("indices: ", indices)
		console.log("items: ", items)
	  let a = (n*items.dot(indices)-(items.sum()*indices.sum()))/(n*indices.map(x => x*x).sum()-pow(indices.sum(),2))
	  let b = (items.avg()-a*indices.avg()+first)-(a*first_index)
		return ({a,b})
	}

	T.prototype.theil_sen = function( full = true) {
		// assume input is points
		// assume no equal x positions for points
		let n = this.length
		let points = this
		if (n === 0) return null
		if (n === 1) return null
		if (n === 2) {
			let pa = points[0]
			let pb = points[1]
			let a = slope(pa,pb)
			let b = intercept(a,pa)
			return ({a,b})
		}

		let a = 0 // slope
		let b = 0 // start point

		function slope(pa, pb) {
			let denominator = (pb.x - pa.x) // assert denominator always 1 or higher
			return (pb.y - pa.y) / denominator
		}

		function intercept(a, p) {
			return p.y - p.x * a
		}

		if (full) {
			let contribution = 1/n
			for (let i = 0; i < n - 1; i++) {
				for (let j = i + 1; j < n; j++) {
					let pa = points[i]
					let pb = points[j]
					// add slope
					a += contribution * slope(pa, pb)
				}
			}
			// derive starting point b
			for (let i = 0; i < n; i++) {
				b += contribution * intercept(a, points[i])
			}
		} else {
			let count = floor(sqrt(n))
			console.log("count:",count)
			let contribution = 1/(pow(count,2))
			for (let i = 0; i < count; i++) {
				for (let j = 0; j < count; j++) {
					// take random point from first half
					let ia = floor(0.5 * n * random())
					let pa = points[ia]
					// take random point from second half
					let ib = min(n - floor(0.5 * n * random()), n-1)
					let pb = points[ib]
					console.log("chosen:", pa,pb)
					console.log("slope:",slope(pa,pb))
					// add slope
					a += contribution * slope(pa, pb)
				}
			}
			console.log("a:",a)
			// derive starting point b
			for (let i = 0; i < n; i++) {
				b += (1/n) * intercept(a, points[i])
			}
		}
		return ({a,b})
	}

	T.prototype.lin_err = function({a,b}) {
		// assume input is points
		// assume no equal x positions for points
		let n = this.length
		let points = this
		let interpolated = points.map(p => p.x * a + b)
		let diff = points.map(p => p.y).diff(interpolated)
		return diff.sum() / n
	}

	T.prototype.lin_err2 = function({a,b}) {
		// assume input is points
		// assume no equal x positions for points
		let n = this.length
		let points = this
		let interpolated = points.map(p => p.x * a + b)
		let diff = points.map(p => p.y).diff(interpolated)
		return sqrt(diff.squared().sum()) / n
	}

	// Combination of points with
	T.prototype.comb = function() {
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


	T.prototype.combinations = function(taillength = 10, activecount = 3, keeplast = true) {
		// All linear combinations of the last 10 items of which at least 3 points present and always the last point
		let combs = this.comb(this.tail(taillength))
		return combs.filter(item => (!keeplast || item.last()) && item.filter(v => v !== null).length >= activecount)
	}

	T.prototype.best_lin_regr = function(keeplast = false) {
		let n = min(this.length,10)
		let m = floor(n*0.8) // Allow dropping 20% of samples
		let combs = this.combinations(n, m, keeplast)
		let best = {i: 0, err: Number.MAX_SAFE_INTEGER}
		for (let i = combs.length - 1; i >= 0; i--) { // Reversed iteration
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

}

extendPrototype(Array)
extendPrototype(Float32Array)
