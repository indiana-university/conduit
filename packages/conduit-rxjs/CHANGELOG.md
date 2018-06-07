# Changelog

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
