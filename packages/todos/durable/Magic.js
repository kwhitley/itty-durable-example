import { IttyDurable, createIttyDurable } from '../class/IttyDurable.js'

export class Magic extends createIttyDurable({ timestamps: true }) {
  constructor(state, env) {
    super(state, env)
    this.counter = 0
  }

  increment() {
    this.counter++
  }

  add(a, b) {
    return a + b
  }
}
