import React from 'react';
import { createStore } from 'redux';
import { persistReducer } from 'redux-persist';

import { persistConfig, bindMiddleWare, rootReducer } from './reducer';

const __NEXT_REDUX_STORE__ = '__NEXT_REDUX_STORE__';

const initializeStore = (initialState) => {
  const persistedReducer = persistReducer(persistConfig, rootReducer);
  const store = createStore(persistedReducer, initialState, bindMiddleWare());

  if (module.hot) {
    module.hot.accept('./reducer', () => {
      store.replaceReducer(persistedReducer)
    })
  }

  return store;
};

const getOrCreateStore = (initialState) => {
  if (typeof window === 'undefined') {
    return initializeStore(initialState);
  }

  if (!window[__NEXT_REDUX_STORE__]) {
    window[__NEXT_REDUX_STORE__] = initializeStore(initialState);
  }

  return window[__NEXT_REDUX_STORE__];
}

const Wrapper = (App) => {
  return class AppWithRedux extends React.Component {
    static async getInitialProps(appContext) {
      const reduxStore = getOrCreateStore();
      let appProps = {};
      appContext.ctx.reduxStore = reduxStore;

      if (App.getInitialProps) {
        appProps = await App.getInitialProps(appContext);
      }

      return {
        ...appProps,
        initialReduxState: reduxStore.getState(),
      }
    }

    constructor(props) {
      super(props);
      this.reduxStore = getOrCreateStore(props.initialReduxState);
    }

    render() {
      return <App {...this.props} reduxStore={this.reduxStore} />;
    }
  };
};

export default Wrapper;
