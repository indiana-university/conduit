/**
 * Copyright (C) 2019 The Trustees of Indiana University
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { Component } from 'react'
import { audit, BehaviorSubject, bindCallback, filter, isObservable, of, tap } from 'rxjs'

const defaultArgs = 'props$,componentDidRender,componentWillUnmount'.split(',')

export function connect (WrappedComponent, source, ...args) {
  class Connect extends Component {
    constructor (props) {
      super(props)
      this.componentDidConstruct = false

      this.subscription = this.getState().pipe(
        // Synchronously set initial state, only once.
        tap((state) => {
          if (this.componentDidConstruct) {
            return
          }
          this.shouldUpdate = true
          this.state = state
        }),
        // For all subsequent state emissions, continue.
        filter(() => this.componentDidConstruct),
        // Request an animation frame.
        // If multiple state updates emit in the meantime,
        // retain only the last one.
        audit(bindCallback((x, callback) =>
          window.requestAnimationFrame(callback)
        ))
      )
      // Once the RAF callback is called, then render.
        .subscribe((state) => {
          this.shouldUpdate = true
          this.setState(state)
        })

      this.componentDidConstruct = true
    }

    getState () {
      if (isObservable(source)) {
        return source
      }
      if (typeof source === 'function') {
        const output = this.initLifecycle()
        if (isObservable(output)) {
          return output
        }
        return of(output)
      }
      return of({})
    }

    initLifecycle () {
      const params = (args.length ? args : defaultArgs)
        .slice(0, source.length)
        .map((name) => {
          if (name === 'props$') {
            return this.initLifecycleProps()
          }
          if (name === 'componentDidRender' || name === 'componentWillUnmount') {
            return this.initLifecycleConstructor(name)
          }
          return null
        })
      return source(...params)
    }

    initLifecycleProps () {
      this.props$ = new BehaviorSubject(this.props)
      return this.props$
    }

    initLifecycleConstructor (name) {
      const [add, call, clear] = useCallbackStack()
      this[`${name}Call`] = call
      this[`${name}Clear`] = clear
      return add
    }

    componentDidMount () {
      this.componentDidRender()
    }

    UNSAFE_componentWillReceiveProps (nextProps) {
      if (isObservable(this.props$)) {
        this.props$.next?.(nextProps)
      }
    }

    shouldComponentUpdate () {
      // Ignore all attempts to update unless component state$ has emitted.
      const { shouldUpdate } = this
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
      if (this.componentDidRenderCall) {
        this.componentDidRenderCall()
      }
    }

    componentWillUnmount () {
      if (this.componentDidRenderClear) {
        this.componentDidRenderClear()
      }
      if (this.componentWillUnmountCall) {
        this.componentWillUnmountCall()
      }
      this.subscription.unsubscribe()
    }
  }
  Connect.displayName = `Connect(${getDisplayName(WrappedComponent)})`
  return Connect
}

function useCallbackStack () {
  let stack = []
  const add = (value) => {
    if (typeof value === 'function') {
      stack.push(value)
    }
  }
  const clear = () => {
    stack = []
  }
  const call = () => {
    stack.forEach((callback) => callback())
    clear()
  }
  return [add, call, clear]
}

function getDisplayName (WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}
