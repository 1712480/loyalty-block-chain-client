import crypto from 'crypto';

class Block {
  constructor(prevHash, hash, transactions, timeStamp, nonce) {
    this.hash = hash;
    this.nonce = nonce;
    this.prevHash = prevHash;
    this.timeStamp = timeStamp;
    this.transactions = transactions;
  }
}

export const hashBlock = (prevHash, transactions, nonce) => {
  const hashData = prevHash + JSON.stringify(transactions) + nonce;
  const hash = crypto.createHash('SHA256');

  hash.update(hashData).end();
  return hash.digest('hex');
}

export default Block;
