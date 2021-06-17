import { useEffect, useState } from 'react';
import classnames from 'classnames';
import { withRouter } from 'next/router';

import socket from '../utilities/socket';
import useWallet from '../utilities/useWallet';
import { EMPTY, SOCKET_CLIENT_EVENT } from '../utilities/constants';

import styles from '../styles/Layout.module.scss';

const Home = ({ router }) => {
  const [credential, setCredentials] = useWallet({ redirectTo: 'login' });
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    socket.emit(SOCKET_CLIENT_EVENT.UPDATE);
    socket.on(SOCKET_CLIENT_EVENT.UPDATE, (data) => {
      console.log(data);
    });

    return () => {
      socket.emit(SOCKET_CLIENT_EVENT.USER_DISCONNECTED);
    }
  }, []);

  if (!credential || credential === EMPTY) {
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
      <p>Welcome, {credential.publicKey}</p>

      <h4>Balance: {balance}</h4>
      <button className={classnames(styles.button, styles.buttonDimension)} onClick={() => router.push('/mining')}>Start mining</button>
      <button className={classnames(styles.button, styles.buttonDimension)} onClick={() => router.push('/transaction')}>Make a transaction</button>
      <button className={classnames(styles.button, styles.buttonDimension)} onClick={() => {}}>Transaction history</button>
      <button className={classnames(styles.button, styles.buttonDimension)} onClick={exit}>Exit</button>
    </div>
  )
};

export default withRouter(Home);
