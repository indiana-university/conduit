# Connecting RxJS to a React component

The following exercises will walk you through how to use RxJS with React, and how Conduit could simplify some of that work.

## Part 1

Let's start with the [first asynchronous example provided by React](https://facebook.github.io/react/), a simple timer, and see how it can be enhanced with RxJS.

Part 1 working demo: https://jsfiddle.net/jka99chitown/L5hf2zdz/

```jsx
import React from 'react'
import { render } from 'react-dom'

class Timer extends React.Component {
  constructor(props) {
    super(props)
    this.state = { secondsElapsed: 0 }
  }
  tick() {
    this.setState((prevState) => ({
      secondsElapsed: prevState.secondsElapsed + 1
    }))
  }
  componentDidMount() {
    this.interval = setInterval(() => this.tick(), 1000)
  }
  componentWillUnmount() {
    clearInterval(this.interval)
  }
  render() {
    return (
      <div>Seconds Elapsed: {this.state.secondsElapsed}</div>
    );
  }
}

render(<Timer/>, document.querySelector('#app'))
```

## Part 2

Replace `setInterval` with RxJS [`interval` observable](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#static-method-interval). Like `setInterval`, RxJS observables are subscribed to and should be unsubscribed when no longer needed.

Part 2 working demo: https://jsfiddle.net/jka99chitown/7zh5qudL/

```jsx
import React from 'react'
import { render } from 'react-dom'
import { interval } from 'rxjs'

class Timer extends React.Component {
  constructor(props) {
    super(props)
    this.state = { secondsElapsed: 0 }
  }
  tick() {
    this.setState((prevState) => ({
      secondsElapsed: prevState.secondsElapsed + 1
    }))
  }
  componentDidMount() {
    this.subscription = interval(1000)
      .subscribe(() => this.tick())
  }
  componentWillUnmount() {
    this.subscription.unsubscribe()
  }
  render() {
    return (
      <div>Seconds Elapsed: {this.state.secondsElapsed}</div>
    );
  }
}

render(<Timer/>, document.querySelector('#app'))
```

## Part 3

Have RxJS manage initial state and state updates. Once the stream is subscribed to, it will synchronously receive the initial value provided by the [`startWith` operator](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-startWith), which in this case is `0`. That means the component state can be synchronously set in the constructor. All subsequent updates will be handled via the component's `setState()` method.

After the first second, interval emits an incrementing value every second. Because the first value emitted by `interval` is `0` and not `1`, all emitted values are incremented by `1` using the [`map` operator](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-map).

The initial and subsequent values are mapped to an object, which becomes the component state.

Part 3 working demo: https://jsfiddle.net/jka99chitown/msobj0yp/

```jsx
import React from 'react'
import { render } from 'react-dom'
import { interval } from 'rxjs'
import { map, startWith } from 'rxjs/operators'

class Timer extends React.Component {
  constructor(props) {
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
  componentWillUnmount() {
    this.subscription.unsubscribe()
  }
  render() {
    return (
      <div>Seconds Elapsed: {this.state.secondsElapsed}</div>
    );
  }
}

render(<Timer/>, document.querySelector('#app'))
```

## Part 4

Let's take the component and abstract it into a [higher-order component factory](https://facebook.github.io/react/docs/higher-order-components.html), so any stateless component can connect to any RxJS stream.

Part 4 working demo: https://jsfiddle.net/jka99chitown/ptpycwmf/

```jsx
import React from 'react'
import { render } from 'react-dom'
import { interval } from 'rxjs'
import { map, startWith } from 'rxjs/operators'

function connect(WrappedComponent, state$) {
  return class Connect extends React.Component {
    constructor(props) {
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
    componentWillUnmount() {
      this.subscription.unsubscribe()
    }
    render() {
      return <WrappedComponent {...this.state}/>
    }
  };
}

const timerState$ = interval(1000).pipe(
  map((intervalValue) => intervalValue + 1),
  startWith(0),
  map((secondsElapsed) => ({ secondsElapsed }))
)

function Timer(props) {
  return (
    <div>Seconds Elapsed: {props.secondsElapsed}</div>
  );
}

const ConnectedTimer = connect(Timer, timerState$)

render(<ConnectedTimer/>, document.querySelector('#app'))
```

## Part 5

Rather than providing your own higher-order component factory, you can use the connect factory supplied through `conduit-rxjs`. The `conduit-rxjs` connect factory for React provides other enhancements, such as access to [React lifecycle methods](https://facebook.github.io/react/docs/react-component.html), rendering only when the source stream updates, and delaying rendering until the browser is ready to paint (via [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)).

```jsx
import React from 'react'
import { render } from 'react-dom'
import { interval } from 'rxjs'
import { map, startWith } from 'rxjs/operators'
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

render(<ConnectedTimer/>, document.querySelector('#app'))
```

## Part 6

Perhaps you want to create several timers, each with different starting times and interval durations. You could create a stateless component for the timer, which returns a connected component.

```jsx
import React from 'react'
import { render } from 'react-dom'
import { interval } from 'rxjs'
import { map, startWith } from 'rxjs/operators'
import { connect } from 'conduit-rxjs-react'

function Timer(props) {
  const { duration = 1000, initialValue = 0 } = props
  const state$ = interval(duration).pipe(
    map((intervalValue) => initialValue + intervalValue + 1),
    startWith(initialValue),
    map((secondsElapsed) => ({ secondsElapsed }))
  )

  function render(props) {
    return (
      <div>Seconds Elapsed: {props.secondsElapsed}</div>
    )
  }

  return connect(render, state$)
}

function Timers() {
  return (
    <div>
      <Timer/>
      <Timer duration="5000" initialValue="5"/>
    </div>
  )
}

render(<Timers/>, document.querySelector('#app'))
```
