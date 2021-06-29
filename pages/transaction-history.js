import React, {useState, useEffect } from 'react';
import { withRouter } from 'next/router';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { Fade, Reveal } from 'react-awesome-reveal';
import SkewLoader from 'react-spinners/SkewLoader';
import { css as emotionCss } from '@emotion/react';

import Chain from '../entities/chain';
import useWallet from '../utilities/useWallet';
import useSocket from '../utilities/useSocket';
import { slideFromLeftAndFadeIn } from '../utilities/animation';
import { IMAGE_URL } from '../utilities/constants';
import css from '../styles/Transaction.module.scss';

const getDateFromTimestamp = (timeStamp) => {
  const date = new Date(timeStamp);
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
};

const TransactionHistory = ({ router }) => {
  const wallet = useWallet();
  const { socketUpdateChain } = useSocket();
  const { balance } = useSelector(({ user }) => user);
  const { chain } = useSelector(({ blockChain }) => blockChain);
  const { resellers } = useSelector(({ config }) => config);
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
      const allTransactions = Chain.getAllTransactionForAddress(wallet.publicKey, chain);
      setTransactions(allTransactions)
    }
  }, [connected]);

  const getResellerByPublicKey = (key) => {
    const foundReseller = resellers.find(({ publicKey }) => publicKey === key);
    return foundReseller || null;
  }

  const renderHistory =
    transactions.length ? transactions.map((transaction) => {
      if (!transaction.fromAddress) {
        return (
          <div key={transaction.toAddress} className={classNames(css.transactionCard, css.reward)}>
            <img alt={transaction.toAddress} src={IMAGE_URL.REWARD}/>

            <div className={css.info}>
              <div className={css.title}>
                <h4>Rewarded {transaction.amount}</h4>
                <p>from: The system</p>
              </div>

              <p>Date: {getDateFromTimestamp(transaction.timestamp)}</p>
            </div>
          </div>
        );
      }

      const reseller = getResellerByPublicKey(transaction.fromAddress);

      if (reseller) {
        const { name, image } = reseller;

        return (
          <div key={transaction.toAddress} className={classNames(css.transactionCard, css.reward)}>
            <img alt={transaction.fromAddress} src={image}/>

            <div className={css.info}>
              <div className={css.title}>
                <h4>Rewarded {transaction.amount}</h4>
                <p>from: {name}</p>
              </div>

              <p>Date: {getDateFromTimestamp(transaction.timestamp)}</p>

              <div className={css.cta}>
                <button className={classNames(css.button, css.dimension)}>Block location</button>
                <button className={classNames(css.button, css.dimension)}>Sender publicKey</button>
              </div>
            </div>
          </div>
        )
      }

      const isTransfer = transaction.fromAddress === wallet.publicKey;

      return (
        <div key={transaction.toAddress} className={classNames(css.transactionCard)}>
          <img alt={transaction.fromAddress} src={IMAGE_URL.USER}/>

          <div className={css.info}>
            <div className={css.title}>
              <h4>{isTransfer ? 'Transferred' : 'Received'} {transaction.amount}</h4>
              <p>{isTransfer ? 'to' : 'from'}: {transaction.toAddress}</p>
            </div>

            <p>Date: {getDateFromTimestamp(transaction.timestamp)}</p>

            <div className={css.cta}>
              <button className={classNames(css.button, css.dimension)}>Block location</button>
              <button className={classNames(css.button, css.dimension)}>Sender publicKey</button>
            </div>
          </div>
        </div>
      )
    }) : null;

  const goBack = () => router.push('/');

  return connected ? (
    <Fade triggerOnce duration={500}>
      <div className={css.container}>
        <h1>Transaction history</h1>
        <h4>Balance: {balance} after {transactions.length} transaction{transactions.length > 1 && 's'}</h4>

        <Reveal keyframes={slideFromLeftAndFadeIn} duration={600} delay={500} damping={0.3} cascade triggerOnce >
          {renderHistory}
        </Reveal>

        <button
          className={classNames(css.button, css.buttonDimension)}
          type="button"
          onClick={goBack}
        >
          Go back to wallet
        </button>
      </div>
    </Fade>
  ) : <SkewLoader css={emotionCss`size: 60; color: 'black'`} />;
}

export default withRouter(TransactionHistory);
