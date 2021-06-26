import { UPDATE_BLOCK, UPDATE_CHAIN, UPDATE_TRANSACTION, UPDATE_ALL } from './action';

const initialState = {
  chain: [],
  block: {},
  pendingTransactions: [],
};

const blockChainReducer = (state = initialState, action) => {
  switch ((action.type)) {
    case UPDATE_BLOCK:
      return {
        ...state,
        block: action.payload,
      }
    case UPDATE_CHAIN:
      return {
        ...state,
        chain: action.payload,
      }
    case UPDATE_TRANSACTION:
      return {
        ...state,
        pendingTransactions: action.payload,
      }
    case UPDATE_ALL:
      return { ...action.payload };
    default:
      return state;
  }
};

export default blockChainReducer;
