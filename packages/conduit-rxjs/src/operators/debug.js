import { tap } from 'rxjs/operators'

export const debug = (msg, val) => (source) =>
  source.pipe(tap((value) => log(value, msg, val)))

function log (value, msg, val) {
  if (msg) {
    if (val) {
      console.log(msg, val)
    } else if (val === null) {
      console.log(msg)
    } else {
      console.log(msg, value)
    }
  } else {
    if (val) {
      console.log(val)
    } else {
      console.log(value)
    }
  }
}
