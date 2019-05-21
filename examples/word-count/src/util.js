/**
 * Copyright (C) 2019 The Trustees of Indiana University
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { BehaviorSubject, Observable, Subject, bindCallback, from, fromEvent, isObservable, merge } from 'rxjs'
import { audit, distinctUntilChanged, map, mergeMap, shareReplay, tap } from 'rxjs/operators'
import { render } from 'lighterhtml'

export const animationFrame = () => (source$) => source$.pipe(
  audit(bindCallback((x, callback) => window.requestAnimationFrame(callback)))
)

// Make `distinctUntilChanged` operator work with deeply nested objects.
export const distinctUntilObjectChanged = () => (source$) => source$.pipe(
  distinctUntilChanged(null, (value) => JSON.stringify(value))
)

// Merge an array of streams of objects into a single stream of objects.
// Useful as the final operator of a selector stream.
// combineLatest(a$, b$).pipe(
//   // [ { a }, { b } ]
//   reduceStreams({ c })
//   // { a, b, c }
// )
// Other names: reduceObjects, reduceToObject, reduceObjectsToObject
export const reduceStreams = (init = {}) => (source$) => source$.pipe(
  map((source) =>
    source
      .reduce((prev, curr) => ({ ...prev, ...curr }), init)
  )
)

// Subscribe to any number of streams, while not affecting the source stream.
// Prevents needing to manually manage subscriptions by hooking into the parent subscription.
// a$.pipe(
//   tapSubscribe(b$)
// ).subscribe()
export const tapSubscribe = (...sources) => (source$) => {
  if (!sources.length) {
    return source$
  }
  const _source$ = source$.pipe(
    shareReplay(1)
  )
  const subscription = _source$.subscribe()
  sources
    .forEach((s$) =>
      subscription.add(s$.subscribe())
    )
  return _source$
}

// Input a prop object.
// Output a function to be rendered.
// `el` could be optional if `renderComponent`
// is forced to be the last operator of any `defineStream`.
// However, by not tying it to `defineStream`,
// it becomes more general purpose.
// You could also abstract it so any rendering library
// could be integrated here instead of just lighterhtml.
// `renderComponent(el, component, libraryCallback)`
// `renderReactComponent(el, component)`
export const renderComponent = (target, component) => (source$) => source$.pipe(
  distinctUntilObjectChanged(),
  animationFrame(),
  tap((props) => render(target, () => component(props)))
)

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

export function fromAttribute (target, name) {
  return new Observable((subscriber) => {
    const next = () => subscriber.next(target.getAttribute(name))
    next()
    const mutationObserver = new window.MutationObserver((mutationsList) =>
      mutationsList
        .filter(({ type }) => type === 'attributes')
        .filter(({ attributeName }) => attributeName === name)
        .forEach(next)
    )
    mutationObserver.observe(target, { attributes: true })
    return () => mutationObserver.disconnect()
  }).pipe(
    shareReplay(1)
  )
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

// Listen to an element property change.
// Useful for getting `data` or `props` properties from lighterhtml elements.
// Should the `name` param default to `props` or `data` or nothing?
export function fromProperty (target, name) {
  const property$ = new BehaviorSubject(target[name])
  Object.defineProperty(target, name, {
    get () {
      return property$.getValue()
    },
    set (value) {
      property$.next(value)
    }
  })
  return property$
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

export function useCallbackStack () {
  const stack = new Set()
  const add = (value) => {
    if (typeof value === 'function') {
      stack.add(value)
    }
  }
  const call = () => {
    stack.forEach((callback) => callback())
    stack.clear()
  }
  return [ add, call ]
}

// This follows a similar signature to the `useState()` hook,
// but it is named to complement Conduit's `createStreams()`.
export function createStream (initialValue) {
  const stream$ = initialValue === undefined
    ? new Subject()
    : new BehaviorSubject(initialValue)
  const next = (value) => stream$.next(value)
  return [ stream$, next ]
}
