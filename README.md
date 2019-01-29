<img width="840" src="https://raw.githubusercontent.com/indiana-university/conduit/master/media/logo/conduit-logo.svg?sanitize=true" alt="Conduit">

Conduit provides a light set of utilities on top of a reactive library ([RxJS](http://reactivex.io/rxjs/)) and a UI rendering library ([React](https://reactjs.org/)) to support efficient and scalable front-end application architectures.

Contents

1. [Contributing guidelines](CONTRIBUTING.md)
2. [Installation and usage](#installation-and-usage)
3. [Building and testing](#building-and-testing)
4. [Background](#background)
5. [Further reading](#further-reading)
6. [Similar projects](#similar-projects)
7. [Contributors](#contributors)

## Installation and usage

Conduit is composed of two primary packages. Refer to these packages for specific installation and usage.

- [`conduit-rxjs`](packages/conduit-rxjs): RxJS utilities to support UI architectures.

- [`conduit-rxjs-react`](packages/conduit-rxjs-react): Conduit utilities for connecting RxJS streams to React.

So far, Conduit only supports React, but further packages could be developed as needed to support other rendering libraries.

Review [examples](examples) for how to get started.

## Building and testing

Install dependencies for this repo, for child packages, and for examples. Then build bundles.

```
npm run start
```

## Background

Applications serve three primary purposes: input data, process data, and output data. For dynamic web applications, data input and output occurs in HTML, while data processing occurs in JavaScript.

Virtual DOM libraries, such as Facebook's [React](https://facebook.github.io/react/), help to normalize the complexities involved with updating HTML in different browser environments, while giving developers a more declarative way to define changes according to different input.

As for data processing and data flow, the JavaScript community has shifted toward a unidirectional architecture, as opposed to a bidirectional architecture, as championed by [AngularJS](https://angularjs.org/) since 2010. Within this new paradigm, there are [quite a few popular architectures](http://staltz.com/unidirectional-user-interface-architectures.html), each with their own advantages and disadvantages. [Reflux](https://github.com/reflux/refluxjs) simplified many concepts originally proposed by the [Flux architecture](https://github.com/facebook/flux/). But a common contemporary pairing with React is [Redux](http://redux.js.org/).

Redux is conceptually simple. Actions trigger Reducers to alter a single Store, which provides all the state needed for components to render. Redux itself is very small at its core. It organically grows by abstracting reusable code into boilerplate functions. It provides applications flexibility to include third party Middleware, to handle behaviors such as Ajax requests, timers, undo, and pagination.

The synchronous nature of Redux is insufficient to handle the future of web applications. Modern applications must manage interactions with a vast ecosystem of users, servers, and devices, all of which will occur at their own timing. By evidence of Redux Middleware, asynchronous behavior is an enhancement to an application, rather than something the application inherently embodies. In contrast, if Redux was asynchronous by nature, synchronous behavior would be innate. While Redux as a tool is lacking, Redux as a pattern is worth emulating.

If using a tool like RxJS, the [Redux pattern can be replicated with minimal effort](http://redux.js.org/docs/introduction/PriorArt.html#rx), while providing much more power to solve complex asynchronous problems. RxJS is a general-purpose reactive library which provides the majority of tools needed to manipulate and manage events and values over time. [RxJS](http://reactivex.io/rxjs/) is one of the most popular and active reactive libraries available, alongside [bacon.js](https://github.com/baconjs/bacon.js), [kefir](https://github.com/rpominov/kefir), and [xstream](https://github.com/staltz/xstream). However, unlike other libraries, because it is part of the cross-platform [ReactiveX library family](http://reactivex.io/), a developer learning RxJS can use familiar APIs to develop with [RxJava](https://github.com/ReactiveX/RxJava). RxJS was originally published by Microsoft in 2013, and now it is managed as an open source project, with Netflix being a primary contributor. [One of the major goals of RxJS v5](https://github.com/ReactiveX/rxjs/blob/master/MIGRATION.md) is to align its API with the ES7 Observable spec, meaning it actively positions itself for the future of the JavaScript language.

There are several JavaScript frameworks built for reactive architectures, but they package a custom non-general purpose reactive library under the hood ([Cerebral](http://www.cerebraljs.com/), [MobX](https://github.com/mobxjs/mobx)), assume a non-React VirtualDOM ([Cycle.js](https://cycle.js.org/)), or require a high-level language which compiles down to JavaScript ([Elm](http://elm-lang.org/)). By [understanding these and other unidirectional architectures](http://staltz.com/unidirectional-user-interface-architectures.html), a simple set of RxJS/React utilities can be created to support recommended architecture patterns, which will be more future-friendly, adaptable, and maintainable than a custom or existing framework. These utilities could eventually be generalized to work with any reactive library or any virtual DOM library.

## Further reading

- [*Glossary of Modern JavaScript Concepts: Part 1*](https://dzone.com/articles/glossary-of-modern-javascript-concepts-part-1), Feb 2017
- [*Master the JavaScript Interview: What is Functional Programming?*](https://medium.com/javascript-scene/master-the-javascript-interview-what-is-functional-programming-7f218c68b3a0#.5urj6rvuw), Jan 2017
- [*The introduction to Reactive Programming you've been missing*](https://gist.github.com/staltz/868e7e9bc2a7b8c1f754), Feb 2016

## Similar projects

- [`component-from-stream`](https://github.com/zenyway/component-from-stream)
- [Cycle.js](https://cycle.js.org/)
- [Meiosis](https://meiosis.js.org/)
- [MobX](https://github.com/mobxjs/mobx)
- [ProppyJS](https://proppyjs.com/)
- [Recompose observable utilities](https://github.com/acdlite/recompose/blob/master/docs/API.md#observable-utilities)
- [Recycle](https://recycle.js.org/)

## Contributors

- Chris Basham ([@basham](https://github.com/basham))
- James Anderson ([@james-anderson](https://github.com/james-anderson))
