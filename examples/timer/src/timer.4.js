/**
 * Copyright (C) 2019 The Trustees of Indiana University
 * SPDX-License-Identifier: BSD-3-Clause
 */

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
