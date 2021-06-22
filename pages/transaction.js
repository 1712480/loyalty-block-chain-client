import React, { useRef, useState, useEffect } from 'react';
import { get } from 'lodash';
import classNames from 'classnames';
import { toast } from 'react-toastify';
import socket from '../utilities/socket';
import { withRouter } from 'next/router';
import PuffLoader from 'react-spinners/PuffLoader';
import { css as emotionCss } from '@emotion/react';

import chain from '../entities/chain';
import useWallet from '../utilities/useWallet';
import transaction from '../entities/transaction';
import { SOCKET_CLIENT_EVENT } from '../utilities/constants';

import css from '../styles/Transaction.module.scss';

const Transaction = ({ router }) => {
  const amount = useRef(null);
  const [balance, setBalance] = useState(0);
  const [connected, setConnected] = useState(false);
  const receiverAddress = useRef(null);
  const [wallet] = useWallet({ redirectTo: 'login' });

  useEffect(() => {
    socket.emit(SOCKET_CLIENT_EVENT.UPDATE_ALL);
    socket.on(SOCKET_CLIENT_EVENT.UPDATE_ALL, (data) => {
      const newChain = get(data, 'chain') || [];
      chain.setChain(newChain);
      setConnected(true);
    });
  }, []);

  useEffect(() => {
    if (wallet && wallet.publicKey && connected) {
      setBalance(chain.getBalanceOfAddress(wallet.publicKey));
    }
  }, [connected]);

  const goBack = () => router.push('/');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!receiverAddress.current.value || !amount.current.value) return toast.error('Please provide all required data');
    if (receiverAddress.current.value === wallet.publicKey) return toast.error('Can not send to current wallet');
    if (Number(amount.current.value) >= balance) return toast.error('Amount must be <= balance');

    try {
      const data = {
        fromAddress: wallet.publicKey,
        toAddress: receiverAddress.current.value,
        amount: Number(amount.current.value),
        timestamp: Date.now()
      };
      const newTransaction = transaction.signTransaction(data, wallet.privateKey);
      socket.emit(SOCKET_CLIENT_EVENT.NEW_TRANSACTION, { transaction: newTransaction });

      toast.success('Created transaction');
      amount.current.value = '';
      receiverAddress.current.value = '';
    } catch(error) {
      toast.error('Error creating new transaction');
      console.log({ error });
    }
  };

  return connected ? (
    <div className={css.container}>
      <h1>Transaction</h1>
      <h4>Balance: {balance}</h4>

      <form onSubmit={handleSubmit}>
        <input className={classNames(css.input)} ref={amount} placeholder="Amount" type="number" />
        <input className={classNames(css.input)} ref={receiverAddress} placeholder="Receiver's address" />
        <button className={classNames(css.button, css.buttonDimension)} type="submit">Submit</button>
      </form>

      <button
        className={classNames(css.button, css.buttonDimension)}
        type="button"
        onClick={goBack}
      >
        Go back
      </button>
    </div>
  ) : <PuffLoader css={emotionCss`size: 60; color: 'black'`} />;
}

export default withRouter(Transaction);
