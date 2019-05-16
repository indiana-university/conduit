import { from, fromEvent, isObservable, merge } from 'rxjs'
import { map, mergeMap, shareReplay } from 'rxjs/operators'

// Emit stream values as DOM events.
export function dispatch (target, source) {
  return sourceToStream().pipe(
    mergeMap((dispatches) => {
      // Use Object.entries() if not wanting to support IE.
      const entries = Object.keys(dispatches)
        .map((key) => [ key, dispatches[key] ])
      return from(entries)
    })
  ).subscribe(([ type, detail ]) => {
    const event = new window.CustomEvent(type, { bubbles: true, detail })
    target.dispatchEvent(event)
  })
  function sourceToStream () {
    if (isObservable(source)) {
      return source
    }
    const streams$ = Object.keys(source)
      .filter((key) => isObservable(source[key]))
      .map((key) =>
        source[key].pipe(
          map((value) => ({ [key]: value }))
        )
      )
    return merge(...streams$)
  }
}

export function fromDataEvents (events) {
  return fromEvents(document, events, ({ detail }) => detail)
}

// Create event data streams in bulk.
export function fromEvents (target, events = [], selector = (event) => (event)) {
  return events
    .reduce((acc, key) =>
      ({ ...acc, [key]: eventStream(key) }),
    {})
  function eventStream (type) {
    return fromEvent(target, type).pipe(
      map(selector),
      shareReplay(1)
    )
  }
}

// Subscribe to all streams in an array, object, or just an observable.
export function subscribe (source) {
  const subscriptions = sourceToArray(source)
    .filter((stream$) => isObservable(stream$))
    .map((stream$) => stream$.subscribe())
  return () => {
    subscriptions.forEach((sub) => sub.unsubscribe())
  }
  function sourceToArray () {
    if (isObservable(source)) {
      return [ source ]
    }
    if (Array.isArray(source)) {
      return source
    }
    return Object.keys(source)
      .map((key) => source[key])
  }
}
