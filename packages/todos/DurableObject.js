import { error, ThrowableRouter } from 'itty-router-extras'
import { Router } from 'itty-router'

export class DurableObject {
  constructor(state, env) {
    this.state = state

    this.router = ThrowableRouter()

    return new Proxy(this, {
      get: (obj, prop) => typeof obj[prop] === 'function'
                          ? obj[prop].bind(this)
                          : obj[prop]
    })
  }

  getPersistable() {
    const { state, router, initializePromise, ...persistable } = this

    return persistable
  }

  async persist() {
    this.modified = new Date

    await this.state.storage.put('value', {
      ...this.getPersistable(),
    })
  }

  async initialize() {
    const stored = await this.state.storage.get('value') || {}
    Object.assign(this, stored)

    this.created = this.created || new Date
  }

  async fetch(request, env) {
    // INITIALIZATION
    if (!this.initializePromise) {
      this.initializePromise = this.initialize().catch(err => {
        this.initializePromise = undefined
        throw err
      })
    }
    await this.initializePromise

    // we pass off the request to the internal router (empty by default)
    const response = await this.router.handle(request, env)

    return response || error(400, 'Bad request to durable object')
  }

  clear() {
    for (const key in this.getPersistable()) {
      if (key !== 'created') {
        delete this[key]
      }
    }
  }

  toJSON() {
    return this.getPersistable()
  }
}
