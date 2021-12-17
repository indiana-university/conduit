/**
 * Copyright (C) 2019 The Trustees of Indiana University
 * SPDX-License-Identifier: BSD-3-Clause
 */

import React from 'react'
import { render } from 'react-dom'
import { interval, map, startWith } from 'rxjs'
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
