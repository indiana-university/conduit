import { render } from 'react-dom'
import { interval } from 'rxjs'
import { map, startWith } from 'rxjs/operators'
import { connect } from 'conduit-rxjs-react'

const Timer = (props = {}) => {
  const { duration = 1000, initialValue = 0 } = props

  const state$ = interval(duration).pipe(
    map((value) => initialValue + value + 1),
    startWith(initialValue),
    map((secondsElapsed) => ({ secondsElapsed }))
  )

  const render = ({ secondsElapsed }) => (
    <div>{`Seconds Elapsed: ${secondsElapsed}`}</div>
  )

  return connect(render, state$)
}

const TimerA = Timer()
const TimerB = Timer({ duration: 5000, initialValue: 5 })

const Timers = () => (
  <div>
    <h1>Timers</h1>
    <ul>
      <li>
        <TimerA />
      </li>
      <li>
        <TimerB />
      </li>
    </ul>
  </div>
)

render(<Timers />, document.getElementById('root'))
