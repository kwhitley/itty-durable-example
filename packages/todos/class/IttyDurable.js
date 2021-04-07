import {
  error,
  json,
  withParams,
  withContent,
  ThrowableRouter,
} from 'itty-router-extras'
import { Router } from 'itty-router'

export class IttyDurable {
  constructor(state, env) {
    this.state = state
    this.$ = {
      defaultState: undefined
    }

    this.router = ThrowableRouter()

    // one router to rule them all
    this.router
      .post('/:action/:target', withParams, withContent, async (request, env) => {
        const { action, target, content = [] } = request

        if (action === 'call') {
          const response = await this[target](...content)

          // return early if response detected
          if (response) {
            return response instanceof Response
            ? response
            : json(response)
          }
        } else if (action === 'set') {
          this[target] = content
        }
      }, () => this.persist())
      .all('*', () => json(this))

    return new Proxy(this, {
      get: (obj, prop) => typeof obj[prop] === 'function'
                          ? obj[prop].bind(this)
                          : obj[prop]
    })
  }

  getPersistable() {
    const { $, state, router, initializePromise, ...persistable } = this

    return persistable
  }

  async persist() {
    this.modified = new Date

    await this.state.storage.put('data', {
      ...this.getPersistable(),
    })
  }

  async initialize() {
    this.$.defaultState = JSON.stringify(this.getPersistable())

    const stored = await this.state.storage.get('data') || {}
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

    // reset to defaults from constructor
    Object.assign(this, JSON.parse(this.$.defaultState))
  }

  toJSON() {
    return this.getPersistable()
  }
}

export const withDurables = (request, env) => {
  request.durables = {
    get: (Class, id) => {
      try {
        if (typeof id === 'string') {
          id = env[Class.name].idFromName(id)
        }

        const stub = env[Class.name].get(id)
        const mock = new Class

        return new Proxy(stub, {
          get: (obj, prop) => {
            const origin = mock[prop]

            return typeof origin === 'function' && prop !== 'fetch'
            ? (...args) => {
                const url = 'https://itty-durable/call/' + prop
                const req = {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(args)
                }

                return obj.fetch(url, req)
              }
            : obj[prop]
          },
          set: async (obj, prop, value) => {
            const url = 'https://itty-durable/set/' + prop
            const req = {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(value)
            }

            return await obj.fetch(url, req)
            return true
          }
        })
      } catch (err) {
        throw new StatusError(500, 'Could not find a matching Durable Object')
      }
    }
  }
}
