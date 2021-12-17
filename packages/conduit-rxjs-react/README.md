# Conduit RxJS React

Conduit utilities for connecting RxJS streams to React.

## Installation

Install peer dependencies:
- [`react`](https://github.com/facebook/react) `>= 0.14.0`
- [`rxjs`](https://github.com/ReactiveX/rxjs) `>= 6.2.0`

Then install this package.

```
npm install conduit-rxjs-react
```

## API

- [`connect`](#connect)

### `connect`

Create a React component connected to a source stream.

**Usage:** `connect(component, source, ...selectorArguments)`

**Arguments:**
- `component: Functional React Component|Class React Component`
- `source: Object|Stream|Function` If `source` is an object, the component sets the initial state as the object and doesn't render anymore. If `source` is a stream, the component will update when the stream emits. If wanting access to lifecycle methods, `source` should be a "selector" function which returns an object or stream.
- `selectorArguments: ...Argument list of strings (optional)`. See [*Customizing the selector function*](#customizing-the-selector-function) for usage.

**Returns:** React component

#### Connecting to an object

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

render(<ConnectedHello />, document.querySelector('#app'))
```

Using `connect` in this way is generally discouraged, since it's simpler to just spread `initialState` on the component.

```js
render(<Hello {...initialState} />, document.querySelector('#app'))
```

#### Connecting to a stream

If `source` is a stream, the component will update when the stream emits.

To maximize performance when rendering, the component updates only when `source` emits a value and when the browser is ready. When `source` emits a value, the component informs the browser via [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) that a repaint will occur. If `source` emits more values while the component waits for the callback to be called, it retains only the latest value. Once the callback is called, rendering is triggered by setting the internal state of the component with the latest value of `source`, via `setState()`.

[Part 5 of Introduction](../../docs/introduction.md#part-5) demonstrates how to connect a stream to a component.

```js
import React from 'react'
import { render } from 'react-dom'
import { interval } from 'rxjs'
import { map, startWith } from 'rxjs'
import { connect } from 'conduit-rxjs-react'

const timerState$ = interval(1000).pipe(
  map((intervalValue) => intervalValue + 1),
  startWith(0),
  map((secondsElapsed) => ({ secondsElapsed }))
)

function Timer(props) {
  return (
    <div>Seconds Elapsed: {props.secondsElapsed}</div>
  )
}

const ConnectedTimer = connect(Timer, timerState$)

render(<ConnectedTimer />, document.querySelector('#app'))
```

#### Connecting to lifecycle methods

If `source` is an object or stream, `source` is shared with any number of component instances that may be mounted. However, if wanting to ensure that every instance is isolated, `source` should be a function. In addition, `source` as a function gives you access to each instance's lifecycle methods. Generally, the name of this function is called `selector`, because you *select* what should be connected to the component.

**Usage:** `function selector(props$, componentDidRender, componentWillUnmount) {...}`

**Arguments:**
- `props$: Stream` A stream of prop updates. This is initialized with the initial value of props.
- `componentDidRender: Function` Pass it a function that will be called whenever the component next renders. This could occur both after mounting and after updates, but it is only called once. If this is called multiple times between renders, all passed functions will be queued and called in sequence after the next render. This is particularly useful when wanting to do some conditional DOM side effects, such as placing focus on an element after it is rendered.
- `componentWillUnmount: Function` Pass it a function that will be called whenever the component unmounts. Similar to `componentDidRender`, multiple calls are queued and will be called in sequence during unmount. This is useful for cleanup, such as unsubscribing from subscriptions made within the `selector` function.

**Example:**

```js
import React from 'react'
import { render } from 'react-dom'
import { combineLatest, interval } from 'rxjs'
import { map, startWith, switchMap, tap } from 'rxjs'
import { connect } from 'conduit-rxjs-react'

function selector(props$, componentDidRender, componentWillUnmount) {
  // Calculate the lifespan of the component.
  const mountTime = new Date()
  componentWillUnmount(() => {
    const unmountTime = new Date()
    const lifespanSeconds = Math.ceil((unmountTime - mountTime) / 1000)
    console.log(`Component lifespan: ${lifespanSeconds} seconds`)
  })
  // Reset the counter whenever the duration prop updates.
  const count$ = props$.pipe(
    map(({ duration }) => Math.parseInt(duration)),
    startWith(1000),
    switchMap((duration) =>
      interval(duration).pipe(
        map((i) => i + 1),
        startWith(0)
      )
    ),
    // When the count is even, focus on the even button.
    // When the count is odd, focus on the odd button.
    tap((count) => {
      const id = `focusButton${count % 2 === 0 ? 'Even' : 'Odd'}`
      componentDidRender(() => document.getElementById(id).focus())
    })
    map((count) => ({ count }))
  )
  return combineLatest(props$, count$).pipe(
    // Merge the array of objects into a single object.
    // This is the component's state.
    map((source) => source.reduce((acc, value) => ({ ...acc, ...value }), {}))
  )
}

function Count(props) {
  return (
    <div>
      <div>Count: {props.count}</div>
      <button id="focusButtonEven">Even</button>
      <button id="focusButtonOdd">Odd</button>
    </div>
  )
}

const ConnectedCount = connect(Count, selector)

render(<ConnectedCount duration={5000} />, document.querySelector('#app'))
```

#### Customizing the selector function

By default, `connect` will ensure `props$`, `componentDidRender`, and `componentWillUnmount` are available whenever `source` is a function. If you don't need all these options, then indicate which ones you need by listing the names of options as additional string arguments for `connect`. As a performance gain, other selector options will never be initated. This is also useful if you'd prefer the options to be ordered differently.

Default options:

```js
function selector(props$, componentDidRender, componentWillUnmount) {
  ...
}

// This:
const ConnectedCount = connect(Count, selector)

// Is the same as this:
const ConnectedCount = connect(Count, selector, 'props$', 'componentDidRender', 'componentWillUnmount')
```

Use a subset of options:

```js
function selector(componentWillUnmount) {
  ...
}
const ConnectedCount = connect(Count, selector, 'componentWillUnmount')
```

Reorder options:

```js
function selector(componentDidRender, props$) {
  ...
}
const ConnectedCount = connect(Count, selector, 'componentDidRender', 'props$')
```
