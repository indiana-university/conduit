# Conduit RxJS

RxJS utilities to support UI architectures.

## Installation

Install peer dependencies:
- [`rxjs`](https://github.com/ReactiveX/rxjs) `>= 6.2.0`

Then install this package:

```
npm install conduit-rxjs
```

## RxJS

RxJS is a functional reactive library used to control and transform data from one part of the application to another. Data flows from one observable to another in pipelines known as streams. Data is typically sourced from either events that occur over time (represented by a [Subject](http://reactivex.io/rxjs/manual/overview.html#subject)) or values that change over time (represented by a [BehaviorSubject](http://reactivex.io/rxjs/manual/overview.html#behaviorsubject)). For example, birthday parties are events which may occur and repeat over time, while a person's age is information which changes over time. User interaction is a collection of observable events, while application state is a collection of observable values. Read the [RxJS Overview](http://reactivex.io/rxjs/manual/overview.html) document to be introduced to further essential concepts.

## API

Conduit adopts a common convention known as [Finnish Notation](https://medium.com/@benlesh/observables-and-finnish-notation-df8356ed1c9b) in order to assist code readability. The names of streams are postfixed with the `$` character, making it easier to distinguish streams from other variable types. The Conduit API may not work as expected if you don't follow this convention.

- [`createHandlers`](#createhandlers)
- [`createStreams`](#createstreams)
- [`mergeStreams`](#mergestreams)
- [`run`](#run)

### `createHandlers`

Create functions which emit values on a stream. Internally, they call the underlying `next()` method on the observable. This is used most commonly to create event handlers for the UI.

**Usage:** `createHandlers(source)`

**Arguments:**
- `source: Observable|Array of observables|Object of observables`

**Returns:** `Function|Array of functions|Object of functions` If the source is an object of observables, all keys will with a `$` postfix will be removed from the returned object keys.

**Examples:**

Make a handler from a stream using RxJS.

```js
import { Subject } from 'rxjs'

const source$ = new Subject()
function handler(next) {
  source$.next(next)
}
source$.subscribe(console.log)
handler(1) // Logs: 1
handler(2) // Logs: 2
```

Make a handler from a stream using Conduit.

```js
import { Subject } from 'rxjs'
import { createHandlers } from 'conduit-rxjs'

const source$ = new Subject()
source$.subscribe(console.log)
const handler = createHandlers(source$)
handler(1) // Logs: 1
handler(2) // Logs: 2
```

Make handlers from an array of streams using Conduit.

```js
import { Subject } from 'rxjs'
import { createHandlers } from 'conduit-rxjs'

const source = [
  new Subject(),
  new Subject()
]
source[0].subscribe((v) => console.log('A', v))
source[1].subscribe((v) => console.log('B', v))
const handlers = createHandlers(source)
handlers[0](1) // Logs: A 1
handlers[1](2) // Logs: B 2
handlers[0](3) // Logs: A 3
handlers[1](4) // Logs: B 4
```

Make handlers from event streams using Conduit.

```js
import { createStreams, createHandlers } from 'conduit-rxjs'

const source = createStreams([
  'tick'
])
source.tick$.subscribe(console.log)
const handlers = createHandlers(source)
handlers.tick(1) // Logs: 1
handlers.tick(2) // Logs: 2
```

Make handlers from value streams using Conduit.

```js
import { createStreams, createHandlers } from 'conduit-rxjs'

const source = createStreams({
  count: 0
})
source.count$.subscribe(console.log) // Logs: 0
const handlers = createHandlers(source)
handlers.count(1) // Logs: 1
handlers.count(2) // Logs: 2
```

### `createStreams`

Create an object of streams.

**Usage:** `createStreams(source)`

**Arguments:**
- `source: Array|Object` An array of stream names or object of stream names with initial values. Names will be automatically postfixed with a `$` to indicate it is a stream.

**Returns:** Object of streams

**Event stream example:**

Create a collection of event streams with RxJS:

```js
import { Subject } from 'rxjs'

const events = {
  click$: new Subject(),
  keyDown$: new Subject()
}
```

Create a collection of event streams with Conduit:

```js
import { createStreams } from 'conduit-rxjs'

const events = createStreams([
  'click',
  'keyDown'
])
```

**Value stream example:**

Create a collection of value streams with RxJS:

```js
import { BehaviorSubject } from 'rxjs'

const values = {
  id$: new BehaviorSubject(2),
  tasks$: new BehaviorSubject([])
}
```

Create a collection of value streams with Conduit:

```js
import { createStreams } from 'conduit-rxjs'

const values = createStreams({
  id: 2,
  tasks: []
})
```

### `mergeStreams`

Merge any number of object of streams into a single object of streams.

**Usage:** `mergeStreams(...streamObject)`

**Arguments:**
- `streamObjects: ...Object of streams` Any number of object of streams, as would be created from `createStream()`.

**Returns:** Object of streams

**Example:**

Merge a collection of event streams with RxJS.

```js
import { Subject, merge } from 'rxjs'

const eventsA = {
  click$: new Subject(),
  keyDown$: new Subject()
}
const eventsB = {
  click$: new Subject(),
  submit$: new Subject()
}
const eventsC = {
  keyUp$: new Subject()
}
const mergedEvents = {
  click$: merge(eventsA.click$, eventsB.click$),
  keyDown$: eventsA.keyDown$,
  keyUp$: eventsC.keyUp$,
  submit$: eventsB.submit$
}
```

Merge a collection of event streams with Conduit.

```js
import { createStreams, mergeStreams } from 'conduit-rxjs'

const eventsA = createStreams([
  'click',
  'keyDown'
])
const eventsB = createStreams([
  'click',
  'submit'
])
const eventsC = createStreams([
  'keyUp'
])
const mergedEvents = mergeStreams(eventsA, eventsB, eventsC)
```

### `run`

Automatically emit values to an upstream source from a downstream source. Use this to update value streams created with `createStreams()` with values outputed from reducer streams.

**Usage:** `run(source, reducers)`

**Arguments:**
- `source`: An object of streams, as would be created from `createStreams()`. Or an object containing multiple objects of streams.
- `reducers`: Stream or object of streams. Emit objects with keys matching the key of the value stream (without the postfixed `$`). Multiple keys on the same emitted object will result in multiple concurrent updates.

**Returns:** Subscription. This could contain multiple child subscriptions.

**Example 1:**

Increment a counter with RxJS.

```js
import { BehaviorSubject, map, Subject } from 'rxjs'

const count$ = new BehaviorSubject(0)
const increment$ = new Subject()
const increment = (value) => increment$.next(value)
const reducer$ = increment$.pipe(
  withLatestFrom(count$),
  map(([ increment = 1, count ]) => count + increment)
)
const subscription = reducer$.subscribe((value) => count$.next(value))

increment() // Count: 1
increment() // Count: 2
increment(2) // Count: 4
```

Increment a counter with Conduit.

```js
import { map } from 'rxjs'
import { createHandlers, createStreams, run } from 'conduit-rxjs'

const values = createStreams({
  count: 0
})
const events = createStreams([
  'increment'
])
const handlers = createHandlers(events)
const reducer$ = events.increment$.pipe(
  withLatestFrom(values.count$),
  map(([ increment = 1, count ]) => count + increment),
  map((count) => ({ count }))
)
const subscription = run(values, reducer$)

handlers.increment() // Count: 1
handlers.increment() // Count: 2
handlers.increment(2) // Count: 4
```

**Example 2:**

Partition and update values in two different stores with RxJS.

```js
import { BehaviorSubject, map, Subject } from 'rxjs'

const db = {
  count$: new BehaviorSubject(0)
}
const ui = {
  size$: new BehaviorSubject('regular'),
  theme$: new BehaviorSubject('light')
}
const events = {
  increment$: new Subject(),
  toggleSize$: new Subject(),
  toggleTheme$: new Subject()
}
const handlers = {
  increment: (value) => events.increment$.next(value),
  toggleSize: (value) => events.toggleSize$.next(value),
  toggleTheme: (value) => events.toggleTheme$.next(value)
}
const count$ = events.increment$.pipe(
  withLatestFrom(db.count$),
  map(([ increment = 1, count ]) => count + increment)
)
const size$ = events.toggleSize$.pipe(
  withLatestFrom(ui.size$),
  map((size) => size === 'regular' ? 'large' : 'regular')
)
const theme$ = events.toggleTheme$.pipe(
  withLatestFrom(ui.theme$),
  map((theme) => theme === 'light' ? 'dark' : 'light')
)
const countSubscription = count$.subscribe((value) => db.count$.next(value))
const sizeSubscription = size$.subscribe((value) => ui.size$.next(value))
const themeSubscription = theme$.subscribe((value) => ui.theme$.next(value))
countSubscription.add(sizeSubscription)
countSubscription.add(themeSubscription)
const subscription = countSubscription

handlers.increment() // Count: 1
handlers.toggleTheme() // Theme: dark
handlers.toggleSize() // Size: large
handlers.increment() // Count: 2
handlers.toggleTheme() // Theme: light
handlers.increment(2) // Count: 4
```

Partition and update values in two different stores with Conduit.

```js
import { map, merge } from 'rxjs'
import { createHandlers, createStreams, run } from 'conduit-rxjs'

const db = createStreams({
  count: 0
})
const ui = createStreams({
  size: 'regular',
  theme: 'light'
})
const values = { db, ui }
const events = createStreams([
  'increment',
  'toggleSize',
  'toggleTheme'
])
const handlers = createHandlers(events)
const count$ = events.increment$.pipe(
  withLatestFrom(db.count$),
  map(([ increment = 1, count ]) => count + increment),
  map((count) => ({ count }))
)
const size$ = events.toggleSize$.pipe(
  withLatestFrom(ui.size$),
  map((size) => size === 'regular' ? 'large' : 'regular'),
  map((size) => ({ size }))
)
const theme$ = events.toggleTheme$.pipe(
  withLatestFrom(ui.theme$),
  map((theme) => theme === 'light' ? 'dark' : 'light'),
  map((theme) => ({ theme }))
)
const db$ = merge(count$)
const ui$ = merge(size$, theme$)
const reducers = { db$, ui$ }
const subscription = run(values, reducers)

handlers.increment() // Count: 1
handlers.toggleTheme() // Theme: dark
handlers.toggleSize() // Size: large
handlers.increment() // Count: 2
handlers.toggleTheme() // Theme: light
handlers.increment(2) // Count: 4
```
