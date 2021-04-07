import { IttyDurable } from '../class/IttyDurable.js'

export class Magic extends IttyDurable {
  constructor(state, env) {
    super(state, env)
    this.counter = 0
  }

  increment() {
    this.counter++
  }

  getTime() {
    return { now: new Date }
  }

  add(a, b) {
    return a + b
  }
}
