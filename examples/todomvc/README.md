# TodoMVC example

This example is an implementation of the [TodoMVC](http://todomvc.com/) project, following this [spec](https://github.com/tastejs/todomvc/blob/master/app-spec.md). It demonstrates:

* Client-side routing, with [Flatiron Director](https://github.com/flatiron/director) (the recommended routing library for TodoMVC).
* Data persistence, with [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).
* Focusing on an element after component render.
* Adding, updating, and removing items in a list.
* Creating a custom RxJS operator.

## Installation and usage

Once you [build the Conduit packages](../../), this example's dependencies will be installed. Just start the dev server and the example will open in the browser at [http://localhost:8080/](http://localhost:8080/).

```
npm run start
```
