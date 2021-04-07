import { json, withContent } from 'itty-router-extras'

import { IttyDurable } from '../class/IttyDurable.js'

export class Foo extends IttyDurable {
  constructor(state, env) {
    super(state, env)

    // we add routes to the embedded internal router
    this.router
      // for all requests, we increment the internal requests counter
      .all('*', this.incrementCounter)

      // a GET with '/reset' will fire the internal reset() method
      .get('/reset', this.reset)

      // PATCH to merge without wiping
      .patch('*', withContent, ({ content = {} }) => {
        Object.assign(this, content)
      })

      // POST to wipe
      .post('*', withContent, this.reset, ({ content = {} }) => {
        Object.assign(this, content)
      })

      // afterwards we persist changes, then respond with "this" as JSON
      .all('*', this.persist, () => json(this))
  }

  // increments internal counter by 1
  incrementCounter() {
    this.counter = (this.counter || 0) + 1
  }

  // removes internal data and sets counter to 0
  reset() {
    this.clear() // removes all internal data

    this.counter = 0
  }
}

export const withFoo = (request, env) => {
  const { namespace } = request

  if (namespace) {
    const id = env.Foo.idFromName(namespace)
    request.Foo = env.Foo.get(id)
  }
}
