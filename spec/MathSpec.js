describe("Math", function () {
  require("../public/lib/math.js")

  // beforeAll(function() {
  //   extendPrototype(Array)
  //   extendPrototype(Float32Array)
  // })

  describe("positional", function () {
    it("last", function () { expect([].last()).toEqual(null) })
    it("last", function () { expect([1,2,3].last()).toEqual(3) })
    it("first", function () { expect([].first()).toEqual(null) })
    it("first", function () { expect([1,2,3].first()).toEqual(1) })

    it("head", function () { expect([].head(null)).toEqual([]) })
    it("head", function () { expect([1,2,3].head(null)).toEqual([]) })
    it("head", function () { expect([1,2,3].head(-1)).toEqual([1,2]) })
    it("head", function () { expect([].head(2)).toEqual([]) })
    it("head", function () { expect([1,2,3].head(2)).toEqual([1,2]) })

    it("tail", function () { expect([].tail(null)).toEqual([]) })
    it("tail", function () { expect([1,2,3].tail(null)).toEqual([1,2,3]) })
    it("tail", function () { expect([].tail(2)).toEqual([]) })
    it("tail", function () { expect([1,2,3].tail(2)).toEqual([2,3]) })

  })
  describe("basic manipulation", function () {
    it("abs", function () { expect([-1,2,3].abs()).toEqual([1,2,3]) })
    it("negate", function () { expect([-1,2,3].negate()).toEqual([1,-2,-3]) })
    it("sum", function () { expect([-1,2,3].sum()).toEqual(4) })

    it("diffs", function () { expect([].diffs()).toEqual([]) })
    it("diffs", function () { expect([-1].diffs()).toEqual([]) })
    it("diffs", function () { expect([4,2,3].diffs()).toEqual([2,1]) })

    it("subs", function () { expect([].subs()).toEqual([]) })
    it("subs", function () { expect([-1].subs()).toEqual([]) })
    it("subs", function () { expect([4,2,3].subs()).toEqual([-2,1]) })

    it("indices", function () { expect([-1,2,3].indices()).toEqual([0,1,2]) })

    it("indices_new", function () { expect([].indices_new()).toEqual([]) })
    it("indices_new", function () { expect([].indices_new(2)).toEqual([0,1]) })

    it("squared", function () { expect([-1,2,3].squared([1,2,3])).toEqual([1,4,9]) })
  })
  describe("basic relational manipulation", function () {
    it("diff", function () { expect([-1,2,3].diff([1,2,3])).toEqual([2,0,0]) })
    it("diff", function () { expect(function() { [-1,2,3].diff([1,2]) }).toThrowError("Expected same length.") })

    it("sub", function () { expect([-1,2,3].sub([1,2,3])).toEqual([-2,0,0]) })
    it("sub", function () { expect(function() { [-1,2,3].sub([1,2]) }).toThrowError("Expected same length.") })

    it("add", function () { expect([-1,2,3].add([1,2,3])).toEqual([0,4,6]) })
    it("add", function () { expect(function() { [-1,2,3].add([1,2]) }).toThrowError("Expected same length.") })

    it("dot", function () { expect([].dot([])).toEqual(null) })
    it("dot", function () { expect([-1,2,3].dot([1,2,3])).toEqual(12) })
    it("dot", function () { expect(function() { [-1,2,3].dot([1,2]) }).toThrowError("Expected same length.") })
  })
  describe("analytics", function () {
    it("min", function () { expect([].min()).toEqual(null) })
    it("min", function () { expect([1,-2,4,3].min()).toEqual(-2) })

    it("max", function () { expect([].max()).toEqual(null) })
    it("max", function () { expect([1,-2,4,3].max()).toEqual(4) })

    it("avg", function () { expect([].avg()).toEqual(null) })
    it("avg", function () { expect([1,-2,4,3].avg()).toEqual(1.5) })

    it("extrapolate", function () { expect([].extrapolate({a: 1, b: 1})).toEqual([]) })
    it("extrapolate", function () { expect([1,-2,4,3].extrapolate({a: 1, b: 1})).toEqual([1,2,3,4]) })
    it("extrapolate", function () { expect([1,-2,4,3].extrapolate({a: null, b: 1})).toEqual([null,null,null,null]) })

    it("var", function () { expect([].var()).toEqual(null) })
    it("var", function () { expect([0,3,6].var()).toEqual(2) })

    it("var2", function () { expect([].var2()).toEqual(null) })
    it("var2", function () { expect([0,3,6].var2()).toEqual(6) })

    it("correlate", function () { expect(function() { [-1,2].correlate([1,2,3]) }).toThrowError("Expected source to have equal or greater length than target.") })
    it("correlate", function () { expect(function() { [].correlate([   ]) }).toThrowError("Expected target to have non-zero length.") })
    it("correlate", function () { expect([1].correlate([1])).toEqual([1]) })
    it("correlate", function () { expect([1,-1,1].correlate([1,-1])).toEqual([2,-2]) })

    it("peak", function () { expect([].peak()).toEqual(null) })
    it("peak", function () { expect([1,2].peak()).toEqual({value: 2, index: 1}) })

    it("peaks", function () { expect([].peaks()).toEqual([]) })
    it("peaks", function () { expect(function() { [].peaks(1) }).toThrowError("Expected length to be larger than n.") })
    it("peaks", function () { expect([1].peaks()).toEqual([]) })
    it("peaks", function () { expect([1].peaks(1)).toEqual([{value: 1, index: 0}]) })
    it("peaks", function () { expect([1,-1].peaks(2)).toEqual([{value: 1, index: 0},{value: -1, index: 1}]) })

    // it("lin_regress", function () { expect([].lin_regress()).toEqual(null) })
    // it("lin_regress", function () { expect([1].lin_regress()).toEqual({a:null, b: 1}) })
    // it("lin_regress", function () { expect([null].lin_regress()).toEqual(null) })
    // it("lin_regress", function () { expect([null,null].lin_regress()).toEqual(null) })
    // it("lin_regress", function () { expect([1,null,null].lin_regress()).toEqual({a:null, b: 1}) })
    // it("lin_regress", function () { expect([1,null,3].lin_regress()).toEqual({a:1, b: 1}) })
    // it("lin_regress", function () { expect([3,null,1].lin_regress()).toEqual({a:-1, b: 3}) })
    // it("lin_regress", function () { expect([3,null,1,null,3].lin_regress()).toEqual({a:0, b: 2}) })

    it("theil_sen", function () { expect([].theil_sen()).toEqual(null) })
    // it("theil_sen", function () { expect([].theil_sen()).toEqual({a:null, b: 1}) })
    // it("theil_sen", function () { expect([null].theil_sen()).toEqual(null) })
    // it("theil_sen", function () { expect([null,null].theil_sen()).toEqual(null) })
    it("theil_sen", function () { expect([{x:0,y:1}].theil_sen()).toEqual(null) })
    it("theil_sen", function () { expect([{x:0,y:1},{x:2,y:3}].theil_sen()).toEqual({a:1, b: 1}) })
    it("theil_sen", function () { expect([{x:0,y:3},{x:2,y:1}].theil_sen()).toEqual({a:-1, b: 3}) })
    it("theil_sen", function () { expect([{x:0,y:3},{x:2,y:0},{x:4,y:3}].theil_sen()).toEqual({a:0, b: 2}) })
    it("theil_sen", function () { expect([{x:0,y:3},{x:2,y:0},{x:4,y:3},{x:6,y:0}].theil_sen()).toEqual({a:-0.5, b: 3}) })
    it("theil_sen", function () { expect([{x:0,y:3},{x:2,y:0},{x:4,y:3},{x:6,y:0},{x:8,y:3}].theil_sen()).toEqual({a:0, b: 1.8000000000000003}) })

    let p1 = [{x:0,y:3},{x:2,y:0},{x:4,y:3}]
    it("lin_err", function () { expect(p1.lin_err(p1.theil_sen())).toEqual(1.333333333333333333) })
    it("lin_err2", function () { expect(p1.lin_err2(p1.theil_sen())).toEqual(0.8164965809277259) })


  })
})
