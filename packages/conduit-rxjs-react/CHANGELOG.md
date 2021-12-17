# Changelog

## v0.7.0

Published TBD

1. Updated dependencies to latest version.

2. Updated React lifecycle method name for use with React 16.3 to 17.x. This is a temporary fix as opposed to a more permanent fix discussed in [Issue #3](https://github.com/indiana-university/conduit/issues/3).

## v0.6.0

Published May 24, 2019.

1. Fixed broken `componentWillUnmount` callback.

2. Removed `conduit-rxjs` dependency.

3. Removed several RxJS operator dependencies.

4. Reduced bundle size.

## v0.5.0

Published January 29, 2019.

1. Changed software license to BSD 3-Clause, in accordance to the [IU Open Source Guidelines](https://indiana-university.github.io/). Source code and bundles now include licensing banners.

2. This is the first public release of Conduit, transitioning from the IU enterprise npm registry to the public npm registery. All source code is identical to `v0.4.1`.

## v0.4.1

Published June 22, 2018.

### Bug fixes

1. Fixed a runtime error when using the `componentDidRender` callback in the `connect` utility, due to an incorrect RxJS reference. (#62)

## v0.4.0

Published June 15, 2018.

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
