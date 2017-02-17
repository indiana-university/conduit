import {_do} from 'rxjs/operator/do';

// This function is used as a convenient way to add console logs to observables
// Params:
//   msg - optional message to display before the value being passed in the stream
//   val - optional value to take the place of the value being passed in the stream
//         val only takes the place of the stream value in the log statement. 
//         It is not passed on in the stream.
// most common usage:
//   .debug('I made it to this point!',null)  ==> prints "I made it to this point!" on the console
//   .debug('current value')  ==> prints "current value" and whatever is the current value at that point in the stream
//   .debug()  ==> prints whatever is the current value in the stream
export function debug(msg, val) {
  if (msg) {
    if (val) {
      return this::_do(console.log(msg,val));
    } else if (val === null) {
      return this::_do(console.log(msg));
    } else {
      return this::_do(value => console.log(msg,value));
    }
  } else {
    if (val) {
      return this::_do(console.log(val));
    } else {
      return this::_do(value => console.log(value));
    }
  }
}
