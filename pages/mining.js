import React, { useEffect, useState, useRef } from 'react';
import { get } from 'lodash';
import { withRouter } from 'next/router'
import classNames from 'classnames';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { Fade } from 'react-awesome-reveal';
import HashLoader from 'react-spinners/HashLoader';
import SkewLoader from 'react-spinners/SkewLoader';
import { css as emotionCss } from '@emotion/react';

import Chain from '../entities/chain';
import Transaction from '../entities/transaction';
import useSocket from '../utilities/useSocket';
import useWallet from "../utilities/useWallet";
import { WORKER_EVENT } from '../utilities/constants';

import css from '../styles/Mining.module.scss';

const Mining = ({ router }) => {
  const worker = useRef(null);
  const credential = useWallet();
  const { socketUpdateAll, requestVerify, validBlock } = useSocket();
  const { difficulty } = useSelector(({ config }) => config);
  const { chain, block, pendingTransactions } = useSelector(({ blockChain }) => blockChain);

  const [loaded, setLoaded] = useState(false);
  const [animationName, setAnimationName] = useState('');
  const [workerInstalled, setWorkerInstalled] = useState(false);

  const [enableVerify, setEnableVerify] = useState(false);
  const [enableMining, setEnableMining] = useState(false);

  useEffect(() => {
    socketUpdateAll();
    worker.current = new Worker(new URL('mine.worker.js', import.meta.url));

    worker.current.onmessage = (event) => {
      const message = get(event, 'data[0]', '');
      const data = get(event, 'data[1]', {});

      if (message === WORKER_EVENT.MINE_SUCCEED) {
        setAnimationName(css.fadeOut);
        requestVerify(data);
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
      worker.current && worker.current.terminate && worker.current.terminate();
    }
  }, []);

  useEffect(() => {
    if (pendingTransactions && !!pendingTransactions.length) {
      toast.dark('New transaction(s) available for mining.');
      setEnableMining(true);
    } else {
      setEnableMining(false);
    }
  }, [pendingTransactions]);

  useEffect(() => {
    if (block && block.hash) {
      toast.dark('Available a new block waiting to be verified.')
      setEnableVerify(true);
    } else {
      setEnableVerify(false);
    }
  }, [block]);

  useEffect(() => {
    if (!loaded && chain.length && workerInstalled && credential.publicKey) {
      setLoaded(true);
    }
  }, [chain, loaded, workerInstalled, credential]);

  const handleMining = () => {
    if (chain.length && pendingTransactions.length) {
      const rewardTransaction = new Transaction(null, credential.publicKey, 1);

      setAnimationName(css.fadeIn);
      worker.current.postMessage([WORKER_EVENT.START_MINING, {
        transactions: [...pendingTransactions, rewardTransaction],
        lastBlockHash: chain[chain.length - 1].hash,
        difficulty
      }]);
    }
  };

  const handleVerifyBlock = () => {
    if (block.hash && chain.length) {
      if (Chain.isValidChain([...chain, block], difficulty)) {
        validBlock(block);
        toast.success('Block verified as VALID');
      } else {
        setEnableVerify(false);
        toast.error('Block verified as INVALID');
      }
    }
  };

  const goBack = () => router.push('/');

  return loaded ? (
    <Fade triggerOnce className={css.container}>
      <h1>Mining</h1>

      <div className={classNames(css.overlay, animationName)}>
        <HashLoader css={emotionCss`size: 50; color: 'white'`}/>
      </div>

      <button
        type="button"
        disabled={!enableVerify || animationName === css.fadeIn}
        onClick={handleVerifyBlock}
        className={classNames(css.button, css.buttonDimension)}
      >
        Verify mined block
      </button>

      <button
        type="button"
        onClick={handleMining}
        disabled={!enableMining || animationName === css.fadeIn}
        className={classNames(css.button, css.buttonDimension)}
      >
        Mine new block
      </button>

      <button
        type="button"
        onClick={goBack}
        disabled={animationName === css.fadeIn}
        className={classNames(css.button, css.buttonDimension)}
      >
        Go back to wallet
      </button>
    </Fade>
  ) : <SkewLoader css={emotionCss`size: 60; color: 'black'`} />;
};

export default withRouter(Mining);
