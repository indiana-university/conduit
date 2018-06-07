# Conduit RxJS React

Conduit utilities for connecting RxJS streams to React.

## Installation

Install peer dependencies:
- [`conduit-rxjs`](../conduit-rxjs) `>= 0.3.0`
- [`react`](https://github.com/facebook/react) `>= 0.14.0`
- [`rxjs`](https://github.com/ReactiveX/rxjs) `>= 6.0.0`

Then install this package.

```
npm install conduit-rxjs-react
```

## API

- [`connect`](#connect)

### `connect`

Create a React component connected to a source stream.

**Usage:** `connect(component, source)`

**Arguments:**
- `component: Functional React Component|Class React Component`
- `source: Object|Stream|Function` If `source` is an object, the component sets the initial state as the object and doesn't render anymore. If `source` is a stream, the component will update when the stream emits. If wanting access to lifecycle methods, `source` should be a function which returns an object or stream.

**Returns:** React component

#### Connecting an object to a component

If `source` is an object, the component sets the initial state as the object but doesn't render anymore.

```js
import React from 'react'
import { render } from 'react-dom'
import { connect } from 'conduit-rxjs-react'

const initialState = {
  name: 'Bob'
}

function Hello(props) {
  return (
    <div>
      Hello {props.name}
    </div>
  )
}

const ConnectedHello = connect(Hello, initialState)

render(<ConnectedHello/>, document.querySelector('#app'))
```

Using `connect` in this way is generally discouraged, since it's simpler to just spread `initialState` on the component.

```js
render(<Hello {...initialState}/>, document.querySelector('#app'))
```

#### Connecting a stream to a component

If `source` is a stream, the component will update when the stream emits.

To maximize performance when rendering, the component updates only when `source` emits a value and when the browser is ready. When `source` emits a value, the component informs the browser via [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) that a repaint will occur. If `source` emits more values while the component waits for the callback to be called, it retains only the latest value. Once the callback is called, rendering is triggered by setting the internal state of the component with the latest value of `source`, via `setState()`.

[Part 5 of Introduction](../../docs/introduction.md#part-5) demonstrates how to connect a stream to a component.

```js
import React from 'react'
import { render } from 'react-dom'
import { interval } from 'rxjs'
import { map, startWith } from 'rxjs/operators'
import { connect } from 'conduit-rxjs-react'

const timerState$ = interval(1000).pipe(
  map((intervalValue) => intervalValue + 1),
  startWith(0),
  map((secondsElapsed) => ({secondsElapsed}))
)

function Timer(props) {
  return (
    <div>Seconds Elapsed: {props.secondsElapsed}</div>
  );
}

const ConnectedTimer = connect(Timer, timerState$)

render(<ConnectedTimer/>, document.querySelector('#app'))
```

#### Connecting a stream to a component with access to lifecycle methods

If wanting access to lifecycle methods, `source` should be a function which returns an object or stream. Generally, the name of this function is called `selector`.

**Usage:** `function selector(props$, componentWillRender, componentWillUnmount) {...}`

**Arguments:**
- `props$: Stream`
- `componentWillRender: Function`
- `componentWillUnmount: Function`
