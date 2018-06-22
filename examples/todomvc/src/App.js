import Router from 'router'
import { combineLatest, merge } from 'rxjs'
import { filter, map, mapTo, shareReplay, switchMap, tap, withLatestFrom } from 'rxjs/operators'
import { createHandlers, createStreams, run } from 'conduit-rxjs'
import { connect } from 'conduit-rxjs-react'
import { distinctAndShare, pluralize, uuid } from './util'

const KEY_ENTER = 13
const KEY_ESCAPE = 27

const LOCAL_STORAGE_KEY = 'todos-conduit'

const ROUTE_ALL = '/'
const ROUTE_ACTIVE = '/active'
const ROUTE_COMPLETED = '/completed'

export function App () {
  const values = createValues()
  createRouter(values)
  const state = createState(values)
  const events = createEvents()
  const intent = createIntent(events)
  const reducers$ = createReducers(intent, values)
  const selector = createSelector(state, events)
  // `props$` is not needed within this component, but the other
  // lifecycle methods are needed. So, declare them as strings
  // as the last arguments of `connect`.
  const component = connect(render, selector, 'componentDidRender', 'componentWillUnmount')
  const subscription = run(values, reducers$)
  return { component, subscription }
}

function createValues () {
  return createStreams({
    // Store the current route, so the app can adapt for different views.
    currentRoute: ROUTE_ALL,
    // The id represents the one todo that is currently being edited.
    // If null, no item is being edited.
    editTodoId: null,
    // Initialize with data from localStorage, if found.
    // According to the spec, only todos should be persistently saved,
    // but the other values could be as well.
    todos: JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY)) || []
  })
}

function createRouter (values) {
  // Handlers are probably the simpliest way to integrate with non-stream-based libraries.
  const handlers = createHandlers(values)
  // This is just a fancy way to define routes while keeping it DRY.
  // It could also be written as:
  //
  // const routes = {
  //   '/': () => handlers.currentRoute('/'),
  //   '/active': () => handlers.currentRoute('/active'),
  //   '/completed': () => handlers.currentRoute('/completed'),
  // }
  const routes = [ ROUTE_ALL, ROUTE_ACTIVE, ROUTE_COMPLETED ]
    .reduce((prev, route) => ({ ...prev, [route]: () => handlers.currentRoute(route) }), {})
  // Initialize the router, defaulting to the All route.
  // `router` could be returned from this function
  // if it would be needed to be referenced elsewhere.
  const router = Router(routes)
  router.init(ROUTE_ALL)
}

function createState (values) {
  // New data can derive from source data.
  const count$ = values.todos$.pipe(
    map((todos) => todos.length),
    // Use a custom operator to refactor repetitive operations.
    // This custom operator ensures that the count will emit
    // only when the count changes (using `distinctUntilChanged()`),
    // and that it is calculated only once (using `shareReplay()`).
    // Otherwise, count would emit whenever todos change,
    // even if the count would be identical.
    distinctAndShare()
  )
  // New data can also derive from other derived data.
  const hasTodos$ = count$.pipe(
    map((count) => count > 0),
    distinctAndShare()
  )
  const activeTodos$ = values.todos$.pipe(
    map((todos) =>
      todos
        .filter(({ completed }) => !completed)
    ),
    distinctAndShare()
  )
  const activeCount$ = activeTodos$.pipe(
    map((todos) => todos.length),
    distinctAndShare()
  )
  const hasActiveTodos$ = activeCount$.pipe(
    map((count) => count > 0),
    distinctAndShare()
  )
  const completedTodos$ = values.todos$.pipe(
    map((todos) =>
      todos
        .filter(({ completed }) => completed)
    ),
    distinctAndShare()
  )
  const completedCount$ = completedTodos$.pipe(
    map((todos) => todos.length),
    distinctAndShare()
  )
  const hasCompletedTodos$ = completedCount$.pipe(
    map((count) => count > 0),
    distinctAndShare()
  )
  // Pair routes with different collections of todos.
  const todoRoutes = {
    [ROUTE_ALL]: values.todos$,
    [ROUTE_ACTIVE]: activeTodos$,
    [ROUTE_COMPLETED]: completedTodos$
  }
  const filteredTodos$ = values.currentRoute$.pipe(
    // Emit the todos from different streams, depending on the current route.
    switchMap((route) => todoRoutes[route]),
    distinctAndShare()
  )
  return {
    ...values,
    count$,
    hasTodos$,
    activeCount$,
    hasActiveTodos$,
    completedCount$,
    hasCompletedTodos$,
    filteredTodos$
  }
}

function createEvents () {
  // Events are named similar to the event type,
  // rather than what the event is meant to do.
  // This is because a single event could be interpreted in many ways.
  // Use `createIntent()` to declare the meaning of these events.
  return createStreams([
    'blurEditTodo',
    'changeCheckTodo',
    'changeToggleAllTodos',
    'clickClearCompletedTodos',
    'clickRemoveTodo',
    'doubleClickTodo',
    'keyDownEditTodo',
    'keyDownNewTodo'
  ])
}

function createIntent (events) {
  const addTodo$ = events.keyDownNewTodo$.pipe(
    filter((event) => event.keyCode === KEY_ENTER),
    map((event) => event.target),
    map((target) => ({ target, value: target.value.trim() })),
    filter(({ value }) => value.length),
    // Reset the value of the input field as a side effect.
    // This could have been handled as a controlled input,
    // but that would involve more state management.
    tap(({ target }) => { target.value = '' }),
    map(({ value }) => value)
  )
  const cancelEditTodo$ = events.keyDownEditTodo$.pipe(
    filter((event) => event.keyCode === KEY_ESCAPE),
    map(({ target }) => target),
    // In more complicated situations, it may be better to get
    // the original todo object from state. But since canceling
    // the todo just restores a single string value, it is simplier
    // to just retrieve it through a data attribute.
    tap((target) => { target.value = target.dataset.title })
  )
  const clearCompletedTodos$ = events.clickClearCompletedTodos$.pipe(
    // The event object is no longer needed,
    // so it is replaced with `null`.
    mapTo(null)
  )
  const completeTodo$ = events.changeCheckTodo$.pipe(
    map((event) => event.target),
    map((target) => ({ completed: target.checked, id: target.dataset.id }))
  )
  const editTodo$ = events.doubleClickTodo$.pipe(
    map((event) => event.target.dataset.id)
  )
  const removeTodoByClick$ = events.clickRemoveTodo$.pipe(
    map((event) => event.target.dataset.id)
  )
  const toggleTodos$ = events.changeToggleAllTodos$.pipe(
    map((event) => event.target.checked)
  )
  const updateTodoByEnter$ = events.keyDownEditTodo$.pipe(
    filter((event) => event.keyCode === KEY_ENTER)
  )
  const updateTodo$ = merge(updateTodoByEnter$, events.blurEditTodo$).pipe(
    map((event) => event.target),
    map((target) => ({ id: target.dataset.id, target, title: target.value.trim() })),
    shareReplay(1)
  )
  const removeTodoByUpdate$ = updateTodo$.pipe(
    filter(({ title }) => !title.length),
    map(({ id }) => id)
  )
  const removeTodo$ = merge(removeTodoByClick$, removeTodoByUpdate$)
  const saveTodo$ = updateTodo$.pipe(
    filter(({ title }) => title.length),
    // If the title is trimmed, set this cleaned up value back on the input.
    tap(({ target, title }) => { target.value = title })
  )
  return {
    addTodo$,
    cancelEditTodo$,
    clearCompletedTodos$,
    completeTodo$,
    editTodo$,
    removeTodo$,
    saveTodo$,
    toggleTodos$
  }
}

function createReducers (intent, values) {
  const addTodo$ = intent.addTodo$.pipe(
    map((title) => ({ id: uuid(), title, completed: false })),
    withLatestFrom(values.todos$),
    map(([ todo, todos ]) => ([ ...todos, todo ]))
  )
  const clearCompletedTodos$ = intent.clearCompletedTodos$.pipe(
    withLatestFrom(values.todos$),
    map(([ clear, todos ]) =>
      todos
        .filter(({ completed }) => !completed)
    )
  )
  const completeTodo$ = intent.completeTodo$.pipe(
    withLatestFrom(values.todos$),
    map(([ { id, completed }, todos ]) =>
      todos
        .map((todo) => todo.id === id ? { ...todo, completed } : todo)
    )
  )
  const removeTodo$ = intent.removeTodo$.pipe(
    withLatestFrom(values.todos$),
    map(([ id, todos ]) =>
      todos
        .filter((todo) => todo.id !== id)
    )
  )
  const saveTodo$ = intent.saveTodo$.pipe(
    withLatestFrom(values.todos$),
    map(([ { id, title }, todos ]) =>
      todos
        .map((todo) => todo.id === id ? { ...todo, title } : todo)
    )
  )
  const toggleTodos$ = intent.toggleTodos$.pipe(
    withLatestFrom(values.todos$),
    map(([ completed, todos ]) =>
      todos
        .map((todo) => ({ ...todo, completed }))
    ),
    shareReplay(1)
  )
  const clearEditTodoId$ = merge(saveTodo$, intent.cancelEditTodo$).pipe(
    mapTo(null)
  )
  const editTodoId$ = merge(clearEditTodoId$, intent.editTodo$).pipe(
    map((editTodoId) => ({ editTodoId }))
  )
  const todos$ = merge(
    addTodo$,
    clearCompletedTodos$,
    completeTodo$,
    removeTodo$,
    saveTodo$,
    toggleTodos$
  ).pipe(
    // Whenever todos update, save it to localStorage.
    // localStorage cannot store arrays, so convert it to a string.
    tap((todos) => window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos))),
    map((todos) => ({ todos }))
  )
  return merge(editTodoId$, todos$)
}

function createSelector (state, events) {
  const handlers = createHandlers(events)
  // There's a lot of repetition here that could be refactored.
  //
  // But, this could also be coded differently, with a heavier
  // `map` operation within `combineLatest`.
  //
  // const state$ = combineLatest(
  //   state.currentRoute$,
  //   state.editTodo,
  //   ...
  // ).pipe(
  //   map(([ currentRoute, editTodo, ... ]) =>
  //     ({ handlers, currentRoute, editTodo, ... })
  //   )
  // )
  //
  // But by splitting it up like this when the selector pulls
  // together a lot of streams, it makes the code collectively
  // easier to read and manage.
  const currentRoute$ = state.currentRoute$.pipe(
    map((currentRoute) => ({ currentRoute }))
  )
  const editTodoId$ = state.editTodoId$.pipe(
    map((editTodoId) => ({ editTodoId }))
  )
  const todos$ = state.filteredTodos$.pipe(
    map((todos) => ({ todos }))
  )
  const count$ = state.count$.pipe(
    map((count) => ({ count }))
  )
  const hasTodos$ = state.hasTodos$.pipe(
    map((hasTodos) => ({ hasTodos }))
  )
  const hasActiveTodos$ = state.hasActiveTodos$.pipe(
    map((hasActiveTodos) => ({ hasActiveTodos }))
  )
  const hasCompletedTodos$ = state.hasCompletedTodos$.pipe(
    map((hasCompletedTodos) => ({ hasCompletedTodos }))
  )
  const state$ = combineLatest(
    currentRoute$,
    editTodoId$,
    todos$,
    count$,
    hasTodos$,
    hasActiveTodos$,
    hasCompletedTodos$
  ).pipe(
    map((source) =>
      source
        .reduce((prev, curr) => ({ ...prev, ...curr }), { handlers })
    )
  )
  // Return a function that will be called on mount.
  // `props$` is not needed, but the other lifecycle methods are needed.
  return (componentDidRender, componentWillUnmount) => {
    // Whenever a todo is to be edited, put focus on its input after it is rendered.
    const focusSubscription = state.editTodoId$.pipe(
      filter((id) => id)
    ).subscribe((id) =>
      componentDidRender(() =>
        document.getElementById(`edit-${id}`).focus()
      )
    )
    // Clean up the focus subscription when the component unmounts.
    componentWillUnmount(() => focusSubscription.unsubscribe())
    return state$
  }
}

function render (props) {
  const { handlers, hasTodos } = props
  return (
    <section className='todoapp'>
      <header className='header'>
        <h1>todos</h1>
        <input
          autofocus
          className='new-todo'
          onKeyDown={handlers.keyDownNewTodo}
          placeholder='What needs to be done?' />
      </header>
      {hasTodos && renderMain(props)}
      {hasTodos && renderFooter(props)}
    </section>
  )
}

function renderMain (props) {
  const { handlers, hasActiveTodos, todos } = props
  return (
    <section className='main'>
      <input
        checked={!hasActiveTodos}
        className='toggle-all'
        id='toggle-all'
        onChange={handlers.changeToggleAllTodos}
        type='checkbox' />
      <label for='toggle-all'>Mark all as complete</label>
      <ul className='todo-list'>
        {todos.map((item) => renderTodo(item, props))}
      </ul>
    </section>
  )
}

function renderTodo (item, props) {
  const { id, completed, title } = item
  const { handlers, editTodoId } = props
  const isEditing = id === editTodoId
  const className = [
    completed ? 'completed' : null,
    isEditing ? 'editing' : null
  ]
    .filter((v) => v)
    .join(' ')
  // The handlers could have been implemented differently:
  //
  // <input
  //   checked={completed}
  //   className='toggle'
  //   onChange={(event) => handlers.changeCheckTodo({ event, id })}
  //   type='checkbox' />
  //
  // But the following implementation eliminated the need to wrap the event
  // inside an object, inside another function. Instead, the `id` is just
  // referenced within the event object itself through `event.target.dataset.id`.
  return (
    <li
      className={className}
      key={id}>
      <div className='view'>
        <input
          checked={completed}
          className='toggle'
          data-id={id}
          onChange={handlers.changeCheckTodo}
          type='checkbox' />
        <label
          data-id={id}
          onDoubleClick={handlers.doubleClickTodo}>
          {title}
        </label>
        <button
          aria-label={`Remove todo: ${title}`}
          className='destroy'
          data-id={id}
          onClick={handlers.clickRemoveTodo} />
      </div>
      <input
        className='edit'
        data-id={id}
        data-title={title}
        defaultValue={title}
        id={`edit-${id}`}
        onBlur={handlers.blurEditTodo}
        onKeyDown={handlers.keyDownEditTodo} />
    </li>
  )
}

const filters = [
  [ ROUTE_ALL, 'All' ],
  [ ROUTE_ACTIVE, 'Active' ],
  [ ROUTE_COMPLETED, 'Completed' ]
]
  .map(([ route, label ]) => ({ label, route }))

function renderFooter (props) {
  const { handlers, count, hasCompletedTodos } = props
  return (
    <footer className='footer'>
      <span className='todo-count'>
        <strong>{count}</strong> {pluralize(count, 'item')} left
      </span>
      <ul className='filters'>
        {filters.map((item) => renderFilter(item, props))}
      </ul>
      {hasCompletedTodos &&
        <button
          className='clear-completed'
          onClick={handlers.clickClearCompletedTodos}>
          Clear completed
        </button>
      }
    </footer>
  )
}

function renderFilter (item, props) {
  const { label, route } = item
  const { currentRoute } = props
  const isSelected = route === currentRoute
  return (
    <li key={route}>
      <a
        className={isSelected ? 'selected' : null}
        href={`#${route}`}>
        {label}
      </a>
    </li>
  )
}
