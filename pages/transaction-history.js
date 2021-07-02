import React, {useState, useEffect } from 'react';
import { withRouter } from 'next/router';
import classNames from 'classnames';
import { saveAs } from 'file-saver';
import { useSelector } from 'react-redux';
import { Fade, Reveal } from 'react-awesome-reveal';
import SkewLoader from 'react-spinners/SkewLoader';
import { css as emotionCss } from '@emotion/react';
import { Modal, useModal, ModalTransition } from 'react-simple-hook-modal';

import Chain from '../entities/chain';
import useWallet from '../utilities/useWallet';
import useSocket from '../utilities/useSocket';
import { slideFromLeftAndFadeIn } from '../utilities/animation';
import { IMAGE_URL } from '../utilities/constants';
import css from '../styles/Transaction.module.scss';

const getDateFromTimestamp = (timeStamp) => {
  const date = new Date(timeStamp);
  return date.toLocaleDateString();
};

const getTimeFromTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
};

const TransactionHistory = ({ router }) => {
  const wallet = useWallet();
  const { socketUpdateChain } = useSocket();
  const { openModal, isModalOpen, closeModal } = useModal();
  const { balance } = useSelector(({ user }) => user);
  const { publicKey } = useSelector(({ user }) => user);
  const { resellers } = useSelector(({ config }) => config);
  const { chain } = useSelector(({ blockChain }) => blockChain);
  const [transactions, setTransactions] = useState([]);
  const [connected, setConnected] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [reseller, setReseller] = useState({ image: '' });

  useEffect(() => {
    if (resellers.length) {
      const foundReseller = resellers.find(({ publicKey: resellerKey }) => publicKey === resellerKey);

      foundReseller && setReseller(foundReseller);
    }

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

  const exportTransactionToFile = () => {
    const data = {};

    for (let i = 0; i < modalData.length; i++) {
      data[modalData[i][0]] = modalData[i][1];
    }

    const credentialFile = new Blob([JSON.stringify(data)], {
      type: 'text/plain;charset=utf-8',
    });

    saveAs(credentialFile, 'Transaction.txt');
  };

  const getResellerByPublicKey = (key) => {
    const found = resellers.find(({ publicKey }) => publicKey === key);
    return found || null;
  };

  const openModalWithTransaction = (transaction, resellerInfo = false) => {
    const { amount, fromAddress, index, timestamp, toAddress } = transaction;

    if (!fromAddress) {
      // Back-door transaction
      const systemReward = [
        ['Date (time)', `${getDateFromTimestamp(timestamp)} (${getTimeFromTimestamp(timestamp)})`],
        ['From', 'System'],
        ['Amount', amount],
        ['Block index', index]
      ];
      setModalData(systemReward);
      return openModal();
    }

    if (reseller.image) {
      // User is a reseller
      const { name, publicKey: resellerPublicKey } = reseller;
      const toReseller = resellerPublicKey === toAddress;

      const resellerTransaction = [
        ['Date (time)', `${getDateFromTimestamp(timestamp)} (${getTimeFromTimestamp(timestamp)})`],
        [toReseller ? 'From' : 'To', toReseller ? fromAddress : toAddress],
        ['Amount', amount],
        ['Block index', index]
      ];
      setModalData(resellerTransaction);
      return openModal();
    }

    if (resellerInfo) {
      // Transaction with reseller
      const { name, publicKey: resellerPublicKey } = resellerInfo;
      const toReseller = resellerPublicKey === toAddress;

      const resellerTransaction = [
        ['Date (time)', `${getDateFromTimestamp(timestamp)} (${getTimeFromTimestamp(timestamp)})`],
        [toReseller ? 'To' : 'From', name],
        ['Amount', amount],
        ['Block index', index]
      ];
      setModalData(resellerTransaction);
      return openModal();
    }

    const isTransfer = fromAddress === wallet.publicKey;
    const normalTransaction = [
      ['Date (time)', `${getDateFromTimestamp(timestamp)} (${getTimeFromTimestamp(timestamp)})`],
      [isTransfer ? 'To' : 'From', isTransfer ? toAddress : fromAddress],
      ['Amount', amount],
      ['Block index', index]
    ];
    setModalData(normalTransaction);
    openModal();
  };

  const goBack = () => router.push('/');

  const renderHistory =
    transactions.length ? transactions.map((transaction) => {
      const { toAddress, amount, timestamp, fromAddress } = transaction;
      const fromReseller = getResellerByPublicKey(fromAddress);
      const toReseller = getResellerByPublicKey(toAddress);
      const isTransfer = fromAddress === wallet.publicKey

      if (!fromAddress) {
        // Received from system back-door transaction
        return (
          <div
            key={toAddress}
            onClick={() => openModalWithTransaction(transaction)}
            className={classNames(css.transactionCard, css.reward)}
          >
            <img alt={`${fromAddress}-${toAddress}`} src={IMAGE_URL.REWARD}/>

            <div className={css.info}>
              <h3>Received {amount}</h3>
              <p>Date: {getDateFromTimestamp(timestamp)}</p>
            </div>
          </div>
        );
      }

      if (reseller.image) {
        // this user is a reseller
        return (
          <div
            key={toAddress}
            onClick={() => openModalWithTransaction(transaction, reseller)}
            className={classNames(css.transactionCard)}
          >
            <img alt={`${fromAddress}-${toAddress}`} src={reseller.image}/>

            <div className={css.info}>
              <h3>{isTransfer ? 'Transferred' : 'Received'} {amount}</h3>
              <p>Date: {getDateFromTimestamp(timestamp)}</p>
            </div>
          </div>
        );
      }

      if (isTransfer) {
        // Transfer to another account
        return (
          <div
            key={toAddress}
            className={classNames(css.transactionCard)}
            onClick={() => openModalWithTransaction(transaction, toReseller)}
          >
            <img alt={`${fromAddress}-${toAddress}`} src={toReseller ? toReseller.image : IMAGE_URL.USER} />

            <div className={css.info}>
              <h4>Transferred {amount}</h4>
              <p>Date: {getDateFromTimestamp(timestamp)}</p>
            </div>
          </div>
        )
      }

      // Received from another account
      return (
        <div
          key={toAddress}
          className={classNames(css.transactionCard)}
          onClick={() => openModalWithTransaction(transaction, fromReseller)}
        >
          <img alt={`${fromAddress}-${toAddress}`} src={fromReseller ? fromReseller.image : IMAGE_URL.USER}/>

          <div className={css.info}>
            <h4>Received {amount}</h4>
            <p>Date: {getDateFromTimestamp(timestamp)}</p>
          </div>
        </div>
      )
    }) : null;

  return connected ? (
    <Fade triggerOnce duration={500}>
      <div className={css.container}>
        <h1>Transaction history</h1>

        {reseller.image
          ? <img src={reseller.image} alt={reseller.name} className={css.resellerImage} />
          : <h4>Balance: {balance} after {transactions.length} transaction{transactions.length > 1 && 's'}</h4>
        }

        <Reveal keyframes={slideFromLeftAndFadeIn} duration={600} triggerOnce >
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

      <Modal
        id="transaction-modal"
        modalClassName={css.modalWrapper}
        isOpen={isModalOpen}
        transition={ModalTransition.SCALE}
        onBackdropClick={closeModal}
      >
        <div className={css.modal}>
          <h1>Transaction Info</h1>

          <div className={css.stats}>
            {modalData.length && modalData.map(data => (
              <>
                <p>{data[0]}</p>
                <p>{data[1]}</p>
              </>
            ))}
          </div>

          <div className={css.cta}>
            <button className={classNames(css.button, css.dimension)} onClick={exportTransactionToFile}>Export</button>
            <button className={classNames(css.button, css.dimension)} onClick={closeModal}>Close</button>
          </div>
        </div>
      </Modal>
    </Fade>
  ) : <SkewLoader css={emotionCss`size: 60; color: 'black'`} />;
}

export default withRouter(TransactionHistory);
