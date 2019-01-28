/**
 * Copyright (C) 2019 The Trustees of Indiana University
 * SPDX-License-Identifier: BSD-3-Clause
 */

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

function Timer (props) {
  return (
    <div>Seconds Elapsed: {props.secondsElapsed}</div>
  )
}

const ConnectedTimer = connect(Timer, timerState$)

render(<ConnectedTimer />, document.querySelector('#timer5'))
