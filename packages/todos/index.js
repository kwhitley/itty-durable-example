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
import { withDurables } from './class/IttyDurable'

// need to import durable object class to pass to durables middleware
import { Magic } from './durable/Magic'

// export durable object class, per spec
export { Magic, Foo }

const router = ThrowableRouter()

router
  .get('/do-stuff-with-magic/:foo?', withDurables, withParams,
    async ({ durables, foo }) => {
      // we access a durable object from its ES6 class (assumes env binding to same name) and id
      const magic = durables.get(Magic, 'test')

      // then we fire some methods on the durable... these could all be done separately.
      await Promise.all([
        magic.increment(),
        magic.increment(),
        magic.increment(),
      ])

      // one last time for good measure
      await magic.increment()

      // now lets add some content to the durable
      await (magic.foo = foo || 'bar')

      // and return the contents
      return magic.toJSON()
    }
  )

  .get('/magic', withDurables, ({ durables }) => durables.get(Magic, 'test').toJSON())
  .get('/magic/reset', withDurables, ({ durables }) => durables.get(Magic, 'test').clear())

  .get('/magic/set/:what/:value', withParams, withDurables, async ({ what, value, durables }) => {
    const magic = durables.get(Magic, 'test')

    value = Number(value) || value
    await (magic[what] = value)

    return magic.toJSON()
  })

  // .all('/magic/:action?', withParams, withMagic, withContent,
  //   ({ Magic, action, content }) => Magic[action]()
  // )

  .get('/magic/:action/:a?/:b?', withDurables, withParams,
    async ({ durables, action, a, b }) => {
      // we access a durable object from its ES6 class (assumes env binding to same name)
      const durable = durables.get(Magic, 'test')

      // transpose params from string if needed
      a = Number(a) || a
      b = Number(b) || b

      // then we fire methods against it
      // return await durable[action](a, b)

      // this could easily look like this instead:

      await Promise.all([
        durable.increment(),
        durable.increment(),
        durable.increment(),
      ])

      await (durable.foo = 'bar')

      return await durable.toJSON()
    }
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
