// read from path, returning Promise, options = { json: true }
import merge from 'deepmerge'
import { randomItem } from 'supergeneric/collections'
import { generateHash } from '../utils/generateHash'
import { makePath } from '../utils/makePath'
import { StatusError } from 'itty-router-extras'

export class DurableStore {
  constructor(options = {}) {
    const {
      Class,
      kv = undefined,
      newId = () => generateHash(),
      path = '',
      sanitize = v => v,
      timestamps = true,
      ttl = undefined,
      type = 'text',
    } = options

    this.Class = Class
    this.kv = kv
    this.path = path
    this.newId = newId
    this.ttl = ttl
    this.timestamps = timestamps
    this.type = type
  }

  async clear(prefix = '') {
    let index = await this.list(prefix)

    return await Promise.all(index.map(key => this.kv.delete(key).then(() => key)))
  }

  async create(content, options = {}) {
    let id = this.newId() || options.id
    let isObject = typeof content === 'object'

    // if object, inject new id and created
    if (isObject) {
      content = { id, ...content }

      if (this.timestamps) {
        content = { ...content, created: content.created || new Date }
      }
    }

    if (this.ownership) {
      await this.ownership.save(makePath(this.path, isObject ? id : undefined))
    }

    await this.save(id, content, options)

    return isObject ? content : id
  }

  async delete(prefix) {
    const key = makePath(this.path, prefix)

    if (this.ownership) {
      if (!(await this.ownership.exists(key))) {
        throw new StatusError(`Not authorized to delete item "${key}".`, 401)
      }
      await this.ownership.delete(key)
    }

    await this.kv.delete(key)

    return { deleted: key }
  }

  async exists(prefix) {
    return (await this.getOne(prefix)) !== null
  }

  async get(pathOrPaths, options = {}) {
    if (pathOrPaths.constructor.name === 'Array') {
      return await Promise.all(pathOrPaths.map(path => this.getOne(path, options)))
    }
    return this.getOne(pathOrPaths, options)
  }

  async getAll(prefix, options = {}) {
    if (typeof prefix === 'object') {
      options = prefix
      prefix = ''
    }

    return (await this.list(prefix, { ...options, populate: true }) || []).filter(v => v)
  }

  async getOne(path, options = {}) {
    let { autodetect = true, type } = options
    let content = await this.kv.get(makePath(this.path, path), this.type || type)

    if (autodetect && content && content.match && content.match(/^[\[\{]/)) {
      content = JSON.parse(content)
    }

    return content
  }

  async list(prefix = '', options = {}) {
    if (typeof prefix === 'object') {
      options = prefix
      prefix = ''
    }

    const {
      populate = false,
      limit = 1000,
      stripPrefix = false,
    } = options

    const path = makePath(this.path, prefix)
    const index = await this.kv.list({ prefix: path, limit })

    if (!populate) {
      return index.keys.map(k => stripPrefix ? k.name.replace(path, '').replace(/^\//, '') : k.name)
    }

    return Promise.all(index.keys.map(i => this.kv.get(i.name, 'json')))
  }

  // write to path, some obj (translated to string if object), with optional TTL (in seconds, minimum 60)
  async save(path, originalContent, options = {}) {
    let {
      ttl = this.ttl,
      timestamp = false,
      saveOwnership = false,
    } = options

    const content = (['json', 'text']).includes(this.type) && typeof originalContent === 'object' ? JSON.stringify(originalContent) : originalContent || ''
    const now = timestamp ? (new Date).toISOString() : undefined
    const key = makePath(this.path, path, now)

    if (ttl) {
      ttl = { expirationTtl: ttl }
    }

    let actions = [
      this.kv.put(key, content, ttl),
    ]

    if (saveOwnership) {
      if (!this.ownership) {
        throw new StatusError(`KVStore.save() cannot take { saveOwnership: true } flag without an owner assigned`)
      }
      actions.push(this.ownership.save(key, undefined, ttl && { ttl: options.ttl || this.ttl }))
    }

    await Promise.all(actions)

    return originalContent
  }

  // update path with obj (merge if object or replace if not), with optional expiration TTL
  async update(path, content, options = {}) {
    const { upsert = false } = options

    const original = await this.get(path)
    const key = makePath(this.path, path)

    if (!original && !upsert) {
      throw new StatusError(`Could not find item "${key}" to update.`, 404)
    }

    if (this.ownership && !(await this.ownership.exists(key))) {
      throw new StatusError(`Not authorized to update item "${key}`, 401)
    }

    if (typeof content === 'object') {
      content = merge(original, content, { arrayMerge: (dest, source) => source })

      if (this.timestamps) {
        content.modified = new Date
      }
    }

    return await this.save(path, content, options)
  }

  async upsert(path, content, options = {}) {
    return this.update(path, content, { ...options, upsert: true })
  }
}

export const createUserStore = (userId, kv) => (config) => new KVStore({
  ownership: new KVStore({ path: `possession/user/${userId}`, kv }),
  ...config
})
