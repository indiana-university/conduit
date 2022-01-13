/**
 * Copyright (C) 2019 The Trustees of Indiana University
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { distinctUntilChanged, shareReplay } from 'rxjs'

// Create a custom operator because the two underlying operators
// are paired freqeuently in `createState()`.
export const distinctAndShare = () => (source) => (
  source.pipe(
    // The second argument stringifies the value,
    // to make simple string-based equality checks.
    // This is a simple way to compare objects or other variable types.
    distinctUntilChanged(null, (value) => JSON.stringify(value)),
    shareReplay(1)
  )
)

export function pluralize (value, singular, plural = `${singular}s`) {
  return value === 1 ? singular : plural
}

export function uuid () {
  let i, random
  let uuid = ''
  for (i = 0; i < 32; i++) {
    random = Math.random() * 16 | 0
    if (i === 8 || i === 12 || i === 16 || i === 20) {
      uuid += '-'
    }
    uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random))
      .toString(16)
  }
  return uuid
}
