# Timer example

The following exercises will walk you through how to use RxJS with React, and how Conduit's [`conduit-rxjs-react`](../../packages/conduit-rxjs-react) package could simplify some of that work.

## Installation and usage

Once you [build the Conduit packages](../../README.md#building-and-testing), this example's dependencies will be installed. Just start the dev server and the example will open in the browser at [http://localhost:8080/](http://localhost:8080/).

```
npm run start
```

## Part 1

Let's start with the [first asynchronous example provided by React](https://facebook.github.io/react/), a simple timer, and see how it can be enhanced with RxJS.

```jsx
import React from 'react'
import { render } from 'react-dom'

class Timer extends React.Component {
  constructor (props) {
    super(props)
    this.state = { secondsElapsed: 0 }
  }
  tick () {
    this.setState((prevState) => ({
      secondsElapsed: prevState.secondsElapsed + 1
    }))
  }
  componentDidMount () {
    this.interval = setInterval(() => this.tick(), 1000)
  }
  componentWillUnmount () {
    clearInterval(this.interval)
  }
  render () {
    return (
      <div>Seconds Elapsed: {this.state.secondsElapsed}</div>
    )
  }
}

render(<Timer />, document.querySelector('#timer1'))
```

## Part 2

Replace `setInterval` with RxJS [`interval` observable](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#static-method-interval). Like `setInterval`, RxJS observables are subscribed to and should be unsubscribed when no longer needed.

```jsx
import React from 'react'
import { render } from 'react-dom'
import { interval } from 'rxjs'

class Timer extends React.Component {
  constructor (props) {
    super(props)
    this.state = { secondsElapsed: 0 }
  }
  tick () {
    this.setState((prevState) => ({
      secondsElapsed: prevState.secondsElapsed + 1
    }))
  }
  componentDidMount () {
    this.subscription = interval(1000)
      .subscribe(() => this.tick())
  }
  componentWillUnmount () {
    this.subscription.unsubscribe()
  }
  render () {
    return (
      <div>Seconds Elapsed: {this.state.secondsElapsed}</div>
    )
  }
}

render(<Timer />, document.querySelector('#timer2'))
```

## Part 3

Have RxJS manage initial state and state updates.

1. After the first second, interval emits an incrementing value every second.
2. Then these values are incremented by `1` using the [`map` operator](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-map).
3. Once the stream is subscribed to, it will synchronously receive the initial value provided by the [`startWith` operator](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-startWith). That means the component state can be synchronously set in the constructor. All subsequent updates will be handled via the component's `setState()` method. If `startWith` would be placed before the `map` (step 2), then the value would be transformed by it and incremented by `1`. In order it ensure the starting value of `0` is not transformed, it is placed after `map`. 
4. Finally, the values are mapped to an object, which becomes the component state.

```
interval      ---0---1---2---...
map           ---1---2---3---...
startWith    0---1---2---3---...
map         {0}-{1}-{2}-{3}--...
```

```jsx
import React from 'react'
import { render } from 'react-dom'
import { interval } from 'rxjs'
import { map, startWith } from 'rxjs'

class Timer extends React.Component {
  constructor (props) {
    super(props)
    this.subscription = interval(1000).pipe(
      map((intervalValue) => intervalValue + 1),
      startWith(0),
      map((secondsElapsed) => ({ secondsElapsed }))
    )
      .subscribe((state) => {
        if (!this.state) {
          this.state = state
          return
        }
        this.setState(state)
      })
  }
  componentWillUnmount () {
    this.subscription.unsubscribe()
  }
  render () {
    return (
      <div>Seconds Elapsed: {this.state.secondsElapsed}</div>
    )
  }
}

render(<Timer />, document.querySelector('#timer3'))
```

## Part 4

Let's take the component and abstract it into a [higher-order component factory](https://facebook.github.io/react/docs/higher-order-components.html), so any stateless component can connect to any RxJS stream.

```jsx
import React from 'react'
import { render } from 'react-dom'
import { interval } from 'rxjs'
import { map, startWith } from 'rxjs'

function connect (WrappedComponent, state$) {
  return class Connect extends React.Component {
    constructor (props) {
      super(props)
      this.subscription = state$
        .subscribe((state) => {
          if (!this.state) {
            this.state = state
            return
          }
          this.setState(state)
        })
    }
    componentWillUnmount () {
      this.subscription.unsubscribe()
    }
    render () {
      return <WrappedComponent {...this.state} />
    }
  }
}

const timerState$ = interval(1000).pipe(
  map((intervalValue) => intervalValue + 1),
  startWith(0),
  map((secondsElapsed) => ({ secondsElapsed }))
)

function Timer (props) {
  return (
    <div>Seconds Elapsed: {props.secondsElapsed}</div>
  )
}

const ConnectedTimer = connect(Timer, timerState$)

render(<ConnectedTimer />, document.querySelector('#timer4'))
```

## Part 5

Rather than providing your own higher-order component factory, you can use the `connect` factory supplied through `conduit-rxjs-react`. This factory provides other enhancements, such as access to [React lifecycle methods](https://facebook.github.io/react/docs/react-component.html), rendering only when the source stream updates, and delaying rendering until the browser is ready to paint (via [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)).

```jsx
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

function Timer (props) {
  return (
    <div>Seconds Elapsed: {props.secondsElapsed}</div>
  )
}

const ConnectedTimer = connect(Timer, timerState$)

render(<ConnectedTimer />, document.querySelector('#timer5'))
```

## Part 6

Perhaps you want to create several timers, each with different starting times and interval durations. You could create a function that configures a connected component.

```jsx
import React from 'react'
import { render } from 'react-dom'
import { interval } from 'rxjs'
import { map, startWith } from 'rxjs'
import { connect } from 'conduit-rxjs-react'

function createTimer (config = {}) {
  const { duration = 1000, initialValue = 0 } = config
  const state$ = interval(duration).pipe(
    map((intervalValue) => initialValue + intervalValue + 1),
    startWith(initialValue),
    map((secondsElapsed) => ({ secondsElapsed }))
  )
  function render (props) {
    return (
      <div>Seconds Elapsed: {props.secondsElapsed}</div>
    )
  }
  return connect(render, state$)
}

const Timer1 = createTimer()
const Timer2 = createTimer({ duration: 5000, initialValue: 5 })

function Timers () {
  return (
    <ol>
      <li><Timer1 /></li>
      <li><Timer2 /></li>
    </ol>
  )
}

render(<Timers />, document.querySelector('#timer6'))
```

## Part 7

Instead of manually creating several instances of the same connected component, you can configure one instance with React props. Supply a `selector` function instead of a stream for the second `connect` argument in order to receive a stream of props (`props$`). The `createTimer()` is only called once, but the `selector` function will be called during the mounting of each `<Timer>`.

```js
import React from 'react'
import { render } from 'react-dom'
import { interval } from 'rxjs'
import { map, startWith, switchMap } from 'rxjs'
import { connect } from 'conduit-rxjs-react'

function createTimer () {
  function selector (props$) {
    return props$.pipe(
      // Whenever the props change, start a new timer sequence using the new props.
      switchMap(({ duration = 1000, initialValue = 0 }) =>
        interval(duration).pipe(
          map((intervalValue) => initialValue + intervalValue + 1),
          startWith(initialValue)
        )
      ),
      map((secondsElapsed) => ({ secondsElapsed }))
    )
  }
  function render (props) {
    return (
      <div>Seconds Elapsed: {props.secondsElapsed}</div>
    )
  }
  return connect(render, selector)
}

const Timer = createTimer()

function Timers () {
  return (
    <ol>
      <li><Timer /></li>
      <li><Timer duration={5000} initialValue={5} /></li>
    </ol>
  )
}

render(<Timers />, document.querySelector('#timer7'))
```
