var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __commonJS = (cb, mod) => () => (mod || cb((mod = {exports: {}}).exports, mod), mod.exports);
var __reExport = (target, module, desc) => {
  if (module && typeof module === "object" || typeof module === "function") {
    for (let key of __getOwnPropNames(module))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, {get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable});
  }
  return target;
};
var __toModule = (module) => {
  return __reExport(__markAsModule(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", module && module.__esModule && "default" in module ? {get: () => module.default, enumerable: true} : {value: module, enumerable: true})), module);
};

// node_modules/itty-router-extras/dist/middleware/withContent.js
var require_withContent = __commonJS((exports, module) => {
  var withContent4 = async (t) => {
    let n = t.headers.get("content-type");
    t.content = void 0;
    try {
      n && (n.includes("application/json") ? t.content = await t.json() : n.includes("application/text") ? t.content = await t.text() : n.includes("form") && (t.content = await t.formData()));
    } catch (t2) {
    }
  };
  module.exports = {withContent: withContent4};
});

// node_modules/itty-router-extras/dist/middleware/withCookies.js
var require_withCookies = __commonJS((exports, module) => {
  var withCookies = (o) => {
    o.cookies = {};
    try {
      o.cookies = (o.headers.get("Cookie") || "").split(/;\s*/).map((o2) => o2.split("=")).reduce((o2, [e, i]) => (o2[e] = i) && o2, {});
    } catch (o2) {
    }
  };
  module.exports = {withCookies};
});

// node_modules/itty-router-extras/dist/middleware/withParams.js
var require_withParams = __commonJS((exports, module) => {
  var withParams4 = (a) => {
    Object.assign(a, a.params || {});
  };
  module.exports = {withParams: withParams4};
});

// node_modules/itty-router-extras/dist/middleware/index.js
var require_middleware = __commonJS((exports, module) => {
  module.exports = {...require_withContent(), ...require_withCookies(), ...require_withParams()};
});

// node_modules/itty-router-extras/dist/response/createResponseType.js
var require_createResponseType = __commonJS((exports, module) => {
  var createResponseType = (e = "text/plain; charset=utf-8") => (s, t = {}) => {
    const {headers: n = {}, ...o} = t;
    return typeof s == "object" ? new Response(JSON.stringify(s), {headers: {"Content-Type": e, ...n}, ...o}) : new Response(s, t);
  };
  module.exports = {createResponseType};
});

// node_modules/itty-router-extras/dist/response/json.js
var require_json = __commonJS((exports, module) => {
  var {createResponseType} = require_createResponseType();
  var json5 = createResponseType("application/json; charset=utf-8");
  module.exports = {json: json5};
});

// node_modules/itty-router-extras/dist/response/error.js
var require_error = __commonJS((exports, module) => {
  var {json: json5} = require_json();
  var error3 = (r = 500, o = "Internal Server Error.") => json5({error: o, status: r}, {status: r});
  module.exports = {error: error3};
});

// node_modules/itty-router-extras/dist/response/missing.js
var require_missing = __commonJS((exports, module) => {
  var {error: error3} = require_error();
  var missing3 = (r = "Not found.") => error3(404, r);
  module.exports = {missing: missing3};
});

// node_modules/itty-router-extras/dist/response/status.js
var require_status = __commonJS((exports, module) => {
  var {json: json5} = require_json();
  var status2 = (s, t) => t ? json5({message: t}, {status: s}) : new Response(null, {status: s});
  module.exports = {status: status2};
});

// node_modules/itty-router-extras/dist/response/text.js
var require_text = __commonJS((exports, module) => {
  var text2 = (e, t = {}) => new Response(e, t);
  module.exports = {text: text2};
});

// node_modules/itty-router-extras/dist/response/index.js
var require_response = __commonJS((exports, module) => {
  module.exports = {...require_error(), ...require_json(), ...require_missing(), ...require_status(), ...require_text()};
});

// node_modules/itty-router/dist/itty-router.min.js
var require_itty_router_min = __commonJS((exports, module) => {
  var e = (e2 = {}) => new Proxy(e2, {get: (e3, r, a) => r === "handle" ? async (r2, ...a2) => {
    for (let [t, o] of e3.r.filter((e4) => e4[2] === r2.method || e4[2] === "ALL")) {
      let e4, s, p;
      if (e4 = (p = new URL(r2.url)).pathname.match(t)) {
        r2.params = e4.groups, r2.query = Object.fromEntries(p.searchParams.entries());
        for (let e5 of o)
          if ((s = await e5(r2.proxy || r2, ...a2)) !== void 0)
            return s;
      }
    }
  } : (t, ...o) => (e3.r = e3.r || []).push([`^${((e3.base || "") + t).replace(/(\/?)\*/g, "($1.*)?").replace(/\/$/, "").replace(/:(\w+)(\?)?(\.)?/g, "$2(?<$1>[^/$3]+)$2$3")}/*$`, o, r.toUpperCase()]) && a});
  module.exports = {Router: e};
});

// node_modules/itty-router-extras/dist/router/ThrowableRouter.js
var require_ThrowableRouter = __commonJS((exports, module) => {
  "use strict";
  var {Router: Router2} = require_itty_router_min();
  var {error: error3} = require_response();
  var ThrowableRouter4 = (r = {}) => new Proxy(Router2(r), {get: (r2, e) => (...o) => e === "handle" ? r2[e](...o).catch((r3) => error3(r3.status || 500, r3.message)) : r2[e](...o)});
  module.exports = {ThrowableRouter: ThrowableRouter4};
});

// node_modules/itty-router-extras/dist/router/index.js
var require_router = __commonJS((exports, module) => {
  module.exports = {...require_ThrowableRouter()};
});

// node_modules/itty-router-extras/dist/classes/StatusError.js
var require_StatusError = __commonJS((exports, module) => {
  var StatusError4 = class extends Error {
    constructor(r = 500, t = "Internal Error.") {
      super(t), this.name = "StatusError", this.status = r;
    }
  };
  module.exports = {StatusError: StatusError4};
});

// node_modules/itty-router-extras/dist/classes/index.js
var require_classes = __commonJS((exports, module) => {
  module.exports = {...require_StatusError()};
});

// node_modules/itty-router-extras/dist/index.js
var require_dist = __commonJS((exports, module) => {
  module.exports = {...require_middleware(), ...require_response(), ...require_router(), ...require_classes()};
});

// node_modules/deepmerge/dist/cjs.js
var require_cjs = __commonJS((exports, module) => {
  "use strict";
  var isMergeableObject = function isMergeableObject2(value) {
    return isNonNullObject(value) && !isSpecial(value);
  };
  function isNonNullObject(value) {
    return !!value && typeof value === "object";
  }
  function isSpecial(value) {
    var stringValue = Object.prototype.toString.call(value);
    return stringValue === "[object RegExp]" || stringValue === "[object Date]" || isReactElement(value);
  }
  var canUseSymbol = typeof Symbol === "function" && Symbol.for;
  var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for("react.element") : 60103;
  function isReactElement(value) {
    return value.$$typeof === REACT_ELEMENT_TYPE;
  }
  function emptyTarget(val) {
    return Array.isArray(val) ? [] : {};
  }
  function cloneUnlessOtherwiseSpecified(value, options) {
    return options.clone !== false && options.isMergeableObject(value) ? deepmerge(emptyTarget(value), value, options) : value;
  }
  function defaultArrayMerge(target, source, options) {
    return target.concat(source).map(function(element) {
      return cloneUnlessOtherwiseSpecified(element, options);
    });
  }
  function getMergeFunction(key, options) {
    if (!options.customMerge) {
      return deepmerge;
    }
    var customMerge = options.customMerge(key);
    return typeof customMerge === "function" ? customMerge : deepmerge;
  }
  function getEnumerableOwnPropertySymbols(target) {
    return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(target).filter(function(symbol) {
      return target.propertyIsEnumerable(symbol);
    }) : [];
  }
  function getKeys(target) {
    return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target));
  }
  function propertyIsOnObject(object, property) {
    try {
      return property in object;
    } catch (_) {
      return false;
    }
  }
  function propertyIsUnsafe(target, key) {
    return propertyIsOnObject(target, key) && !(Object.hasOwnProperty.call(target, key) && Object.propertyIsEnumerable.call(target, key));
  }
  function mergeObject(target, source, options) {
    var destination = {};
    if (options.isMergeableObject(target)) {
      getKeys(target).forEach(function(key) {
        destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
      });
    }
    getKeys(source).forEach(function(key) {
      if (propertyIsUnsafe(target, key)) {
        return;
      }
      if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
        destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
      } else {
        destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
      }
    });
    return destination;
  }
  function deepmerge(target, source, options) {
    options = options || {};
    options.arrayMerge = options.arrayMerge || defaultArrayMerge;
    options.isMergeableObject = options.isMergeableObject || isMergeableObject;
    options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;
    var sourceIsArray = Array.isArray(source);
    var targetIsArray = Array.isArray(target);
    var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;
    if (!sourceAndTargetTypesMatch) {
      return cloneUnlessOtherwiseSpecified(source, options);
    } else if (sourceIsArray) {
      return options.arrayMerge(target, source, options);
    } else {
      return mergeObject(target, source, options);
    }
  }
  deepmerge.all = function deepmergeAll(array, options) {
    if (!Array.isArray(array)) {
      throw new Error("first argument should be an array");
    }
    return array.reduce(function(prev, next) {
      return deepmerge(prev, next, options);
    }, {});
  };
  var deepmerge_1 = deepmerge;
  module.exports = deepmerge_1;
});

// node_modules/supergeneric/math.js
var require_math = __commonJS((exports) => {
  "use strict";
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.rounder = exports.mad = exports.median = exports.round = exports.stddev = exports.mean = exports.sum = exports.random = exports.max = exports.min = void 0;
  var _collections = require_collections();
  var min = exports.min = function min2(values) {
    return Math.min.apply(Math, (0, _collections.onlyNumbers)(values));
  };
  var max = exports.max = function max2(values) {
    return Math.max.apply(Math, (0, _collections.onlyNumbers)(values));
  };
  var random = exports.random = function random2(min2, max2) {
    return Math.floor(Math.random() * (max2 - min2 + 1)) + min2;
  };
  var sum = exports.sum = function sum2(values) {
    var sum3 = 0;
    var filtered = (0, _collections.onlyNumbers)(values);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = void 0;
    try {
      for (var _iterator = filtered[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var v = _step.value;
        sum3 += v;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
    return sum3;
  };
  var mean = exports.mean = function mean2() {
    var values = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
    var filtered = (0, _collections.onlyNumbers)(values);
    return sum(filtered) / filtered.length;
  };
  var stddev = exports.stddev = function stddev2(values) {
    var filtered = (0, _collections.onlyNumbers)(values);
    var m = mean(filtered);
    var n = filtered.length;
    var sumerror = 0;
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = void 0;
    try {
      for (var _iterator2 = filtered[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var v = _step2.value;
        sumerror += Math.pow(v - m, 2);
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
    return Math.sqrt(sumerror / (n - 1));
  };
  var round = exports.round = function round2(value) {
    var precision = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
    var mult = Math.pow(10, precision);
    return Math.round(value * mult) / mult;
  };
  var median = exports.median = function median2() {
    var values = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
    var filtered = (0, _collections.onlyNumbers)(values);
    var sorted = filtered.sort(_collections.ascending);
    var mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2) {
      return sorted[mid];
    } else {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    }
  };
  var mad = exports.mad = function mad2(values) {
    var filtered = (0, _collections.onlyNumbers)(values);
    var medianValue = median(filtered);
    var deviations = filtered.map(function(v) {
      return Math.abs(v - medianValue);
    });
    return median(deviations);
  };
  var rounder = exports.rounder = function rounder2() {
    var precision = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;
    return function(value) {
      return round(value, precision);
    };
  };
});

// node_modules/supergeneric/collections.js
var require_collections = __commonJS((exports) => {
  "use strict";
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.randomItem = exports.onlyNumbers = exports.sortBy = exports.descending = exports.ascending = exports.last = exports.first = void 0;
  var _math = require_math();
  var first = exports.first = function first2(values) {
    return values[0];
  };
  var last = exports.last = function last2(values) {
    return values[values.length - 1];
  };
  var ascending = exports.ascending = function ascending2(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
  };
  var descending = exports.descending = function descending2(a, b) {
    return a > b ? -1 : a < b ? 1 : 0;
  };
  var sortBy = exports.sortBy = function sortBy2(key) {
    var _ref = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, _ref$descending = _ref.descending, descending2 = _ref$descending === void 0 ? false : _ref$descending;
    return function(a, b) {
      return a[key] < b[key] ? descending2 ? 1 : -1 : a[key] > b[key] ? descending2 ? -1 : 1 : 0;
    };
  };
  var onlyNumbers = exports.onlyNumbers = function onlyNumbers2(values) {
    return values.filter(function(v) {
      return typeof v === "number" && !isNaN(Number(v));
    });
  };
  var randomItem3 = exports.randomItem = function randomItem4(items) {
    return items[(0, _math.random)(0, items.length - 1)];
  };
});

// index.js
var import_itty_router_extras5 = __toModule(require_dist());

// class/KVStore.js
var import_deepmerge = __toModule(require_cjs());
var import_collections2 = __toModule(require_collections());

// utils/generateHash.js
var import_collections = __toModule(require_collections());
var generateHash = (length = 8, options = {}) => {
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const upper = "ABCDEFGHJKLMNPQRTUVWXYZ";
  const numeric = "2346789";
  return Array(length).fill(0).map((v, index) => index ? (0, import_collections.randomItem)(upper + lower + numeric) : (0, import_collections.randomItem)(upper + lower)).join("");
};

// utils/makePath.js
var makePath = (...targets) => targets.filter((v) => v !== void 0 && v !== "").join("/").replace("//", "/");

// class/KVStore.js
var import_itty_router_extras = __toModule(require_dist());
var KVStore = class {
  constructor(options = {}) {
    const {
      kv = required("kv is required to instantiate a KV store"),
      newId = () => generateHash(options.hashLength || 8),
      ownership = void 0,
      path = "",
      sanitize = (v) => v,
      timestamps = true,
      ttl = void 0,
      type = "text"
    } = options;
    this.kv = kv;
    this.path = path;
    this.newId = newId;
    this.ttl = ttl;
    this.timestamps = timestamps;
    this.type = type;
    this.ownership = ownership;
  }
  async clear(prefix = "") {
    let index = await this.list(prefix);
    return await Promise.all(index.map((key) => this.kv.delete(key).then(() => key)));
  }
  async create(content, options = {}) {
    let id = this.newId() || options.id;
    let isObject = typeof content === "object";
    if (isObject) {
      content = {id, ...content};
      if (this.timestamps) {
        content = {...content, created: content.created || new Date()};
      }
    }
    if (this.ownership) {
      await this.ownership.save(makePath(this.path, isObject ? id : void 0));
    }
    await this.save(id, content, options);
    return isObject ? content : id;
  }
  async delete(prefix) {
    const key = makePath(this.path, prefix);
    if (this.ownership) {
      if (!await this.ownership.exists(key)) {
        throw new import_itty_router_extras.StatusError(`Not authorized to delete item "${key}".`, 401);
      }
      await this.ownership.delete(key);
    }
    await this.kv.delete(key);
    return {deleted: key};
  }
  async exists(prefix) {
    return await this.getOne(prefix) !== null;
  }
  async get(pathOrPaths, options = {}) {
    if (pathOrPaths.constructor.name === "Array") {
      return await Promise.all(pathOrPaths.map((path) => this.getOne(path, options)));
    }
    return this.getOne(pathOrPaths, options);
  }
  async getAll(prefix, options = {}) {
    if (typeof prefix === "object") {
      options = prefix;
      prefix = "";
    }
    return (await this.list(prefix, {...options, populate: true}) || []).filter((v) => v);
  }
  async getOne(path, options = {}) {
    let {autodetect = true, type} = options;
    let content = await this.kv.get(makePath(this.path, path), this.type || type);
    if (autodetect && content && content.match && content.match(/^[\[\{]/)) {
      content = JSON.parse(content);
    }
    return content;
  }
  async list(prefix = "", options = {}) {
    if (typeof prefix === "object") {
      options = prefix;
      prefix = "";
    }
    const {
      populate = false,
      limit = 1e3,
      stripPrefix = false
    } = options;
    const path = makePath(this.path, prefix);
    const index = await this.kv.list({prefix: path, limit});
    if (!populate) {
      return index.keys.map((k) => stripPrefix ? k.name.replace(path, "").replace(/^\//, "") : k.name);
    }
    return Promise.all(index.keys.map((i) => this.kv.get(i.name, "json")));
  }
  async save(path, originalContent, options = {}) {
    let {
      ttl = this.ttl,
      timestamp = false,
      saveOwnership = false
    } = options;
    const content = ["json", "text"].includes(this.type) && typeof originalContent === "object" ? JSON.stringify(originalContent) : originalContent || "";
    const now = timestamp ? new Date().toISOString() : void 0;
    const key = makePath(this.path, path, now);
    if (ttl) {
      ttl = {expirationTtl: ttl};
    }
    let actions = [
      this.kv.put(key, content, ttl)
    ];
    if (saveOwnership) {
      if (!this.ownership) {
        throw new import_itty_router_extras.StatusError(`KVStore.save() cannot take { saveOwnership: true } flag without an owner assigned`);
      }
      actions.push(this.ownership.save(key, void 0, ttl && {ttl: options.ttl || this.ttl}));
    }
    await Promise.all(actions);
    return originalContent;
  }
  async update(path, content, options = {}) {
    const {upsert = false} = options;
    const original = await this.get(path);
    const key = makePath(this.path, path);
    if (!original && !upsert) {
      throw new import_itty_router_extras.StatusError(`Could not find item "${key}" to update.`, 404);
    }
    if (this.ownership && !await this.ownership.exists(key)) {
      throw new import_itty_router_extras.StatusError(`Not authorized to update item "${key}`, 401);
    }
    if (typeof content === "object") {
      content = (0, import_deepmerge.default)(original, content, {arrayMerge: (dest, source) => source});
      if (this.timestamps) {
        content.modified = new Date();
      }
    }
    return await this.save(path, content, options);
  }
  async upsert(path, content, options = {}) {
    return this.update(path, content, {...options, upsert: true});
  }
};

// Todos.js
var import_itty_router_extras3 = __toModule(require_dist());

// class/IttyDurable.js
var import_itty_router_extras2 = __toModule(require_dist());
var import_itty_router = __toModule(require_itty_router_min());
var createIttyDurable = (options = {}) => {
  const {
    timestamps = false,
    persistOnChange = true,
    alwaysReturnThis = true
  } = options;
  return class IttyDurableBase {
    constructor(state, env) {
      this.state = state;
      this.$ = {
        defaultState: void 0
      };
      this.router = (0, import_itty_router_extras2.ThrowableRouter)();
      this.router.post("/:action/:target", import_itty_router_extras2.withParams, import_itty_router_extras2.withContent, async (request, env2) => {
        const {action, target, content = []} = request;
        request.originalState = this.toJSON();
        if (action === "call") {
          if (typeof this[target] !== "function") {
            throw new import_itty_router_extras2.StatusError(500, `Durable Object ${this?.constructor?.name} does not contain method ${target}()`);
          }
          const response = await this[target](...content);
          if (response) {
            return response instanceof Response ? response : (0, import_itty_router_extras2.json)(response);
          }
        } else if (action === "set") {
          this[target] = content;
        } else if (action === "get-prop") {
          const {target: target2} = request;
          const persistable = this.getPersistable();
          if (!persistable.hasOwnProperty(target2))
            throw new import_itty_router_extras2.StatusError(500, `Property ${target2} does not exist in ${this?.constructor?.name}`);
          return (0, import_itty_router_extras2.json)(this[target2]);
        }
      }, (request) => {
        if (persistOnChange && this.toJSON() !== request.originalState) {
          this.persist();
        }
      });
      return new Proxy(this, {
        get: (obj, prop) => typeof obj[prop] === "function" ? obj[prop].bind(this) : obj[prop]
      });
    }
    getPersistable() {
      const {$, state, router: router2, initializePromise, ...persistable} = this;
      return persistable;
    }
    async persist() {
      if (timestamps) {
        this.modified = new Date();
      }
      await this.state.storage.put("data", {
        ...this.getPersistable()
      });
    }
    async initialize() {
      this.$.defaultState = JSON.stringify(this.getPersistable());
      const stored = await this.state.storage.get("data") || {};
      Object.assign(this, stored);
      if (timestamps) {
        this.created = this.created || new Date();
      }
    }
    async fetch(request, env) {
      if (!this.initializePromise) {
        this.initializePromise = this.initialize().catch((err) => {
          this.initializePromise = void 0;
          throw err;
        });
      }
      await this.initializePromise;
      if (alwaysReturnThis) {
        this.router.all("*", () => (0, import_itty_router_extras2.json)(this));
      }
      const response = await this.router.handle(request, env);
      return response || (0, import_itty_router_extras2.error)(400, "Bad request to durable object");
    }
    clear() {
      for (const key in this.getPersistable()) {
        if (key !== "created" || !timestamps) {
          delete this[key];
        }
      }
      Object.assign(this, JSON.parse(this.$.defaultState));
    }
    toJSON() {
      return this.getPersistable();
    }
  };
};
var IttyDurable = createIttyDurable();
var withDurables = (options = {}) => (request, env) => {
  const {autoParse = false} = options;
  const transformResponse = (response) => {
    if (!autoParse)
      return response;
    try {
      return response.json();
    } catch (err) {
    }
    try {
      return response.text();
    } catch (err) {
    }
    return new Promise((cb) => cb());
  };
  request.durables = new Proxy(env, {
    get: (obj, binding) => {
      const durableBinding = env[binding];
      if (!durableBinding || !durableBinding.idFromName) {
        throw new import_itty_router_extras2.StatusError(500, `${binding} is not a valid Durable Object binding.`);
      }
      return {
        get: (id, Class) => {
          try {
            if (typeof id === "string") {
              id = durableBinding.idFromName(id);
            }
            const stub = durableBinding.get(id);
            const mock = typeof Class === "function" && new Class();
            const isValidMethod = (prop) => prop !== "fetch" && (!mock || typeof mock[prop] === "function");
            return new Proxy(stub, {
              get: (obj2, prop) => isValidMethod(prop) ? (...args) => {
                const url = "https://itty-durable/call/" + prop;
                const req = {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify(args)
                };
                return obj2.fetch(url, req).then(transformResponse);
              } : obj2.fetch("https://itty-durable/get-prop/" + prop, {method: "POST"}).then(transformResponse),
              set: async (obj2, prop, value) => {
                const url = "https://itty-durable/set/" + prop;
                const req = {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify(value)
                };
                return await obj2.fetch(url, req);
                return true;
              }
            });
          } catch (err) {
            throw new import_itty_router_extras2.StatusError(500, err.message);
          }
        }
      };
    }
  });
  request.proxy = new Proxy(request.proxy || request, {
    get: (obj, prop) => obj.hasOwnProperty(prop) ? obj[prop] : obj.durables[prop]
  });
};

// Todos.js
var Todos = class extends IttyDurable {
  constructor(state, env) {
    super(state, env);
    this.items = [];
    this.isLoggedIn = true;
    const router2 = this.router = (0, import_itty_router_extras3.ThrowableRouter)({base: "/todos/:namespace"});
    router2.get("/create/:text", import_itty_router_extras3.withParams, async ({namespace, text: text2}) => (0, import_itty_router_extras3.json)(await this.add(text2))).get("/", import_itty_router_extras3.withParams, ({namespace}) => (0, import_itty_router_extras3.json)({namespace, items: this.items})).get("/:id", import_itty_router_extras3.withParams, async ({namespace, id}) => {
      const todo = await this.get(id);
      if (todo) {
        return (0, import_itty_router_extras3.json)({namespace, ...todo});
      }
    }).get("/info", async () => (0, import_itty_router_extras3.json)({
      id: this.state.id.toString(),
      env,
      class: this.constructor.name,
      persistable: this.getPersistable()
    })).get("*", () => (0, import_itty_router_extras3.missing)("Are you sure about that?"));
  }
  async add(text2) {
    const todo = {
      id: this.items.length,
      text: text2
    };
    this.items = [...this.items, todo];
    await this.persist();
    return todo;
  }
  async get(id) {
    const todo = this.items.find((todo2) => todo2.id === Number(id));
    return todo;
  }
};

// durable/Foo.js
var import_itty_router_extras4 = __toModule(require_dist());
var Foo = class extends IttyDurable {
  constructor(state, env) {
    super(state, env);
    this.router.all("*", this.incrementCounter).get("/reset", this.reset).patch("*", import_itty_router_extras4.withContent, ({content = {}}) => {
      Object.assign(this, content);
    }).post("*", import_itty_router_extras4.withContent, this.reset, ({content = {}}) => {
      Object.assign(this, content);
    }).all("*", this.persist, () => (0, import_itty_router_extras4.json)(this));
  }
  incrementCounter() {
    this.counter = (this.counter || 0) + 1;
  }
  reset() {
    this.clear();
    this.counter = 0;
  }
};
var withFoo = (request, env) => {
  const {namespace} = request;
  if (namespace) {
    const id = env.Foo.idFromName(namespace);
    request.Foo = env.Foo.get(id);
  }
};

// durable/Magic.js
var Magic = class extends createIttyDurable({timestamps: true}) {
  constructor(state, env) {
    super(state, env);
    this.counter = 0;
  }
  increment() {
    this.counter++;
  }
  add(a, b) {
    return a + b;
  }
};

// index.js
var router = (0, import_itty_router_extras5.ThrowableRouter)();
router.all("*", withDurables()).get("/do-stuff-with-magic", async ({Magic: Magic2}) => {
  const magic = Magic2.get("test");
  await Promise.all([
    magic.increment(),
    magic.increment(),
    magic.increment()
  ]);
  const {counter} = await magic.toJSON().then((r) => r.json());
  return (0, import_itty_router_extras5.json)({counter});
}).get("/magic", ({Magic: Magic2}) => Magic2.get("test").toJSON()).get("/magic/reset", ({Magic: Magic2}) => Magic2.get("test").clear()).get("/magic/counter", ({durables}) => durables.Magic.get("test", Magic).counter).get("/magic/fail", ({Magic: Magic2}) => Magic2.get("test").fail()).get("/invalid-do/fail", ({InvalidDO}) => InvalidDO.get("test").fail()).get("/magic/:action/:a?/:b?", import_itty_router_extras5.withParams, ({Magic: Magic2, action, a, b}) => Magic2.get("test")[action](Number(a), Number(b))).all("/foo/:namespace/:action?", import_itty_router_extras5.withParams, withFoo, async (request, env) => {
  const {namespace, action, Foo: Foo2} = request;
  const kv = new KVStore({
    path: "Foo",
    kv: env.ROE
  });
  const [
    kvEntry,
    response
  ] = await Promise.all([
    kv.get(namespace),
    Foo2.fetch("https://slick/" + (action || ""), request)
  ]);
  if (!kvEntry) {
    await kv.save(namespace, {namespace, created: new Date()});
  }
  return response;
}).all("/todos/:namespace/*", import_itty_router_extras5.withParams, async (request, env) => {
  const {namespace} = request;
  const id = env.TODOS.idFromName(namespace);
  const obj = env.TODOS.get(id);
  const response = await obj.fetch(request);
  return response;
}).all("*", () => (0, import_itty_router_extras5.missing)("Are you sure about that?"));
var todos_default = {
  fetch: router.handle
};
export {
  Foo,
  Magic,
  Todos,
  todos_default as default
};
