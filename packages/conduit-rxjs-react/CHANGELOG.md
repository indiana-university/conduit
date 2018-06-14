# Changelog

## v0.4.0 (In Progress)

Published TBD.

### Breaking changes

1. `conduit-rxjs` peer dependency is updated to `>= 0.4.0`.

2. `rxjs` peer dependency is updated from `>= 6.0.0` to `>= 6.2.0` in order for Conduit to internally take advantage of the new `isObservable()` utility. (#53, #55)

## v0.3.1

Published May 17, 2018.

### New features

1. Conduit packages are now precompiled in their npm packages as [UMD bundles](https://github.com/umdjs/umd), meaning they can be imported as browser globals or ES6 modules or `require()` modules. There are minified and unminified bundles, along with source maps. The bundles are only available via npm, while the source code is only available via the git repo. (#9)

### Breaking changes

1. RxJS v6 is now required. See [Migration from v5](https://github.com/ReactiveX/rxjs/blob/6.2.0/MIGRATION.md). (#22)

2. React concerns are now isolated into a new package, `conduit-rxjs-react`. (#5, #19)

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
