class Correlator {
  constructor(gpu,target_size) {
    this.gpu = gpu
    this.target_size = target_size
    this.data = new Float32Array(2*target_size).fill(0)
    this.previous = null
  }
  handle(data) {
    // fix data buffer
    if (data.length !== this.target_size) {
      console.error("expected: ", this.target_size)
      console.error("actual: ", data.length)
      throw Error("Expected target size pushed: ")
    }
    if (!this.previous) {
      this.previous = data
      return [null,null,null,null,null]
    }
    this.data.set( this.previous, 0 )
    this.data.set( data, this.target_size )
    this.previous = data
    let results = []
    // correlate per signal
    for (let i = 0; i < 5; i++) {
      // run correlation
      let result = this.gpu.run(this.data, i)
      if (! result || result.length == 0 ) throw Error("Result invalid. Probably GPU crashed.")
      if ( result.filter(v => v === 0 ).length > 1000 ) results.push(null) // empty correlation
      else results.push(result)
    }
    return results
  }
}
