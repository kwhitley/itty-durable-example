import {
  error,
  json,
  withParams,
  withContent,
  ThrowableRouter,
  StatusError,
} from 'itty-router-extras'
import { Router } from 'itty-router'

export const createIttyDurable = (options = {}) => {
  const {
    timestamps = false,
    persistOnChange = true,
    alwaysReturnThis = true,
  } = options

  return class IttyDurableBase {
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
          request.originalState = this.toJSON()

          if (action === 'call') {
            if (typeof this[target] !== 'function') {
              throw new StatusError(500, `Durable Object ${this?.constructor?.name} does not contain method ${target}()`)
            }
            const response = await this[target](...content)

            // return early if response detected
            if (response) {
              return response instanceof Response
              ? response
              : json(response)
            }
          } else if (action === 'set') {
            this[target] = content
          } else if (action === 'get-prop') {
            const { target } = request
            const persistable = this.getPersistable()

            if (!persistable.hasOwnProperty(target)) throw new StatusError(500, `Property ${target} does not exist in ${this?.constructor?.name}`)

            return json(this[target])
          }
        }, request => {
          if (persistOnChange && this.toJSON() !== request.originalState) {
            this.persist()
          }
        })

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
      if (timestamps) {
        this.modified = new Date
      }

      await this.state.storage.put('data', {
        ...this.getPersistable(),
      })
    }

    async initialize() {
      this.$.defaultState = JSON.stringify(this.getPersistable())

      const stored = await this.state.storage.get('data') || {}
      Object.assign(this, stored)

      if (timestamps) {
        this.created = this.created || new Date
      }
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

      // add final catch-all route
      if (alwaysReturnThis) {
        this.router.all('*', () => json(this))
      }

      const response = await this.router.handle(request, env)

      return response || error(400, 'Bad request to durable object')
    }

    clear() {
      for (const key in this.getPersistable()) {
        if (key !== 'created' || !timestamps) {
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
}

export const IttyDurable = createIttyDurable() // we accept sane defaults

export const withDurables = (options = {}) => (request, env) => {
  const { autoParse = false } = options

  const transformResponse = response => {
    if (!autoParse) return response

    try {
      return response.json()
    } catch (err) {}

    try {
      return response.text()
    } catch (err) {}

    return new Promise(cb => cb())
  }

  request.durables = new Proxy(env, {
    get: (obj, binding) => {
      const durableBinding = env[binding]
      if (!durableBinding || !durableBinding.idFromName) {
        throw new StatusError(500, `${binding} is not a valid Durable Object binding.`)
      }

      return {
        get: (id, Class) => {
          try {
            if (typeof id === 'string') {
              id = durableBinding.idFromName(id)
            }

            const stub = durableBinding.get(id)
            const mock = typeof Class === 'function' && new Class
            // const isValidMethod = prop => prop !== 'fetch'// && Object.getOwnPropertyNames(Class.prototype).includes('prop')
            const isValidMethod = prop => prop !== 'fetch' && (!mock || typeof mock[prop] === 'function')

            return new Proxy(stub, {
              get: (obj, prop) => isValidMethod(prop)
                                ? (...args) => {
                                    const url = 'https://itty-durable/call/' + prop
                                    const req = {
                                      method: 'POST',
                                      headers: {
                                        'Content-Type': 'application/json',
                                      },
                                      body: JSON.stringify(args)
                                    }

                                    return obj.fetch(url, req).then(transformResponse)
                                  }
                                : obj.fetch('https://itty-durable/get-prop/' + prop, { method: 'POST' }).then(transformResponse)
              ,
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
            throw new StatusError(500, err.message)
          }
        }
      }
    }
  })

  request.proxy = new Proxy(request.proxy || request, {
    get: (obj, prop) => obj.hasOwnProperty(prop)
                        ? obj[prop]
                        : obj.durables[prop]
  })
}
