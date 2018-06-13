import { Observable } from 'rxjs'

// isObservable() was added in v6.1.0, with fixes in v6.2.0.
// Replace with the RxJS function once the peer dependency version is increased.
// https://github.com/ReactiveX/rxjs/blob/6.2.0/src/internal/util/isObservable.ts
export function isObservable (obj) {
  return !!obj && (obj instanceof Observable || (typeof obj.lift === 'function' && typeof obj.subscribe === 'function'))
}
