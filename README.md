<img width="840" src="https://raw.githubusercontent.com/basham/conduit-media/master/logo/conduit-logo.svg?sanitize=true" alt="Conduit">

Conduit provides a light set of utilities on top of a reactive library ([RxJS](http://reactivex.io/rxjs/)) and a UI rendering library ([React](https://reactjs.org/)) to support efficient and scalable front-end applications architectures.

## Installation and usage

Conduit is composed of two primary packages. Refer to these packages for specific installation and usage.

- [`conduit-rxjs`](packages/conduit-rxjs): RxJS utilities to support UI architectures.

- [`conduit-rxjs-react`](packages/conduit-rxjs-react): Conduit utilities for connecting RxJS streams to React.

So far, Conduit only supports React, but further packages could be developed as needed to support other rendering libraries.

Review [examples](examples) and [docs](docs) for how to get started.

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

## RxJS

This document assumes a basic knowledge of RxJS. Read the [RxJS Overview](http://reactivex.io/rxjs/manual/overview.html) to be introduced to essential concepts.

RxJS is used to control and transform data from one part of the application to another. Data flows from one observable to another in pipelines known as streams. (By convention, the name of a stream is postfixed with a `$` character, in order to assist code readability.) Data is typically sourced from either events that occur over time (represented by a [Subject](http://reactivex.io/rxjs/manual/overview.html#subject)) or values that change over time (represented by a [BehaviorSubject](http://reactivex.io/rxjs/manual/overview.html#behaviorsubject)). For example, birthday parties are events which may occur and repeat over time, while a person's age is information which changes over time. User interaction is a collection of observable events, while application state is a collection of observable values.

## Further reading

- [*Glossary of Modern JavaScript Concepts: Part 1*](https://dzone.com/articles/glossary-of-modern-javascript-concepts-part-1), Feb 2017
- [*Master the JavaScript Interview: What is Functional Programming?*](https://medium.com/javascript-scene/master-the-javascript-interview-what-is-functional-programming-7f218c68b3a0#.5urj6rvuw), Jan 2017
- [*The introduction to Reactive Programming you've been missing*](https://gist.github.com/staltz/868e7e9bc2a7b8c1f754), Feb 2016

## Similar projects

- [Recycle](https://recycle.js.org/)

## Contributors

- Chris Basham ([csbasham](https://github.iu.edu/csbasham))
- James Anderson ([anderjak](https://github.iu.edu/anderjak))
