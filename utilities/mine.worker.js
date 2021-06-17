import { get } from 'lodash';
import Chain from '../entities/Chain';
import Block, { hashBlock } from '../entities/Block';
import { WORKER_EVENT } from './constants';

addEventListener('install', () => {
  console.log('[Worker]: 👷 Proof of work worker installed');
});

addEventListener('message', (event) => {
  const message = get(event, 'data[0]');
  const transactions = get(event,'data[1].transactions', []);
  const lastBlockHash = get(event, 'data[1].lastBlockHash', '');

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

    if (hash.substr(0, Chain.difficulty) === Array(Chain.difficulty + 1).join('0')) {
      console.log(`[Worker]: ⛏️ mined succeed nonce: ${nonce}`);
      return new Block(prevHash, hash, pendingTransaction, Date.now(), nonce);
    }

    nonce += 1;
  }

};

