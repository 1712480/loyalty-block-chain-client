export const UPDATE_CHAIN = 'UPDATE_CHAIN';
export const UPDATE_BLOCK = 'UPDATE_BLOCK';
export const UPDATE_TRANSACTION = 'UPDATE_TRANSACTIONS';
export const UPDATE_ALL = 'UPDATE_ALL';

export const newChain = (payload) => ({
  type: UPDATE_CHAIN,
  payload
});

export const newBlock = (payload) => ({
  type: UPDATE_BLOCK,
  payload
});

export const newTransaction = (payload) => ({
  type: UPDATE_TRANSACTION,
  payload
});

export const updateAll = (payload) => ({
  type: UPDATE_ALL,
  payload
});
