import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage';
import { composeWithDevTools } from 'redux-devtools-extension';

import userReducer from './user/reducer';
import blockChainReducer from './blockChain/reducer';
import configReducer from './config/reducer';

export const rootReducer = combineReducers({
  user: userReducer,
  blockChain: blockChainReducer,
  config: configReducer
});

export const persistConfig = {
  key: 'root',
  storage
};

export const bindMiddleWare = () => {
  if (process.env.NODE_ENV !== 'production') {
    return composeWithDevTools();
  }
};
