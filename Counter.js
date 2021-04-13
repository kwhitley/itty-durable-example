import { createIttyDurable } from 'itty-durable'

export class Counter extends createIttyDurable({ timestamps: true }) {
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
