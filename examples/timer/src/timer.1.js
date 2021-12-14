/**
 * Copyright (C) 2019 The Trustees of Indiana University
 * SPDX-License-Identifier: BSD-3-Clause
 */

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
