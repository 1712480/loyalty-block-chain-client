import React, { useEffect, useState, useRef } from 'react';
import { get } from 'lodash';
import { withRouter } from 'next/router'
import classNames from 'classnames';
import { toast } from 'react-toastify';
import PuffLoader from 'react-spinners/PuffLoader';

import Chain from '../entities/Chain';
import Transaction from '../entities/Transaction';
import socket from '../utilities/socket';
import { SOCKET_CLIENT_EVENT, WORKER_EVENT } from '../utilities/constants';

import css from '../styles/Mining.module.scss';
import useWallet from "../utilities/useWallet";

const Mining = ({ router }) => {
  const worker = useRef(null);
  const credential = useWallet({ redirectTo: 'login' });

  const [loaded, setLoaded] = useState(false);
  const [animationName, setAnimationName] = useState('');

  const [pendingBlock, setPendingBlock] = useState(null);
  const [pendingTransactions, setPendingTransactions] = useState([]);

  const [enableVerify, setEnableVerify] = useState(false);
  const [enableMining, setEnableMining] = useState(false);

  useEffect(() => {
    worker.current = new Worker(new URL('../utilities/mine.worker.js', import.meta.url))

    worker.current.onmessage = (event) => {
      const message = get(event, 'data[0]', '');
      const data = get(event, 'data[1]', {});

      if (message === WORKER_EVENT.MINE_SUCCEED) {
        setAnimationName(css.fadeOut);
        socket.emit(SOCKET_CLIENT_EVENT.REQUEST_VERIFY, data);
        toast.success('Mined new block succeed, waiting for verification');
      }

      if (message === WORKER_EVENT.MINE_FAILED) {
        setAnimationName(css.fadeOut);
        toast.error('Transaction(s) invalid');
      }
    };

    worker.current.onerror = (event) => {
      console.log({ workerError: event });
    };

    worker.current.postMessage('hello')

    return () => {
      worker.current.terminate();
    }
  }, []);

  useEffect(() => {
    if (credential) {
      socket.emit(SOCKET_CLIENT_EVENT.UPDATE_ALL);
      socket.on(SOCKET_CLIENT_EVENT.UPDATE_ALL, (data) => handleNewChain(data));


    }
  }, [credential]);

  const handleNewChain = ({ chain }) => {
    Chain.setChain(chain);
    // setPendingBlock(block);
    // setPendingTransactions(transactions);

    if (!loaded) setLoaded(true);
  };

  useEffect(() => {
    if (pendingBlock) {
      toast.dark('Available a new block waiting to be verified.')
      setEnableVerify(true);
    } else {
      setEnableVerify(false);
    }
  }, [pendingBlock]);

  const handleVerifyBlock = () => {
    if (pendingBlock) {
      if (Chain.isValidChain([...Chain.instance, pendingBlock])) {
        socket.emit(SOCKET_CLIENT_EVENT.VERIFIED, { newBlock: pendingBlock });
        toast.success('Block verified as VALID');
      } else {
        toast.error('Block verified as INVALID');
      }
    }
  };

  useEffect(() => {
    if (!!pendingTransactions.length) {
      toast.dark('New transaction(s) available for mining.');
      setEnableMining(true);
    } else {
      setEnableMining(false);
    }
  }, [pendingTransactions]);

  const handleMining = () => {
    if (Chain.instance.length && pendingTransactions.length) {
      const rewardTransaction = new Transaction(null, params.publicKey, 100);

      setAnimationName(css.fadeIn);
      worker.current.postMessage([WORKER_EVENT.START_MINING, {
        transactions: [...pendingTransactions, rewardTransaction],
        lastBlockHash: Chain.instance[Chain.instance.length - 1].hash
      }]);
    }
  };

  const goBack = () => router.push('/')

  return loaded ? (
    <div className={css.container}>
      <h1>Mining</h1>

      <div className={classNames(css.overlay, animationName)}>
        {/*<HashLoader css={emotionCss`size: 50; color: 'white'`}/>*/}
        Hashing
      </div>

      <button
        type="button"
        disabled={!enableVerify}
        onClick={handleVerifyBlock}
        className={classNames(css.button, css.buttonDimension)}
      >
        Verify mined block
      </button>

      <button
        type="button"
        onClick={handleMining}
        disabled={!enableMining}
        className={classNames(css.button, css.buttonDimension)}
      >
        Mine new block
      </button>

      <button
        type="button"
        onClick={goBack}
        className={classNames(css.button, css.buttonDimension)}
      >
        Go back to wallet
      </button>
    </div>
  ) : <p>Loading</p>;
};

export default withRouter(Mining);
