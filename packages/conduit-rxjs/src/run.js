import { isObservable } from './isObservable'

export function run (values, reducer$) {
  const domains = isObservable(reducer$)
    ? [ { values, reducer$ } ]
    : Object.keys(values)
      .map((domain) =>
        ({ values: values[domain], reducer$: reducer$[`${domain}$`] })
      )
      .filter(({ reducer$ }) => isObservable(reducer$))
  const subscription = domains
    .map(subscribeToDomain)
    // Make all subsequent subscriptions child subscriptions to the first.
    .reduce((sub, childSub) => {
      if (sub === null) {
        return childSub
      }
      sub.add(childSub)
      return sub
    }, null)
  return subscription
}

function subscribeToDomain (domain) {
  const { values, reducer$ } = domain
  return reducer$
    .subscribe((nextValues) =>
      Object.keys(nextValues)
        .map((key) => ({ subject$: values[`${key}$`], nextValue: nextValues[key] }))
        .filter(({ subject$ }) => subject$)
        .forEach(({ subject$, nextValue }) => subject$.next(nextValue))
    )
}
