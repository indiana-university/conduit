import {Observable} from 'rxjs/Observable';

// Automatically connect any number of value and reducer domains.
// If structured symmetrically, this:
//   run(values, reducers);
// Is equivalent to:
//   run(values.db, reducers.db$);
//   run(values.ui, reducers.ui$);
// Returns a subscription encompassing all underlying subscriptions.
export function run(values, reducer$) {
  const isReducerObservable = reducer$ instanceof Observable;
  const domains = isReducerObservable
    ? [{values, reducer$}]
    : Object.keys(values)
        .map(domain =>
          ({values: values[domain], reducer$: reducer$[`${domain}$`]})
        )
        .filter(({reducer$}) => reducer$ instanceof Observable);

  const subscription = domains
    .map(subscribeToDomain)
    // Make all subsequent subscriptions child subscriptions to the first.
    .reduce((sub, childSub) => {
      if(sub === null) return childSub;
      sub.add(childSub);
      return sub;
    }, null);

  return subscription;
}

function subscribeToDomain(domain) {
  const {values, reducer$} = domain;
  return reducer$
    .subscribe(nextValues =>
      Object.keys(nextValues)
        .map(key => ({subject$: values[`${key}$`], nextValue: nextValues[key]}))
        .filter(({subject$}) => subject$)
        .forEach(({subject$, nextValue}) => subject$.next(nextValue))
    );
}
