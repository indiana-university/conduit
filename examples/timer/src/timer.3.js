/**
 * Copyright (C) 2019 The Trustees of Indiana University
 * SPDX-License-Identifier: BSD-3-Clause
 */

import React from 'react'
import { render } from 'react-dom'
import { interval, map, startWith } from 'rxjs'

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
