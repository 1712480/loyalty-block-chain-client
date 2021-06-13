import { createHash } from 'crypto';
import { ec as EC } from 'elliptic';

import Chain from './Chain';

class Transaction {
  public amount: number;
  public timestamp: number;
  public toAddress: string;
  public fromAddress: string;
  public signature: string;
  static ec = new EC('secp256k1');


  constructor(fromAddress: string, toAddress: string, amount: number) {
    this.amount = amount;
    this.toAddress = toAddress;
    this.timestamp = Date.now();
    this.fromAddress = fromAddress;
  };

  static calculateHash(transaction: Transaction) {
    return createHash('SHA256')
      .update(transaction.fromAddress + transaction.toAddress + transaction.amount + transaction.timestamp)
      .digest('hex');
  };

  static signTransaction(transaction: Transaction, privateKey: string) {
    const hashTx = Transaction.calculateHash(transaction);
    const keyPair = this.ec.keyFromPrivate(privateKey, 'hex');
    const signature = keyPair.sign(hashTx, 'base64');
    transaction.signature = signature.toDER('hex');
  };

  static isValid(transaction: Transaction) {
    // This is a reward transaction
    if (transaction.fromAddress === null) return true;

    const senderBalance = Chain.getBalanceOfAddress(transaction.fromAddress);
    if (senderBalance < transaction.amount || transaction.fromAddress === transaction.toAddress) return false;

    const keypair = this.ec.keyFromPublic(transaction.fromAddress, 'hex');
    return keypair.verify(this.calculateHash(transaction), transaction.signature);
  };
}

export default Transaction;
