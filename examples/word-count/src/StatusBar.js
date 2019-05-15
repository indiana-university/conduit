/**
 * Copyright (C) 2019 The Trustees of Indiana University
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { html, render } from 'lighterhtml'
import { combineLatest } from 'rxjs'
import { map } from 'rxjs/operators'
import { whenAdded } from 'when-elements'

// Tie together the application.
export function StatusBar (values) {
  const state = createState(values)
  const selector$ = createSelector(state)

  whenAdded('wc-status-bar', (el) => {
    const sub = selector$.subscribe((props) => {
      render(el, () => renderStatusBar(props))
    })
    return () => sub.unsubscribe()
  })
}

// Derive new data from the source value streams.
function createState (values) {
  const { text$ } = values
  const charCount$ = text$.pipe(
    map((text) => text.length)
  )
  const wordCount$ = text$.pipe(
    map((text) => text.match(/\S+/g)),
    map((matches) => matches ? matches.length : 0)
  )
  const sentenceCount$ = text$.pipe(
    map((text) => text.match(/\w[.?!](\s|$)/g)),
    map((matches) => matches ? matches.length : 0)
  )
  return {
    ...values,
    charCount$,
    wordCount$,
    sentenceCount$
  }
}

// Select the minimal information needed to render the view.
// Combine all values into a single stream.
function createSelector (state) {
  return combineLatest(state.charCount$, state.wordCount$, state.sentenceCount$).pipe(
    map(([ charCount, wordCount, sentenceCount ]) =>
      ({ charCount, wordCount, sentenceCount })
    )
  )
}

function renderStatusBar (props) {
  const { charCount, wordCount, sentenceCount } = props
  return html`
    <ul
      aria-atomic='false'
      aria-label='Text stats'
      aria-live='polite'
      class='ex-statusbar'
      id='statusbar'>
      ${renderItem(charCount, 'character')}
      ${renderItem(wordCount, 'word')}
      ${renderItem(sentenceCount, 'sentence')}
    </ul>
  `
}

function renderItem (value, label) {
  return html`
    <li class='ex-statusbar__item'>
      ${value.toLocaleString()} ${pluralize(value, label)}
    </li>
  `
}

function pluralize (value, singular, plural = `${singular}s`) {
  return value === 1 ? singular : plural
}
