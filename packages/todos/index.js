import {
  json,
  text,
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
import { Foo, withFoo } from './durable/Foo'

// generic middleware I would include with lib
import { withDurables } from 'itty-durable'

// need to import durable object class to pass to durables middleware (only when accessing instance props)
import { Magic } from './durable/Magic'

// export durable object class, per spec
export { Magic, Foo }

const router = ThrowableRouter()

router
  // add upstream middleware to allow for all DO instance magic below
  .all('*', withDurables())

  // example route with multiple calls to DO
  .get('/do-stuff-with-magic',
    async ({ Magic }) => {
      const magic = Magic.get('test')

      // then we fire some methods on the durable... these could all be done separately.
      await Promise.all([
        magic.increment(),
        magic.increment(),
        magic.increment(),
      ])

      const { counter } = await magic.toJSON().then(r => r.json())

      // and return the contents
      return json({ counter })
    }
  )

  // get get the durable itself... returns json response, so no need to wrap
  .get('/magic', ({ Magic }) => Magic.get('test').toJSON())

  // reset the durable)
  .get('/magic/reset', ({ Magic }) => Magic.get('test').clear())

  // here we get the DO off request.durables because we'll need to pass the class in as well
  .get('/magic/counter', ({ durables }) => durables.Magic.get('test', Magic).counter)

  .get('/magic/fail', ({ Magic }) => Magic.get('test').fail())
  .get('/invalid-do/fail', ({ InvalidDO }) => InvalidDO.get('test').fail())

  // will pass on requests to the durable... (e.g. /magic/add/3/4 => 7)
  .get('/magic/:action/:a?/:b?', withParams,
    ({ Magic, action, a, b }) => Magic.get('test')[action](Number(a), Number(b))
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
  fetch: router.handle // handle passes any params to handlers/middleware
}
