# Conduit

Conduit provides a light set of utilities on top of a reactive library (RxJS) and a UI rendering library (React) to support effecient and scalable front-end applications architectures.

[Get started by reading the Wiki](https://github.iu.edu/iu-uits-es/ess-conduit/wiki).

## Installation and usage

Conduit is composed of two primary packages. Refer to these packages for specific installation and usage.

- [`conduit-rxjs`](packages/conduit-rxjs): [RxJS](http://reactivex.io/rxjs/) utilities to support UI architectures.

- [`conduit-rxjs-react`](packages/conduit-rxjs-react): Conduit utilities for connecting RxJS streams to [React](https://reactjs.org/).

So far, Conduit only supports React, but further packages could be developed as needed to support other rendering libraries.

Review [examples](examples) for how to get started.

## Building and testing

Install dependencies for this repo.

```
npm install
```

Install dependencies for child packages.

```
npm run bootstrap
```

Build package bundles.

```
npm run build
```

Or do all three with:

```
npm run start
```
