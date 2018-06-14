import { isObservable } from 'rxjs'

export function createHandlers (source) {
  if (isObservable(source)) {
    return createHandler(source)
  }
  if (Array.isArray(source)) {
    return source
      .map((item) => createHandler(item))
  }
  // Assume source is an object.
  return Object.keys(source)
    .reduce((acc, key) => {
      const item = source[key]
      const newKey = keyFromStreamKey(key)
      const handler = createHandler(item)
      return (handler === null)
        ? acc
        : { ...acc, [newKey]: handler }
    }, {})
}

function createHandler (source) {
  return isObservable(source)
    ? function handler (value) { return source.next(value) }
    : null
}

function keyFromStreamKey (key) {
  // If the key is in the format 'key$', then return 'key'.
  return key.replace(/\$$/, '')
}
