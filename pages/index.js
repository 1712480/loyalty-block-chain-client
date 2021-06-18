import { useEffect, useState } from 'react';
import classnames from 'classnames';
import { get } from 'lodash';
import { withRouter } from 'next/router';

import Chain from '../entities/Chain';
import socket from '../utilities/socket';
import useWallet from '../utilities/useWallet';
import { EMPTY, SOCKET_CLIENT_EVENT } from '../utilities/constants';

import styles from '../styles/Layout.module.scss';

const Home = ({ router }) => {
  const [wallet, setCredentials] = useWallet({ redirectTo: 'login' });
  const [balance, setBalance] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.emit(SOCKET_CLIENT_EVENT.UPDATE_ALL);
    socket.on(SOCKET_CLIENT_EVENT.UPDATE_ALL, (data) => {
      const chain = get(data, 'chain') || [];
      Chain.setChain(chain);
      setConnected(true);
    });

    return () => {
      socket.emit(SOCKET_CLIENT_EVENT.USER_DISCONNECTED);
    }
  }, []);

  useEffect(() => {
    if (wallet && wallet.publicKey && connected) {
      setBalance(Chain.getBalanceOfAddress(wallet.publicKey));
    }
  }, [wallet, connected]);

  if (!wallet || wallet === EMPTY || !connected) {
    return <h1>Loading ...</h1>
  }

  const exit = () => {
    localStorage.removeItem('credentials');
    setCredentials(EMPTY);
  }

  return (
    <div className={styles.content}>
      <h1 className={styles.title}>
        Loyalty Exchange!
      </h1>
      <p>Welcome, {wallet.publicKey}</p>

      <h4>Balance: {balance}</h4>
      <button className={classnames(styles.button, styles.buttonDimension)} onClick={() => router.push('/mining')}>Start mining</button>
      <button className={classnames(styles.button, styles.buttonDimension)} onClick={() => router.push('/transaction')}>Make a transaction</button>
      <button className={classnames(styles.button, styles.buttonDimension)} onClick={() => router.push('/transaction-history')}>Transaction history</button>
      <button className={classnames(styles.button, styles.buttonDimension)} onClick={exit}>Exit</button>
    </div>
  )
};

export default withRouter(Home);
