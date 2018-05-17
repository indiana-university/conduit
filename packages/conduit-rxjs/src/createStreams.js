import { BehaviorSubject, Subject } from 'rxjs'

export function createStreams (source) {
  const keys = Array.isArray(source)
    ? source
    : Object.keys(source)
  return keys
    .reduce(
      (acc, key) => ({
        ...acc,
        [`${key}$`]: createStream(source[key])
      }),
      {}
    )
}

export function createStream (initValue) {
  return initValue === undefined
    ? new Subject()
    : new BehaviorSubject(initValue)
}
