import React, {useState, useEffect } from 'react';
import { withRouter } from 'next/router';
import classNames from 'classnames';

import Chain from '../entities/chain';

import { SOCKET_CLIENT_EVENT } from '../utilities/constants';
import css from '../styles/Transaction.module.scss';
import socket from '../utilities/socket';
import useWallet from "../utilities/useWallet";

const TransactionHistory = ({ router }) => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [connected, setConnected] = useState(false);
  const [wallet] = useWallet({ redirectTo: 'login' });

  useEffect(() => {
    socket.emit(SOCKET_CLIENT_EVENT.UPDATE_ALL);
    socket.on(SOCKET_CLIENT_EVENT.UPDATE_ALL, ({ chain }) => {
      Chain.setChain(chain);
      setConnected(true);
    });
  }, []);

  useEffect(() => {
    if (wallet && wallet.publicKey && connected) {
      const calculatedBalance = Chain.getBalanceOfAddress(wallet.publicKey);
      setBalance(calculatedBalance);
      const allTransactions = Chain.getAllTransactionForAddress(wallet.publicKey);
      setTransactions(allTransactions)
    }
  }, [connected]);

  const renderHistory =
    transactions.length ? transactions.map((transaction) => {
      if (!transaction.fromAddress) return (
        <div key={transaction.toAddress} className={classNames(css.item, css.reward)}>
          <h4>Rewarded {transaction.amount}</h4>
          <p>From: system</p>
        </div>
      );

      const isTransfer = transaction.fromAddress === wallet.publicKey;
      const style = isTransfer ? css.transfer : css.receive

      return (
        <div key={transaction.toAddress} className={classNames(css.item, style)}>
          <h4>{isTransfer ? 'Transferred' : 'Received'} {transaction.amount}</h4>
          <p>{isTransfer ? 'to' : 'from'}: {transaction.toAddress}</p>
        </div>
      )
    }) : null;

  const goBack = () => router.push('/');

  return connected ? (
    <div className={css.container}>
      <h1>Transaction history</h1>
      <h4>Balance: {balance} after {transactions.length} transaction{transactions.length > 1 && 's'}</h4>

      <div className={css.history}>
        {renderHistory}
      </div>

      <button
        className={classNames(css.button, css.buttonDimension)}
        type="button"
        onClick={goBack}
      >
        Go back to wallet
      </button>
    </div>
  ) : <h1>Loading</h1>
}

export default withRouter(TransactionHistory);
