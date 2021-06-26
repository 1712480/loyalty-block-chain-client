import crypto from 'crypto';
import Transaction from './transaction';

class Chain {
  static genesisNonce = 123456789;
  static genesisHash = 'genesis-block';
  static genesisPrevHash = 'genesis-block-prev-hash';

  constructor() {
    this.chain = [];
  }

  isValidChain(chain, difficulty) {
    if (!chain.length) {
      return false;
    }

    const genesisBlock = chain[0];

    if (
      genesisBlock.nonce !== Chain.genesisNonce
      || genesisBlock.hash !== Chain.genesisHash
      || genesisBlock.prevHash !== Chain.genesisPrevHash
    ) {
      return false;
    }

    for (let i = 1; i < chain.length; i++) {
      const currentBlock = chain[i];

      // TODO: find other way to by pass system reward
      if (currentBlock.hash.length !== difficulty) {
        const prevBlock = chain[i - 1];
        const blockHash = hashBlock(currentBlock.prevHash, currentBlock.transactions, currentBlock.nonce);

        currentBlock.transactions.forEach(transaction => {
          if (!Transaction.isValid(transaction, chain)) {
            console.log('invalid transaction');
            return false;
          }
        });

        if (
          blockHash.substr(0, difficulty) !== Array(difficulty + 1).join('0')
          || blockHash !== currentBlock.hash
          || currentBlock.prevHash !== prevBlock.hash
        ) {
          return false;
        }
      }
    }

    return true;
  };

  getAllTransactionForAddress (publicKey, chain) {
    const txs = [];

    if (publicKey && chain.length) {
      for (let block of chain) {
        for (let tx of block.transactions) {
          if (tx.toAddress === publicKey || tx.fromAddress === publicKey) txs.push(tx);
        }
      }
    }

    return txs;
  };

  getBalanceOfAddress(publicKey, chain) {
    let balance = 0;

    if (!!chain.length && publicKey) {
      for (let block of chain) {
        for (let tx of block.transactions) {
          if (tx.toAddress === publicKey) balance += tx.amount;
          if (tx.fromAddress === publicKey) balance -= tx.amount;
        }
      }
    }

    return balance;
  };
}

const hashBlock = (prevHash, transactions, nonce) => {
  const hashData = prevHash + JSON.stringify(transactions) + nonce;
  const hash = crypto.createHash('SHA256');

  hash.update(hashData).end();
  return hash.digest('hex');
}

export default new Chain();
