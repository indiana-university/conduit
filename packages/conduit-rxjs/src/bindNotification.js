import { Observable } from 'rxjs'

export function bindNext (source, fnName) {
  return bindNotification(source, 'next', fnName)
}

export function bindError (source, fnName) {
  return bindNotification(source, 'error', fnName)
}

export function bindComplete (source, fnName) {
  return bindNotification(source, 'complete', fnName)
}

export function bindNotification (source, notification, fnName) {
  if (source instanceof Observable) { return createBindNotification(source, notification, fnName) }
  if (Array.isArray(source)) {
    return source
      .map(item => createBindNotification(source, notification, fnName))
  }
  // Assume source is an object.
  return Object.keys(source)
    .reduce((acc, key) => {
      const item = source[key]
      const newKey = keyFromStreamKey(key)
      const bindFn = createBindNotification(item, notification, newKey)
      if (bindFn === null) return acc
      return {...acc, [newKey]: bindFn}
    }, {})
}

// Return a dynamically named function.
// Function names will be next(), error(), complete(), or something custom.
function createBindNotification (source, notification, fnName = notification) {
  if (!(source instanceof Observable)) return null
  if (source[notification] === undefined) return null
  const fnString = bindFunctionFactory.toString().replace('next', fnName)
  return new Function(`return ${fnString}`)()(source, notification)
}

function bindFunctionFactory (source, notification) {
  return function next (value) {
    return source[notification](value)
  }
}

function keyFromStreamKey (key) {
  // If the key is in the format 'key$', then return 'key'.
  return key.replace(/\$$/, '')
}
