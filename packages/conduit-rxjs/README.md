# Conduit RxJS

RxJS utilities to support UI architectures.

## Installation

Install peer dependencies:
- [`rxjs`](https://github.com/ReactiveX/rxjs) `>= 6.0.0`

Then install this package:

```
npm install conduit-rxjs
```

## API

- [`bindNext`](#bindnext)
- [`createStreams`](#createstreams)
- [`debug`](#debug) (operator)
- [`mergeStreams`](#mergestreams)
- [`run`](#run)

### `bindNext`

Create functions bound to `next` observable notification methods. This is used most commonly to create event handlers for React components.

**Usage:** `bindNext(source, functionName)`

**Arguments:**
- `source: Observable|Array of observables|Object of observables`
- `functionName: String = "next"` The name of the function bound to `next` that will be returned. This is useful for debugging.

**Returns:** `Function|Array of functions|Object of functions` If the source is an object of observables, all keys will with a `$` postfix will be removed from the returned object keys.

**Example:**

Emit `next` notifications with RxJS.

```js
import { Subject } from 'rxjs'

const tick$ = new Subject()
tick$.next(1)
tick$.next(2)

tick$.subscribe(console.log)

// Console output:
// 1
// 2
```

Emit `next` notification from a bound function with RxJS.

```js
import { Subject } from 'rxjs'

const tick$ = new Subject()
function tick(next) {
  tick$.next(next)
}

tick(1)
tick(2)

tick$.subscribe(console.log)

// Console output:
// 1
// 2
```

Emit `next` notification from a bound function with Conduit, with `source` as an event stream.

```js
import { Subject } from 'rxjs'
import { bindNext } from 'conduit-rxjs'

const event$ = new Subject()
const eventHandler = bindNext(event$)

eventHandler(1)
eventHandler(2)

event$.subscribe(console.log)

// Console output:
// 1
// 2
```

Emit `next` notification from a bound function with Conduit, with `source` as an array of event streams.

```js
import { Subject } from 'rxjs'
import { bindNext } from 'conduit-rxjs'

const events = [
  new Subject(),
  new Subject()
]
const eventHandlers = bindNext(events)

eventHandlers[0](1)
eventHandlers[0](2)

event$.subscribe(console.log)

// Console output:
// 1
// 2
```

Emit `next` notification from a bound function with Conduit, with `source` as an object of event streams.

```js
import { createStreams, bindNext } from 'conduit-rxjs'

const events = createStreams([
  'tick'
])
const eventHandlers = bindNext(events)

eventHandlers.tick(1)
eventHandlers.tick(2)

eventHandlers.tick$.subscribe(console.log)

// Console output:
// 1
// 2
```

Emit `next` notification from a bound function with Conduit, with `source` as an object of value streams.

```js
import { createStreams, bindNext } from 'conduit-rxjs'

const values = createStreams({
  tickCount: 0
})
const valueHandlers = bindNext(values)

valueHandlers.tickCount(1)
valueHandlers.tickCount(2)

values.tickCount$.subscribe(console.log)

// Console output:
// 0
// 1
// 2
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

### `debug`

This function is used as a convenient way to add console logs to observables.

Params:
- **msg** - optional message to display before the value being passed in the stream
- **val** - optional value to take the place of the value being passed in the stream val only takes the place of the stream value in the log statement. It is not passed on in the stream.

Most common usage:

```js
.debug('I made it to this point!', null)
// prints "I made it to this point!" on the console

.debug('current value')
// prints "current value" and whatever is the current value at that point in the stream

.debug()
// prints whatever is the current value in the stream
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
import { BehaviorSubject, Subject } from 'rxjs'
import { map } from 'rxjs/operators'

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
import { map } from 'rxjs/operators'
import { bindNext, createStreams, run } from 'conduit-rxjs'

const values = createStreams({
  count: 0
})
const events = createStreams([
  'increment'
])
const handlers = bindNext(events)
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
import { BehaviorSubject, Subject } from 'rxjs'
import { map } from 'rxjs/operators'

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
import { merge } from 'rxjs'
import { map } from 'rxjs/operators'
import { bindNext, createStreams, run } from 'conduit-rxjs'

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
const handlers = bindNext(events)
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

## Advanced API

Note: These low-level APIs were originally added in order to provide feature-parity with `bindNext()`. But their usage should generally be discouraged, as there are better ways to send errors and complete notifications through streams. These APIs may be removed in the future.

- [`bindNotification`](#bindnotification)
- [`bindError`](#binderror)
- [`bindComplete`](#bindcomplete)

### `bindNotification`

A low level method for creating functions bound to observable notification methods. It is recommended to use `bindNext`, `bindComplete`, and `bindError` instead of this method. It is most common to use `bindNext`.

**Usage:** `bindNotification(source, notification, functionName)`

**Arguments:**
- `source: Observable|Array of observables|Object of observables`
- `notification: "next"|"complete"|"error"` The notification method to bind from the `source` observable.
- `functionName: String (optional)` The name of the function that will be returned. This is useful for debugging. If not provided, `functionName` defaults to the value of the `notification` argument.

**Returns:** `Function|Array of functions|Object of functions` If the source is an object of observables, all keys will with a `$` postfix will be removed from the returned object keys.

**Example:**

Bind `next`, `error`, and `complete` methods using `bindNotification`.

```js
import { createStreams, bindNotification } from 'conduit-rxjs'

const events = createStreams(['tick'])
const nextHandlers = bindNotification(events, 'next')
const errorHandlers = bindNotification(events, 'error')
const completeHandlers = bindNotification(events, 'complete')
```

Bind `next`, `error`, and `complete` methods using `bindNext`, `bindError`, and `bindComplete`.

```js
import { createStreams, bindNext, bindError, bindComplete } from 'conduit-rxjs'

const events = createStreams(['tick'])
const nextHandlers = bindNext(events)
const errorHandlers = bindError(events)
const completeHandlers = bindComplete(events)
```

### `bindError`

Create functions bound to `error` observable notification methods.

**Usage:** `bindError(source, functionName)`

**Arguments:**
- `source: Observable|Array of observables|Object of observables`
- `functionName: String = "error"` The name of the function bound to `error` that will be returned. This is useful for debugging.

**Returns:** `Function|Array of functions|Object of functions` If the source is an object of observables, all keys will with a `$` postfix will be removed from the returned object keys.

**Example:**

Emit `error` notification with RxJS.

```js
import { Subject } from 'rxjs'

const tick$ = new Subject()
tick$.error('error')
```

Emit `error` notification from a bound function with RxJS.

```js
import { Subject } from 'rxjs'

const tick$ = new Subject()
function tickError(error) {
  tick$.error(error)
}

tickError('error')
```

Emit `error` notification from a bound function with Conduit.

```js
import { createStreams, bindError } from 'conduit-rxjs'

const events = createStreams(['tick'])
const errorHandlers = bindError(events)

errorHandlers.tick('error')
```

### `bindComplete`

Create functions bound to `complete` observable notification methods.

**Usage:** `bindComplete(source, functionName)`

**Arguments:**
- `source: Observable|Array of observables|Object of observables`
- `functionName: String = "complete"` The name of the function bound to `complete` that will be returned. This is useful for debugging.

**Returns:** `Function|Array of functions|Object of functions` If the source is an object of observables, all keys will with a `$` postfix will be removed from the returned object keys.

**Example:**

Emit `complete` notification with RxJS.

```js
import { Subject } from 'rxjs'

const tick$ = new Subject()
tick$.complete()
```

Emit `complete` notification from a bound function with RxJS.

```js
import { Subject } from 'rxjs'

const tick$ = new Subject()
function tickComplete() {
  tick$.complete()
}

tickComplete()
```

Emit `complete` notification from a bound function with Conduit.

```js
import { createStreams, bindComplete } from 'conduit-rxjs'

const events = createStreams(['tick'])
const completeHandlers = bindComplete(events)

completeHandlers.tick()
```
