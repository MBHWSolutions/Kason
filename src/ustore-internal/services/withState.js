import React from 'react'
import {UStoreProvider} from '@ustore/core'
import deepcopy from 'deepcopy'

export const withState = (WrappedComponent) => {
  class ConnectedComponent extends React.Component {

    render() {
      const preRender = WrappedComponent.preRender
      const state = UStoreProvider ? UStoreProvider.state.get() : {}
      const preRenderedState = preRender ? preRender(deepcopy(state)) : state
      return <WrappedComponent  { ...this.props} state={preRenderedState} customState={preRenderedState.customState}/>
    }
  }

  return ConnectedComponent
}

