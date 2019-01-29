# Examples

If new to RxJS, consider reading [*Introduction to RxJS*](intro-to-rxjs.md). This document outlines some fundamental concepts which will help you better undestand the examples.

Examples, in order of complexity:

1. [Timer](timer)
2. [Word Count](word-count)
3. [TodoMVC](todomvc)

## Dependencies

The examples utilizes the following dependencies:

- [`conduit-rxjs`](../packages/conduit-rxjs)
- [`conduit-rxjs-react`](../packages/conduit-rxjs-react)
- [`react`](https://github.com/facebook/react)
- [`react-dom`](https://github.com/facebook/react)
- [`rxjs`](https://github.com/ReactiveX/rxjs)

## Definitions

- **Component**: An encapsulated part of a user interface that composes together with other parts to form an application.
- **Component state**: An object used for rendering a component with a specific collection of data values.
- **Event stream**: A collection of future events. Internally, Conduit utilizes the [RxJS `Subject` observable](http://reactivex.io/rxjs/manual/overview.html#subject).
- **Intent**: A function that interprets events according to what the user or system intended by causing the event. For example, the intent of clicking a button could be to increment a value.
- **Reducer**: A function that updates values based on intent. For example, the intent to increment a value could update the value immediately or under certain other conditions.
- **Selector**: A function that selects specific pieces of an external data set and transforms it into component state.
- **Stream**: A collection of future events or values, otherwise known as an observable.
- **Value stream**: A collection of future values. Internally, Conduit utilizes the [RxJS `BehaviorSubject` observable](http://reactivex.io/rxjs/manual/overview.html#behaviorsubject).

## UI Patterns

The following patterns demonstrate useful and recommended ways to structure application components. Powerful high-level patterns composed of simpler low-level patterns enable application complexity to grow organically. The various examples utilizes these patterns, so you can understand them in practice.

Pattern composition:  
*View Components > Eventful Components > Stateful Components*

The legend applies to all the following diagrams.

<img src="https://raw.githubusercontent.com/indiana-university/conduit/master/media/patterns/legend.svg?sanitize=true" alt="Legend">

### App pattern

At the most basic level, the application consists of State, Components, and Reducers. Components derive content and render based on value streams established in State. Components output an event stream of intentions based on what the user means by interacting with the interface. Reducers update State based on Components' intentions, while informed by State when necessary.

<img src="https://raw.githubusercontent.com/indiana-university/conduit/master/media/patterns/app.svg?sanitize=true" alt="App pattern">

### State pattern

State is a combination of value streams and streams derived from value streams. Any data that can be derived from more basic values should not be included as a value stream. For example, the number of items in an array is derived from the source array; the array should emit from a value stream, while the count should emit from a derived stream. Both value streams and derived streams are accessible to the rest of the application. 

<img src="https://raw.githubusercontent.com/indiana-university/conduit/master/media/patterns/state.svg?sanitize=true" alt="State pattern">

### View Component pattern

The View Component pattern is a [functional React component](https://facebook.github.io/react/docs/components-and-props.html#functional-and-class-components) with access to State. It renders content and doesn’t respond to user input. It should not affect State in any way. The component receives props by connecting to a Selector, which is a stream of values derived from selected parts of State. The component updates whenever the stream emits a value.

<img src="https://raw.githubusercontent.com/indiana-university/conduit/master/media/patterns/view-component.svg?sanitize=true" alt="View component pattern">

### Eventful Component pattern

The Eventful Component pattern is a View Component with user interaction. As the user interacts with the component, events are generated. Events are interpreted as intentions.  Reducers transform the intentions within the context of the current state into updates that produce the new state. The state updates are picked up by selectors, and the component is rerendered. The cycle continues with each interaction.

As an example, a user may click a button, which triggers an event. However, the intent of the click event may be to increment a counter. The reducer listens for intentions to increment the counter, not for click events. Finally, the reducer updates state with the new value of the counter, which triggers an update to the UI, completing the cycle.

<img src="https://raw.githubusercontent.com/indiana-university/conduit/master/media/patterns/eventful-component.svg?sanitize=true" alt="Eventful component pattern">

### Stateful Component pattern

The Stateful Component pattern is an Eventful Component that tracks its own state internally in addition to updates from the application state. User interaction with the component may cause updates to the internal state, the application state, or both. To update application state, a relevant subset of intent is exported from the component and integrated with the application reducer. The App pattern is essentially the topmost Stateful Component pattern.

<img src="https://raw.githubusercontent.com/indiana-university/conduit/master/media/patterns/stateful-component.svg?sanitize=true" alt="Stateful component pattern">

### Composite pattern

Components can be composited into any number of arrangements, with state and intent moving in and out of different levels of components as needed.

<img src="https://raw.githubusercontent.com/indiana-university/conduit/master/media/patterns/component-composite.svg?sanitize=true" alt="Composite component pattern">
