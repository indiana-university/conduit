/**
 * Copyright (C) 2019 The Trustees of Indiana University
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { html, render } from 'lighterhtml'
import { combineLatest, merge, of } from 'rxjs'
import { map, mapTo, tap, withLatestFrom } from 'rxjs/operators'
import { createHandlers, createStreams, run } from 'conduit-rxjs'
import { whenAdded } from 'when-elements'
import { StatusBar } from './StatusBar'

// Tie together the application.
export function App (config) {
  const values = createValues()
  const state = createState(values, config)

  // Initiate child components.
  StatusBar(values)

  const events = createEvents()
  const intent = createIntent(events, state)
  const reducers$ = createReducers(intent)
  const selector$ = createSelector(events, state)

  whenAdded('#root', (el) => {
    const sub = selector$.subscribe((props) => {
      render(el, () => renderApp(props))
    })
    const runSub = run(values, reducers$)
    sub.add(runSub)
    return () => sub.unsubscribe()
  })
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
    .map(([ title, text ], id) => ({ id, title, text }))
  const samples$ = of(samples)
  return {
    ...values,
    samples$
  }
}

// Initialize all UI events.
function createEvents () {
  return createStreams([
    'changeText',
    'clearText',
    'loadSample'
  ])
}

// Transform UI events into the underlying meaning of that event.
function createIntent (events, state) {
  const changeText$ = events.changeText$.pipe(
    map((event) => event.target.value)
  )
  const clearText$ = events.clearText$.pipe(
    mapTo('')
  )
  const loadText$ = events.loadSample$.pipe(
    tap((event) => event.preventDefault()),
    map((event) => event.target.elements['sampleSelect'].value),
    withLatestFrom(state.samples$),
    map(([ id, samples ]) => samples[id].text)
  )
  const updateText$ = merge(
    clearText$,
    loadText$
  )
  return {
    changeText$,
    updateText$
  }
}

// Update value streams based on intent.
function createReducers (intent) {
  const updateText$ = intent.updateText$.pipe(
    // Ensure the uncontrolled field stays up to date with state,
    // especially when the value is indirectly changed.
    // Isolate side effects in `tap()` operations.
    tap((text) => {
      document.getElementById('textInput').value = text
    })
  )
  const text$ = merge(intent.changeText$, updateText$).pipe(
    map((text) => ({ text }))
  )
  // The object keys will be mapped to the associated value stream in the `run()` subscription.
  return merge(
    text$
  )
}

// Select the minimal information needed to render the view.
function createSelector (events, state) {
  // Create all handlers at once.
  const handlers = createHandlers(events)
  // Combine all values into a single stream.
  return combineLatest(state.text$, state.samples$).pipe(
    map(([ text, samples ]) =>
      ({ handlers, text, samples })
    )
  )
}

// Values emitted by the selector become component props.
function renderApp (props) {
  const { handlers } = props
  return html`
    <div class='ex'>
      <header class='ex-header'>
        <h1 class='ex-heading'>Word Count</h1>
        ${renderToolbar(props)}
      </header>
      <div class='ex-content'>
        <textarea
          aria-controls='statusbar'
          aria-label='Text'
          class='ex-textarea'
          id='textInput'
          oninput=${handlers.changeText} />
      </div>
      <footer class='ex-footer'>
        <wc-status-bar />
      </footer>
    </div>
  `
}

// Because Toolbar will only be rendered once,
// there is no need to make it into its own component.
function renderToolbar (props) {
  const { handlers, samples } = props
  return html`
    <div class='ex-toolbar'>
      <form
        class='ex-toolbar__control'
        onsubmit=${handlers.loadSample}>
        <label
          class='ex-label'
          for='sampleSelect'>
          Samples
        </label>
        <select id='sampleSelect'>
          ${samples.map(({ id, title }) => html`
            <option
              key=${id}
              value=${id}>
              ${title}
            </option>
          `)}
        </select>
        <button type='submit'>Load</button>
      </form>
      <div>
        <button
          onclick=${handlers.clearText}
          type='button'>
          Clear
        </button>
      </div>
    </div>
  `
}
