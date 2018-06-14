# Changelog

## v0.4.0 (In Progress)

Published TBD.

### Breaking changes

1. The `shareStream()` operator was a convinence for `publishReplay(1).refCount()`. But since RxJS v5.4.0 re-introduced the `shareReplay()` operator which does the same thing, `shareStream()` is removed in favor of the native operator. Replace all uses of `shareStream()` with `shareReplay(1)` to maintain feature equivalence. (#34, #38)

```js
// Replace this:
import { interval } from 'rxjs'
import { map } from 'rxjs/operators'
import { shareStream } from 'conduit-rxjs'

const ticker$ = interval(1000).pipe(
  map((value) => value * 2),
  shareStream()
)

// With this:
import { interval } from 'rxjs'
import { map, shareReplay } from 'rxjs/operators'

const ticker$ = interval(1000).pipe(
  map((value) => value * 2),
  shareReplay(1)
)
```

2. The `bindNext()` function is renamed to `createHandlers()`. This new name reflects the primary use case (which is creating handlers), rather than how it was interfacing with the RxJS API (which binds to the observable's `next()` method). The new name also better aligns with the naming convention of the `createStreams()` Conduit function. Additionally, to simplify the function, the optional second argument for passing a custom name to the function is removed. (#33, #40)

```js
// Replace this:
import { bindNext } from 'conduit-rxjs'
const handlers = bindNext(source, 'name')

// With this:
import { createHandlers } from 'conduit-rxjs'
const handlers = createHandlers(source)
```

3. The `bindError()`, `bindComplete()`, and `bindNotification()` functions are removed. These were created alongside `bindNext()` in order to provide full parity with an observable subscription signature (next, error, complete). It was never good practice to use these, as there are better ways to throw errors and complete observables with native operators. (#33, #40)

4. The `createStream()` function is removed in order to keep Conduit's API surface minimal. This was exported but never documented. Just use `createStreams()` instead. (#33, #40)

```js
// Replace this:
import { createStream } from 'conduit-rxjs'
const event$ = createStream()
const value$ = createStream(0)

// With this:
import { createStreams } from 'conduit-rxjs'
const { event$ } = createStreams([ 'event' ])
const { value$ } = createStreams({ value: 0 })
```

5. The `debug()` operator is removed because it is not essential to Conduit. Replace `debug()` with the `tap()` operator or use [`rxjs-console-logger`](https://github.com/donaldaverill/rxjs-console-logger-operator). (#42, #45)

```js
// Replace this:
import { interval } from 'rxjs'
import { debug } from 'conduit-rxjs'
interval(1000).pipe(
  debug('Debugging')
)
.subscribe()

// With this:
import { interval } from 'rxjs'
import { tap } from 'rxjs/operators'
interval(1000).pipe(
  tap((v) => console.log('Debugging', v))
)
.subscribe()

// Or with this:
import { interval } from 'rxjs'
import { debug } from 'rxjs-console-logger'
interval(1000).pipe(
  debug('Debugging')
)
.subscribe()
```

6. `rxjs` peer dependency is updated from `>= 6.0.0` to `>= 6.2.0` in order for Conduit to internally take advantage of the new `isObservable()` utility. (#53, #55)

## v0.3.1

Published May 17, 2018.

### New features

1. Conduit packages are now precompiled in their npm packages as [UMD bundles](https://github.com/umdjs/umd), meaning they can be imported as browser globals or ES6 modules or `require()` modules. There are minified and unminified bundles, along with source maps. The bundles are only available via npm, while the source code is only available via the git repo. (#9)

### Breaking changes

1. RxJS v6 is now required. See [Migration from v5](https://github.com/ReactiveX/rxjs/blob/6.2.0/MIGRATION.md). (#22)

2. Instead of patching the Observable prototype with Conduit operators or using the [experimental bind (`::`) operator](https://github.com/tc39/proposal-bind-operator), now use [pipeable operators](https://github.com/ReactiveX/rxjs/blob/6.2.0/doc/pipeable-operators.md). (#22)

```js
// Don't patch the Observable prototype.
import 'conduit-rxjs/add/operator/debug'
import 'conduit-rxjs/add/operator/shareStream'

// Don't use bind.
import { debug } from 'conduit-rxjs/operator/debug'
import { shareStream } from 'conduit-rxjs/operator/shareStream'

// Use pipeable operators.
import { debug, shareStream } from 'conduit-rxjs'
```

3. React concerns are now isolated into a new package, `conduit-rxjs-react`. (#5, #19)

```js
// Replace this:
import { connect } from 'conduit-rxjs/connect/react'

// With this:
import { connect } from 'conduit-rxjs-react'
```

## v0.2.0

Published February 21, 2017.

## v0.1.0

Published February 13, 2017.
