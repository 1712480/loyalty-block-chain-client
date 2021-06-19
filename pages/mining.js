import React, { useEffect, useState, useRef } from 'react';
import { get, isEqual } from 'lodash';
import { withRouter } from 'next/router'
import classNames from 'classnames';
import { toast } from 'react-toastify';

import Chain from '../entities/chain';
import Transaction from '../entities/transaction';
import socket from '../utilities/socket';
import { SOCKET_CLIENT_EVENT, WORKER_EVENT } from '../utilities/constants';

import css from '../styles/Mining.module.scss';
import useWallet from "../utilities/useWallet";

const Mining = ({ router }) => {
  const worker = useRef(null);
  const [credential] = useWallet({ redirectTo: 'login' });

  const [loaded, setLoaded] = useState(false);
  const [animationName, setAnimationName] = useState('');
  const [workerInstalled, setWorkerInstalled] = useState(false);

  const [pendingBlock, setPendingBlock] = useState(null);
  const [pendingTransactions, setPendingTransactions] = useState([]);

  const [enableVerify, setEnableVerify] = useState(false);
  const [enableMining, setEnableMining] = useState(false);

  useEffect(() => {
    socket.emit(SOCKET_CLIENT_EVENT.UPDATE_ALL);
    socket.on(SOCKET_CLIENT_EVENT.UPDATE_ALL, (data) => handleNewData(data));

    worker.current = new Worker(new URL('../utilities/mine.worker.js', import.meta.url))

    worker.current.onmessage = (event) => {
      const message = get(event, 'data[0]', '');
      const data = get(event, 'data[1]', {});

      if (message === WORKER_EVENT.MINE_SUCCEED) {
        setAnimationName(css.fadeOut);
        socket.emit(SOCKET_CLIENT_EVENT.REQUEST_VERIFY, { block: data });
        toast.success('Mined new block succeed, waiting for verification');
      }

      if (message === WORKER_EVENT.MINE_FAILED) {
        setAnimationName(css.fadeOut);
        toast.error('Transaction(s) invalid');
      }

      if (message === WORKER_EVENT.GREETINGS) {
        setWorkerInstalled(true);
      }
    };

    worker.current.onerror = (event) => {
      console.log({ workerError: event });
    };

    worker.current.postMessage([WORKER_EVENT.GREETINGS])

    return () => {
      worker.current.terminate();
    }
  }, []);

  const handleNewData = (data) => {
    const newChain = get(data, 'chain') || [];
    const newTransactions = get(data, 'transactions') || [];
    const newBlock = get(data, 'block') || null;

    Chain.setChain(newChain);
    setPendingTransactions(newTransactions);
    setPendingBlock(newBlock);

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
      console.log({initial: Chain.chain})
      if (Chain.isValidChain([...Chain.chain, pendingBlock])) {
        socket.emit(SOCKET_CLIENT_EVENT.VERIFIED, { block: pendingBlock });
        toast.success('Block verified as VALID');
      } else {
        toast.error('Block verified as INVALID');
      }
    }
  };

  useEffect(() => {
    if (pendingTransactions && !!pendingTransactions.length) {
      toast.dark('New transaction(s) available for mining.');
      setEnableMining(true);
    } else {
      setEnableMining(false);
    }
  }, [pendingTransactions]);

  const handleMining = () => {
    if (Chain.chain.length && pendingTransactions.length) {
      const rewardTransaction = new Transaction(null, credential.publicKey, 100);

      setAnimationName(css.fadeIn);
      worker.current.postMessage([WORKER_EVENT.START_MINING, {
        transactions: [...pendingTransactions, rewardTransaction],
        lastBlockHash: Chain.chain[Chain.chain.length - 1].hash
      }]);
    }
  };

  const goBack = () => router.push('/')

  return workerInstalled && loaded && credential.publicKey ? (
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
