/**
 * Copyright (C) 2019 The Trustees of Indiana University
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { combineLatest, merge, of } from 'rxjs'
import { map, mapTo, tap, withLatestFrom } from 'rxjs'
import { createHandlers, createStreams, run } from 'conduit-rxjs'
import { connect } from 'conduit-rxjs-react'
import { StatusBar } from './StatusBar'

// Tie together the application.
export function App (config) {
  const values = createValues()
  const state = createState(values, config)

  // Initiate child components.
  const statusBar = StatusBar(values)
  const components = {
    StatusBar: statusBar.component
  }

  const events = createEvents()
  const intent = createIntent(events, state)
  const reducers$ = createReducers(intent)
  const selector$ = createSelector(events, state, components)
  const component = connect(render, selector$)
  const subscription = run(values, reducers$)
  return { component, subscription }
}

// Initialize data that will change over time.
function createValues () {
  return createStreams({
    text: ''
  })
}

// Derive new data as needed.
function createState (values, config) {
  const samples = config.samples
    .map(([title, text], id) => ({ id, title, text }))
  const samples$ = of(samples)
  return {
    ...values,
    samples$
  }
}

// Initialize all UI events.
function createEvents () {
  return createStreams([
    'handleChangeText',
    'handleClearText',
    'handleLoadSample'
  ])
}

// Transform UI events into the underlying meaning of that event.
function createIntent (events, state) {
  const handleChangeText$ = events.handleChangeText$.pipe(
    map((event) => event.target.value)
  )
  const handleClearText$ = events.handleClearText$.pipe(
    mapTo('')
  )
  const loadText$ = events.handleLoadSample$.pipe(
    tap((event) => event.preventDefault()),
    map((event) => event.target.elements.sampleSelect.value),
    withLatestFrom(state.samples$),
    map(([id, samples]) => samples[id].text)
  )
  const updateText$ = merge(
    handleChangeText$,
    handleClearText$,
    loadText$
  )
  return {
    updateText$
  }
}

// Update value streams based on intent.
function createReducers (intent) {
  const text$ = intent.updateText$.pipe(
    // Ensure the uncontrolled field stays up to date with state,
    // especially when the value is indirectly changed.
    // Isolate side effects in `tap()` operations.
    tap((text) => {
      document.getElementById('textInput').value = text
    }),
    map((text) => ({ text }))
  )
  // The object keys will be mapped to the associated value stream in the `run()` subscription.
  return merge(
    text$
  )
}

// Select the minimal information needed to render the view.
function createSelector (events, state, components) {
  // Create all handlers at once.
  const handlers = createHandlers(events)
  // Combine all values into a single stream.
  return combineLatest(state.text$, state.samples$).pipe(
    map(([text, samples]) =>
      ({ components, handlers, text, samples })
    )
  )
}

// Values emitted by the selector become component props.
function render (props) {
  const { components, handlers, text } = props
  const { StatusBar } = components
  return (
    <div className='ex'>
      <header className='ex-header'>
        <h1 className='ex-heading'>Word Count</h1>
        {renderToolbar(props)}
      </header>
      <div className='ex-content'>
        <textarea
          aria-controls='statusbar'
          aria-label='Text'
          className='ex-textarea'
          defaultValue={text}
          id='textInput'
          onChange={handlers.handleChangeText}
        />
      </div>
      <footer className='ex-footer'>
        <StatusBar />
      </footer>
    </div>
  )
}

// Because Toolbar will only be rendered once,
// there is no need to make it into its own component.
function renderToolbar (props) {
  const { handlers, samples } = props
  return (
    <div className='ex-toolbar'>
      <form
        className='ex-toolbar__control'
        onSubmit={handlers.handleLoadSample}
      >
        <label
          className='ex-label'
          htmlFor='sampleSelect'
        >
          Samples
        </label>
        <select id='sampleSelect'>
          {samples.map(({ id, title }) =>
            <option
              key={id}
              value={id}
            >
              {title}
            </option>
          )}
        </select>
        <button type='submit'>Load</button>
      </form>
      <div>
        <button
          onClick={handlers.handleClearText}
          type='button'
        >
          Clear
        </button>
      </div>
    </div>
  )
}
