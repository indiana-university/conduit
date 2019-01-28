/**
 * Copyright (C) 2019 The Trustees of Indiana University
 * SPDX-License-Identifier: BSD-3-Clause
 */

import React from 'react'
import { render } from 'react-dom'
import { interval } from 'rxjs'
import { map, startWith, switchMap } from 'rxjs/operators'
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
