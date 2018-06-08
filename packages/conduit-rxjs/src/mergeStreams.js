import { merge } from 'rxjs'
import { isObservable } from './isObservable'

export function mergeStreams (...streamSets) {
  // Group all values from all sources by key.
  const mergedStreamSet = streamSets
    .reduce((acc, streamSet) => {
      return Object.keys(streamSet)
        .reduce((streams, key) => {
          const a$ = streamSet[key]
          const b$ = acc[key]
          const stream$ = b$ === undefined ? [ a$ ] : [ ...b$, a$ ]
          return { ...streams, [key]: stream$ }
        }, acc)
    }, {})
  // Convert all array values to observables.
  return Object.keys(mergedStreamSet)
    .reduce((acc, key) => {
      const streams = mergedStreamSet[key]
      // If there was only one item in array, keep it as is.
      if (streams.length === 1) {
        return { ...acc, [key]: streams[0] }
      }
      // If every item is not an observable, drop it.
      if (!streams.every((item) => isObservable(item))) {
        return acc
      }
      // Otherwise, merge.
      return { ...acc, [key]: merge(...streams) }
    }, {})
}
