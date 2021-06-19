import { get } from 'lodash';
import crypto from 'crypto';

import { WORKER_EVENT } from './constants';

const difficulty = 4;

addEventListener('message', (event) => {
  const message = get(event, 'data[0]');
  const transactions = get(event,'data[1].transactions', []);
  const lastBlockHash = get(event, 'data[1].lastBlockHash', '');

  if (message === WORKER_EVENT.GREETINGS) {
    console.log('[Worker]: 👷 Proof of work worker installed');
    postMessage([WORKER_EVENT.GREETINGS]);
  }

  if (message === WORKER_EVENT.START_MINING) {
    console.log('[Worker]: 👷 Received start mining message.');

    try {
      const newBlock = mineNewBlock(transactions, lastBlockHash);
      postMessage([WORKER_EVENT.MINE_SUCCEED, newBlock]);
    } catch(error) {
      postMessage([WORKER_EVENT.MINE_FAILED, error]);
    }
  }
});

const mineNewBlock = (pendingTransaction, prevHash) => {
  let nonce = 0;

  while (true) {
    const hash = hashBlock(prevHash, pendingTransaction, nonce);

    if (hash.substr(0, difficulty) === Array(difficulty + 1).join('0')) {
      console.log(`[Worker]: ⛏️ mined succeed nonce: ${nonce}`);
      return ({
        prevHash,
        hash,
        transactions: pendingTransaction,
        timeStamp: Date.now(),
        nonce,
      })
    }

    nonce += 1;
  }

};

const hashBlock = (prevHash, transactions, nonce) => {
  const hashData = prevHash + JSON.stringify(transactions) + nonce;
  const hash = crypto.createHash('SHA256');

  hash.update(hashData).end();
  return hash.digest('hex');
}
