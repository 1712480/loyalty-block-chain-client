import React, { useRef, useState, useEffect } from 'react';
import classNames from 'classnames';
import { toast } from 'react-toastify';
import { withRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { Fade } from 'react-awesome-reveal';
import SkewLoader from 'react-spinners/SkewLoader';
import { css as emotionCss } from '@emotion/react';

import useWallet from '../utilities/useWallet';
import useSocket from '../utilities/useSocket';
import transaction from '../entities/transaction';

import css from '../styles/Transaction.module.scss';

const Transaction = ({ router }) => {
  const wallet = useWallet();
  const { balance } = useSelector(({ user }) => user);
  const { chain } = useSelector(({ blockChain }) => blockChain);
  const { resellers } = useSelector(({ config }) => config);
  const { socketUpdateChain, socketUpdateTransactions } = useSocket();
  const amount = useRef(null);
  const [connected, setConnected] = useState(false);
  const { publicKey } = useSelector(({ user }) => user);
  const [reseller, setReseller] = useState({ image: '' });
  const receiverAddress = useRef(null);

  useEffect(() => {
    if (!connected && !!chain.length) {
      setConnected(true);
    }
  }, [chain, connected]);

  useEffect(() => {
    socketUpdateChain();

    if (resellers.length) {
      const foundReseller = resellers.find(({ publicKey: resellerKey }) => publicKey === resellerKey);

      foundReseller && setReseller(foundReseller);
    }
  }, []);

  const goBack = () => router.push('/');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!receiverAddress.current.value || !amount.current.value)
      return toast.error('Please provide all required data');
    if (receiverAddress.current.value === wallet.publicKey)
      return toast.error('Can not send to current wallet');
    if (Number(amount.current.value) >= balance && !reseller.image)
      return toast.error('Amount must be <= balance');

    try {
      const data = {
        fromAddress: wallet.publicKey,
        toAddress: receiverAddress.current.value,
        amount: Number(amount.current.value),
        timestamp: Date.now()
      };
      const newTransaction = transaction.signTransaction(data, wallet.privateKey);
      socketUpdateTransactions({ transaction: newTransaction });

      toast.success('Created transaction');
      amount.current.value = '';
      receiverAddress.current.value = '';
    } catch(error) {
      toast.error('Error creating new transaction');
      console.log({ error });
    }
  };

  return connected ? (
    <Fade triggerOnce className={css.container}>
      <h1>Transaction</h1>
      {reseller.image
        ? <img src={reseller.image} alt={reseller.name} className={css.resellerImage} />
        : <h4>Balance: {balance}</h4>
      }

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
    </Fade>
  ) : <SkewLoader css={emotionCss`size: 60; color: 'black'`} />;
}

export default withRouter(Transaction);
