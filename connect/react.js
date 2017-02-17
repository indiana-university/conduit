import React from 'react';
import {Observable} from 'rxjs/Observable';
import {bindCallback} from 'rxjs/observable/bindCallback';
import {from} from 'rxjs/observable/from';
import {of} from 'rxjs/observable/of';
import {audit} from 'rxjs/operator/audit';
import {buffer} from 'rxjs/operator/buffer';
import {_do} from 'rxjs/operator/do';
import {filter} from 'rxjs/operator/filter';
import {mergeMap} from 'rxjs/operator/mergeMap';
import {observeOn} from 'rxjs/operator/observeOn';
import {animationFrame} from 'rxjs/scheduler/animationFrame';

import {bindNext} from '../lib/bindNotification';
import {createStreams} from '../lib/createStreams';
import {getParameterNames} from '../util/getParameterNames';

export function connect(WrappedComponent, source) {
  return class Connect extends React.Component {
    constructor(props) {
      super(props);
      this.componentDidConstruct = false;

      this.subscription = this.getState()
        // Synchronously set initial state, only once.
        ::_do(state => {
          if(this.componentDidConstruct) return;
          this.shouldUpdate = true;
          this.state = state;
        })
        // For all subsequent state emissions, continue.
        ::filter(() => this.componentDidConstruct)
        // Request an animation frame.
        // If multiple state updates emit in the meantime,
        // retain only the last one.
        ::audit(requestAnimationFrameCallback)
        // Once the RAF callback is called, then render.
        .subscribe(state => {
          this.shouldUpdate = true;
          this.setState(state);
        });

      this.componentDidConstruct = true;
    }
    getState() {
      if(source instanceof Observable)
        return source;
      if(typeof source === 'function') {
        const output = this.initLifecycle();
        if(output instanceof Observable)
          return output;
        return of(output);
      }
      return of({});
    }
    initLifecycle() {
      this.lifecycle = {};
      const params = getParameterNames(source)
        .map(name => {
          if(name === 'props$')
            return this.initLifecycleProps();
          if(name === 'componentDidRender' || name === 'componentWillUnmount')
            return this.initLifecycleConstructor(name);
          return null;
        });
      return source(...params);
    }
    initLifecycleProps() {
      this.lifecycle = {
        ...this.lifecycle,
        ...createStreams({ props: this.props })
      };
      return this.lifecycle.props$;
    }
    initLifecycleConstructor(name) {
      const lifecycle = createStreams([
        name,
        `${name}Callback`
      ]);
      this[`${name}Subscription`] = createCallbackBuffer(
        lifecycle[`${name}$`],
        lifecycle[`${name}Callback$`]
      );
      this.lifecycle = {
        ...this.lifecycle,
        ...lifecycle
      };
      return bindNext(this.lifecycle[`${name}$`], name);
    }
    componentDidMount() {
      this.componentDidRender();
    }
    componentWillReceiveProps(nextProps) {
      if(this.lifecycle && this.lifecycle.props$)
        this.lifecycle.props$.next(nextProps);
    }
    shouldComponentUpdate() {
      // Ignore all attempts to update unless component state$ has emitted.
      const {shouldUpdate} = this;
      this.shouldUpdate = false;
      return shouldUpdate;
    }
    render() {
      return (
        <WrappedComponent {...this.state} />
      )
    }
    componentDidUpdate() {
      this.componentDidRender();
    }
    componentDidRender() {
      if(this.lifecycle && this.lifecycle.componentDidRenderCallback$)
        this.lifecycle.componentDidRenderCallback$.next();
    }
    componentWillUnmount() {
      if(this.componentDidRenderSubscription)
        this.componentDidRenderSubscription.unsubscribe();
      if(this.lifecycle && this.lifecycle.componentWillUnmountCallback$)
        this.lifecycle.componentWillUnmountCallback$.next();
      if(this.componentWillUnmountSubscription)
        this.componentWillUnmountSubscription.unsubscribe();
      this.subscription.unsubscribe();
    }
  }
}

const requestAnimationFrameCallback = bindCallback(
  (x, callback) => window.requestAnimationFrame(callback)
);

function createCallbackBuffer(source$, callback$) {
  return source$
    // Grab all source emissions
    // between the end of last callback and the end of this callback.
    ::buffer(callback$)
    // Convert the array of functions into a stream of functions.
    ::mergeMap(callbacks => from(callbacks))
    // Execute each function during an animation frame, to avoid jank.
    ::observeOn(animationFrame)
    .subscribe(callback => callback());
}
