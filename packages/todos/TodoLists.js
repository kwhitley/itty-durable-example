import {
  json,
  missing,
  withParams,
  ThrowableRouter,
} from 'itty-router-extras'
import { create } from 'jimp'

import { Todos } from './Todos.mjs'

export class TodoLists extends DurableObject {
  constructor(state, env) {
    super(state, env)
    this.lists = [] // this will be detected for persisting automatically

    // we embed a router inside the DO that super.fetch triggers if not specified here
    const router = this.router = ThrowableRouter({ base: '/todos/:namespace' })

    router
      .get('/create', withParams, async ({ namespace, text }) =>                  // CREATE TODO
        json(await this.add(text))
      )
      .get('/', withParams, ({ namespace }) => json({ namespace, items: this.lists }))  // GET LIST
      .get('/info', async () => json({                                                  // GET INFO
        id: this.state.id.toString(),
        env,
        class: this.constructor.name,
        persistable: this.getPersistable(), // this comes from parent class
      }))
      .get('*', () => missing('Are you sure about that?'))                              // 404
  }

  // add a todo
  async add(text) {
    const todo = {
      id: this.items.length,
      text,
    }

    this.items = [ ...this.items, todo ]  // add to state
    await this.persist()                  // persist to storage

    return todo
  }

  // get a todo
  async get(id) {
    const todo = this.items.find(todo => todo.id === Number(id))

    return todo
  }
}
