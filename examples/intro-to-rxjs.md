# Introduction to RxJS

Contents

1. [Naming convention](#naming-convention)
2. [Common operators](#common-operators)
3. [Custom operators](#custom-operators)
4. [Side effects](#side-effects)
5. [Debugging](#debugging)
6. [Multicasting](#multicasting)

## Naming convention

A common naming convention for streams is known as [Finnish Notation](https://medium.com/@benlesh/observables-and-finnish-notation-df8356ed1c9b). Instead of naming a stream as `stream`, the name is postfixed with a `$`, making it `stream$`. This convention assists code readability, making it easier to distinguish streams from other variable types.

## Common operators

RxJS provides over a 150 operators, and this can be overwhelming for those new to the library. But there are a handful that are commonly used, so try to understand these first. In practice, if you are implementing workarounds or side effects to get RxJS to do what you want, there's probably an operator you just haven't learned, yet.

Static operators (otherwise known as a producers) are used to initiate observables. They emit data that gets transformed by [pipeable operators](https://github.com/ReactiveX/rxjs/blob/6.2.1/doc/pipeable-operators.md) through the `.pipe()` method.

| Area | Static Operator | Pipeable Operator |
| --- | --- | --- |
| Creation | [`from`], [`of`] | |
| Combination | [`combineLatest`], [`merge`] | [`startWith`], [`withLatestFrom`] |
| Filtering | | [`distinctUntilChanged`], [`filter`] |
| Transformation | | [`map`], [`mapTo`], [`mergeMap`], [`scan`], [`switchMap`] |
| Utility | | [`tap`] |
| Multicasting | | [`share`], [`shareReplay`] |

[`combineLatest`]: http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#static-method-combineLatest
[`distinctUntilChanged`]: http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-distinctUntilChanged
[`filter`]: http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-filter
[`from`]: http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#static-method-from
[`map`]: http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-map
[`mapTo`]: http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-mapTo
[`merge`]: http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#static-method-merge
[`mergeMap`]: http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-mergeMap
[`of`]: http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#static-method-of
[`scan`]: http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-scan
[`share`]: http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-share
[`shareReplay`]: http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-shareReplay
[`startWith`]: http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-startWith
[`switchMap`]: http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-switchMap
[`tap`]: http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-do
[`withLatestFrom`]: http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-withLatestFrom

In RxJS v6, static operators and pipeable operators are imported from different locations.

```js
import { combineLatest, from, merge, of } from 'rxjs'
import { distinctUntilChanged, filter, map, mapTo, mergeMap } from 'rxjs'
```

## Custom operators

If there's an operator configuration or sequence that is often used, it is now easy to abstract it into a custom pipeable operator. For example, if needing a simple object equality checker to guard against adjacent duplicate values, consider abstracting this into a shared module.

```js
// operators.js
import { distinctUntilChanged } from 'rxjs'

export const distinctUntilObjectChanged = () => (source) =>
  source.pipe(distinctUntilChanged(null, (value) => JSON.stringify(value)))

// app.js
import { of } from 'rxjs'
import { distinctUntilObjectChanged } from './operators'

of(
  { a: 1 },
  { a: 1, b: 2 },
  { a: 1, b: 2 },
  { c: 3 }
)
.pipe(
  distinctUntilObjectChanged()
)
.subscribe(console.log) // { a: 1 } ... { a: 1, b: 2 } ... { c: 3 }
```

## Side effects

If needing to do any work outside of the stream, the best places to do that is within the `tap` operator or `subscribe`. Examples of side effects:

* Output a message with [`console.log()`](https://developer.mozilla.org/en-US/docs/Web/API/Console/log).
* Change focus with [`element.focus()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus).
* Save to [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).
* Modify a variable declared outside of the stream.

## Debugging

If wanting to inspect the values emitted at different stages in a stream, an easy way is to `log` the output. It may be tempting to inject these calls within other operations, but ultimately, it starts to uncomfortably intertwine temporary debug code with app code.

```js
import { interval } from 'rxjs'
import { map } from 'rxjs'

interval(1000).pipe(
  map((i) => {
    const value = i * 2
    console.log('Interval', value)
    return value
  })
).subscribe()
```

Instead, isolate these side effects in the `tap` operator, as it only inspects input and never modifies its output.

```js
import { interval } from 'rxjs'
import { map, tap } from 'rxjs'

interval(1000).pipe(
  map((i) => i * 2),
  tap((value) => console.log('Interval', value))
).subscribe()
```

If wanting to simplify this even more, consider using the [`rxjs-console-logger`](https://github.com/donaldaverill/rxjs-console-logger-operator) package or creating a custom operator.

```js
import { interval } from 'rxjs'
import { map } from 'rxjs'
import { debug } from 'rxjs-console-logger'

interval(1000).pipe(
  map((i) => i * 2),
  debug('Interval')
).subscribe()
```

Remember to always subscribe to a stream. Otherwise, no operators will ever be executed.

```js
import { interval } from 'rxjs'
import { map } from 'rxjs'
import { debug } from 'rxjs-console-logger'

interval(1000).pipe(
  map((i) => i * 2),
  debug('Interval')  // This will never be called.
)
```

Conduit hides much of the management around subscriptions, placing such details under the responsability of the [`run`](../packages/conduit-rxjs/#run) utility. As long as a stream eventually connects into `run`, it should be subscribed to by `run`.

## Multicasting

RxJS makes it easy to create data flows. Streams merge together and split apart, transforming and modifying data along the way.

```
a$    1---2---3---4---
b$          a---b---c-

c$    merge(a$, b$)
      1---2-a-3-b-4-c-

d$    c$.skip(3)
      --------3-b-4-c-

e$    d$.skip(2)
      ------------4-c-

f$    d$.skip(1)
      ----------b-4-c-
```

In this example, `e$` and `f$` both extend the work started by `d$`. The expectation is that the work of `d$` occurs only once, and the result is shared with `e$` and `f$`.

```
a$  |  |  b$
    | /
    |/
c$  |
d$  |
e$  |\    f$
    |  \
    |  |
```

However, RxJS is not configured this way by default. Instead, for each split in the stream, work is repeated up the chain. This makes the implementation details of the library easier, more flexible, and more effecient, but it places more responsibility on the user. A stream that behaves this way is commonly called a *cold observable*.

```
a$  |  |  b$    a$  |  |  b$
    | /             | /
    |/              |/
c$  |           c$  |
d$  |           d$  |
e$  |           f$  |
    |               |
    |               |
```

In order to ensure the work by `d$` occurs only once, its value needs to be explicitly shared with `e$` and `f$`. To do this, use the `share` operator as the last operatation on `d$`. A stream that behaves this way is commonly called a *hot observable*.

```js
import { share, skip } from 'rxjs'

const d$ = c$.pipe(
  skip(3),
  share()
)
```

`share` can work fine in most cases. However, there's no guarantee that `e$` and `f$` will receive the same value from `d$`. `e$` and `f$` will only ever receive values that occur after the time in which they subscribe to `d$`. If `f$` subscribes later than `e$`, then `f$` will not have the same latest value as `e$`.

In order to ensure late subscribers like `f$` receive the latest value as soon as they subscribe, use `shareReplay(1)` rather than `share`. The first argument is the number of values remembered and shared by `d$`. In most cases, only one (the latest) is needed.

```js
import { shareReplay, skip } from 'rxjs'

const d$ = c$.pipe(
  skip(3),
  shareReplay(1)
)
```
