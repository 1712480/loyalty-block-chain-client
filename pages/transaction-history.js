import React, {useState, useEffect } from 'react';
import { withRouter } from 'next/router';
import classNames from 'classnames';
import { useSelector } from 'react-redux';

import Chain from '../entities/chain';
import useWallet from '../utilities/useWallet';
import useSocket from '../utilities/useSocket';
import css from '../styles/Transaction.module.scss';

const TransactionHistory = ({ router }) => {
  const wallet = useWallet();
  const { socketUpdateChain } = useSocket();
  const { chain } = useSelector(({ blockChain}) => blockChain);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socketUpdateChain();
  }, []);

  useEffect(() => {
    if (!connected && !!chain.length) {
      setConnected(true);
    }
  }, [chain, connected]);

  useEffect(() => {
    if (wallet && wallet.publicKey && connected) {
      const calculatedBalance = Chain.getBalanceOfAddress(wallet.publicKey, chain);
      setBalance(calculatedBalance);
      const allTransactions = Chain.getAllTransactionForAddress(wallet.publicKey, chain);
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
