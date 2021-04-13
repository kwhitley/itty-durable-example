import {
  json,
  error,
  missing,
  withParams,
  StatusError,
  ThrowableRouter,
} from 'itty-router-extras'
import { withDurables } from 'itty-durable'

// need to import durable object class to pass to durables middleware (only when accessing instance props)
import { Counter } from './durable/Counter'

// export durable object class, per spec
export { Counter }

const router = ThrowableRouter({ base: '/itty-durable/counter' })

router
  // add upstream middleware to allow for all DO instance counter below
  .all('*', withDurables())

  // example route with multiple calls to DO
  .get('/do-stuff',
    async ({ Counter }) => {
      const counter = Counter.get('test')

      // then we fire some methods on the durable... these could all be done separately.
      await Promise.all([
        counter.increment(),
        counter.increment(),
        counter.increment(),
      ])

      // unless withDurables({ autoParse: true }) is used, instance methods
      // return with JSON Response, therefore must be parsed to use
      const { counter } = await counter.toJSON().then(r => r.json())

      // and return the contents
      return json({ counter })
    }
  )

  // get get the durable itself... returns JSON Response, so no need to wrap
  .get('/', ({ Counter }) => Counter.get('test').toJSON())

  // reset the durable
  .get('/reset', ({ Counter }) => Counter.get('test').clear())

  // here we get the DO off request.durables because we'll need to pass the class in as well
  .get('/value', ({ durables }) => durables.Counter.get('test', Counter).counter)

  // this should throw
  .get('/fail', ({ Counter }) => Counter.get('test').fail())

  // this should throw as well
  .get('/invalid-do/fail', ({ InvalidDO }) => InvalidDO.get('test').fail())

  // will pass on requests to the durable... (e.g. /add/3/4 => 7)
  .get('/:action/:a?/:b?', withParams,
    ({ Counter, action, a, b }) => Counter.get('test')[action](Number(a), Number(b))
  )

  // all else gets a 404
  .all('*', () => missing('Are you sure about that?'))

// CF ES6 module syntax
export default {
  fetch: router.handle
}
