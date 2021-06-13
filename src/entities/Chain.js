import Block, { hashBlock } from './Block';

class Chain {
  static instance;
  static difficulty = 4;
  static genesisNonce = 123456789;
  static genesisHash = 'genesis-block';
  static genesisPrevHash = 'genesis-block-prev-hash';

  static setChain(chain: Block[]) {
    this.instance = chain;
  };

  static isValidChain(chain: Block[]) {
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
      const prevBlock = chain[i - 1];
      const blockHash = hashBlock(currentBlock.prevHash, currentBlock.transactions, currentBlock.nonce);

      return !(blockHash.substr(0, Chain.difficulty) !== Array(Chain.difficulty + 1).join('0')
        || blockHash !== currentBlock.hash
        || currentBlock.prevHash !== prevBlock.hash);
    }
  };

  static getAllTransactionForAddress (publicKey: string) {
    const txs = [];

    for (let block of this.instance) {
      for (let tx of block.transactions) {
        if (tx.toAddress === publicKey || tx.fromAddress === publicKey) txs.push(tx);
      }
    }

    return txs;
  };

  static getBalanceOfAddress(publicKey: string) {
    let balance = 0;

    for (let block of Chain.instance) {
      for (let tx of block.transactions) {
        if (tx.toAddress === publicKey) balance += tx.amount;
        if (tx.fromAddress === publicKey) balance -= tx.amount;
      }
    }

    return balance;
  };
}
