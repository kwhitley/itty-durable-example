import {
  json,
  error,
  status,
  missing,
  withContent,
  withParams,
  StatusError,
  ThrowableRouter,
} from 'itty-router-extras'
import { KVStore } from './class/KVStore'

export { Todos } from './Todos'
export { Foo } from './Foo'

const createROE = Class => namespace => {
  // create KV entry (`${class.name}|${namespace}` )
}

const createDurable = Class => (namespace, durable = undefined) => {
  // 1. get id from namespace
  // 2. get durable
  // 3. createROE
  // 4. return durable
}

const getDurable = Class => namespace => {
  // 1. get both ROE and durable
  // 2. if ROE, return durable
  // 3. if not ROE, createDurable and return durable
}

class DurableObject {
  persist() {

  }

  cache() {

  }
}



const router = ThrowableRouter()

// MIDDLEWARE embeds durable object instance from namespace param
const withFoo = (request, env) => {
  const { namespace } = request

  if (namespace) {
    const id = env.Foo.idFromName(namespace)
    request.Foo = env.Foo.get(id)
  }
}

router
  .all('/foo/:namespace/:action?', withParams, withFoo, (request, env) =>
    request.Foo.fetch(
      'https://slick/' + (request.action || ''), // fake internal API for durable
      request, // pass the entire request as options (to pass method, body, etc)
    )
  )

// GET /foo/bar --> returns contents of durable object 'bar' of class Foo

  .all('/foo/:namespace/:action?', withParams, withFoo, async (request, env) => {
    // return json({
    //   request,
    // })
    // const { ROE, Foo } = env

    // retrieve durable object stub from request
    const { namespace, action, Foo } = request

    // define kv
    const kv = new KVStore({
      path: 'Foo',
      kv: env.ROE,
    })

    const [
      kvEntry,
      response,
    ] = await Promise.all([
      kv.get(namespace),
      // Foo.fetch(request)//'https://fake-host/' + (action || ''), { ...request }),
      Foo.fetch('https://slick/' + (action || ''), request)
    ])

    // if no ROE found, save record
    if (!kvEntry) {
      await kv.save(namespace, { namespace, created: new Date })
    }

    return response
  })
  .all('/todos/:namespace/*', withParams, async (request, env) => {
    const { namespace } = request
    const id = env.TODOS.idFromName(namespace)
    const obj = env.TODOS.get(id)
    // return json({ namespace, id, obj, fetch: typeof obj.fetch })
    const response = await obj.fetch(request)

    return response
  })
  .all('*', () => missing('Are you sure about that?'))

export default {
  fetch(request, env) {
    return router.handle(request, env)      // handle passes any params to handlers/middleware
  }
}
