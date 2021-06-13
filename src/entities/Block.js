import crypto from 'crypto';

import Transaction from './Transaction';

class Block {
  public hash;
  public nonce;
  public prevHash;
  public timeStamp;
  public transactions;

  constructor(prevHash: string, hash: string, transactions: Transaction[], timeStamp: number, nonce: number) {
    this.hash = hash;
    this.nonce = nonce;
    this.prevHash = prevHash;
    this.timeStamp = timeStamp;
    this.transactions = transactions;
  }
}

export const hashBlock = (prevHash: string, transactions: Transaction[], nonce: number) => {
  const hashData = prevHash + JSON.stringify(transactions) + nonce;
  const hash = crypto.createHash('SHA256');

  hash.update(hashData).end();
  return hash.digest('hex');
}

export default Block;
