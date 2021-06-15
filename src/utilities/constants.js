const HOST = {
  development: 'http://localhost:8080',
  production: 'https://loyalty-block-chain.herokuapp.com',
};

export const SERVER_ADDRESS = HOST[process.env.NODE_ENV];

export const SERVER_ENDPOINT = {
  CREATE_WALLET: 'wallet',
  NEW_TRANSACTION: 'transaction',
  AUTHENTICATE: 'wallet/authenticate-with-signed-public-key'
}

export const SOCKET_CLIENT_EVENT = {
  USER_DISCONNECTED: 'user-disconnected',
  NEW_TRANSACTION: 'new-transaction',
  UPDATE: 'update-data',
};

export const WORKER_EVENT = {
  START_MINING: 'START_MINING',
  MINE_SUCCEED: 'MINE_SUCCEED',
  MINE_FAILED: 'MINE_FAILED',
}

export const EMPTY = 'empty';
