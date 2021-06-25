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
      const newList = [...state.pendingTransactions, action.payload];
      return {
        ...state,
        pendingTransactions: newList,
      }
    case UPDATE_ALL:
      const { block, chain, transactions } = action.payload;
      return { block, chain, pendingTransactions: transactions };
    default:
      return state;
  }
};

export default blockChainReducer;
