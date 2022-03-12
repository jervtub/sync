class Detector {
  constructor(threshold) {
    this.threshold = threshold
  }
  handle(correlation) {
    if (correlation === null) return null
    correlation = correlation.abs()
    // analyze correlation results to find peak and address time
    let avg = correlation.avg()
    let peaks = correlation.peaks(10)
      .filter(({value, index}) => value >= this.threshold * avg)
      .sort((a,b) => a.index - b.index)
    if (peaks.length === 0) return null
    let peak = peaks[0]
    return peak
  }
}
