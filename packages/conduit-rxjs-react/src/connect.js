import { Component } from 'react'
import { Observable, bindCallback, from, of } from 'rxjs'
import { audit, buffer, filter, mergeMap, observeOn, tap } from 'rxjs/operators'
import { animationFrame } from 'rxjs/scheduler'
import { createHandlers, createStreams } from 'conduit-rxjs'

const defaultArgs = 'props$,componentDidRender,componentWillUnmount'.split(',')

export function connect (WrappedComponent, source, ...args) {
  class Connect extends Component {
    constructor (props) {
      super(props)
      this.componentDidConstruct = false

      this.subscription = this.getState().pipe(
        // Synchronously set initial state, only once.
        tap((state) => {
          if (this.componentDidConstruct) return
          this.shouldUpdate = true
          this.state = state
        }),
        // For all subsequent state emissions, continue.
        filter(() => this.componentDidConstruct),
        // Request an animation frame.
        // If multiple state updates emit in the meantime,
        // retain only the last one.
        audit(requestAnimationFrameCallback)
      )
      // Once the RAF callback is called, then render.
        .subscribe((state) => {
          this.shouldUpdate = true
          this.setState(state)
        })

      this.componentDidConstruct = true
    }
    getState () {
      if (source instanceof Observable) { return source }
      if (typeof source === 'function') {
        const output = this.initLifecycle()
        if (output instanceof Observable) { return output }
        return of(output)
      }
      return of({})
    }
    initLifecycle () {
      this.lifecycle = {}
      const params = (args.length ? args : defaultArgs)
        .slice(0, source.length)
        .map(name => {
          if (name === 'props$') { return this.initLifecycleProps() }
          if (name === 'componentDidRender' || name === 'componentWillUnmount') { return this.initLifecycleConstructor(name) }
          return null
        })
      return source(...params)
    }
    initLifecycleProps () {
      this.lifecycle = {
        ...this.lifecycle,
        ...createStreams({ props: this.props })
      }
      return this.lifecycle.props$
    }
    initLifecycleConstructor (name) {
      const lifecycle = createStreams([
        name,
        `${name}Callback`
      ])
      this[`${name}Subscription`] = createCallbackBuffer(
        lifecycle[`${name}$`],
        lifecycle[`${name}Callback$`]
      )
      this.lifecycle = {
        ...this.lifecycle,
        ...lifecycle
      }
      return createHandlers(this.lifecycle[`${name}$`])
    }
    componentDidMount () {
      this.componentDidRender()
    }
    componentWillReceiveProps (nextProps) {
      if (this.lifecycle && this.lifecycle.props$) { this.lifecycle.props$.next(nextProps) }
    }
    shouldComponentUpdate () {
      // Ignore all attempts to update unless component state$ has emitted.
      const {shouldUpdate} = this
      this.shouldUpdate = false
      return shouldUpdate
    }
    render () {
      return (
        <WrappedComponent {...this.state} />
      )
    }
    componentDidUpdate () {
      this.componentDidRender()
    }
    componentDidRender () {
      if (this.lifecycle && this.lifecycle.componentDidRenderCallback$) { this.lifecycle.componentDidRenderCallback$.next() }
    }
    componentWillUnmount () {
      if (this.componentDidRenderSubscription) { this.componentDidRenderSubscription.unsubscribe() }
      if (this.lifecycle && this.lifecycle.componentWillUnmountCallback$) { this.lifecycle.componentWillUnmountCallback$.next() }
      if (this.componentWillUnmountSubscription) { this.componentWillUnmountSubscription.unsubscribe() }
      this.subscription.unsubscribe()
    }
  }
  Connect.displayName = `Connect(${getDisplayName(WrappedComponent)})`
  return Connect
}

const requestAnimationFrameCallback = bindCallback(
  (x, callback) => window.requestAnimationFrame(callback)
)

function createCallbackBuffer (source$, callback$) {
  return source$.pipe(
    // Grab all source emissions
    // between the end of last callback and the end of this callback.
    buffer(callback$),
    // Convert the array of functions into a stream of functions.
    mergeMap(callbacks => from(callbacks)),
    // Execute each function during an animation frame, to avoid jank.
    observeOn(animationFrame)
  )
    .subscribe(callback => callback())
}

function getDisplayName (WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}
