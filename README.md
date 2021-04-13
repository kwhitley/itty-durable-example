# itty-durable Example

This is an example showing general usage of itty-durable!

### Getting started:
1. clone repo
2. `npm install`
3. modify `wrangler.toml` to your own endpoints/account/zone
4. `wrangler publish --new-class Counter` (first time publishing)
5. `wrangler publish` (subsequent times)

### Example endpoint usage (with output):
```js
// GET https://do.slick.af/itty-durable/counter/reset
{
  "created": "2021-04-13T17:33:45.097Z",
  "counter": 0,
  "modified": "2021-04-13T19:31:15.668Z"
}

// GET https://do.slick.af/itty-durable/counter/do-stuff
// GET https://do.slick.af/itty-durable/counter/do-stuff
{
"created": "2021-04-13T17:33:45.097Z",
"counter": 6,
"modified": "2021-04-13T19:31:52.770Z"
}

// GET https://do.slick.af/itty-durable/counter/value
6

// https://do.slick.af/itty-durable/counter/parsed
Counter value 6 last changed at 2021-04-13T19:31:52.770Z

// GET https://do.slick.af/itty-durable/counter/set/foo/bar
{
  "counter": 6,
  "created": "2021-04-13T17:33:45.097Z",
  "modified": "2021-04-13T20:45:58.892Z",
  "foo": "bar"
}

// GET https://do.slick.af/itty-durable/counter/increment
{
  "counter": 7,
  "created": "2021-04-13T17:33:45.097Z",
  "modified": "2021-04-13T20:45:58.892Z",
  "foo": "bar"
}

// GET https://do.slick.af/itty-durable/counter/add/40/2
42
```
