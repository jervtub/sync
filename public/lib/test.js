let assert = {
  assert: (a) => { if (!a) throw Error(`expected ${a}`) },
  equal: (a,b,t="") => { if (a !== b) throw Error(`expected ${a} === ${b}, ${t}`) }
}
