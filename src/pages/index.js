import { useEffect } from 'react';

import socket from '../utilities/socket';
import useWallet from '../utilities/useWallet';
import { EMPTY, SOCKET_CLIENT_EVENT } from '../utilities/constants';

import styles from '../../styles/Layout.module.scss'

export default function Home() {
  const credential = useWallet({ redirectTo: 'login' });

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

  return (
    <>
      <h1 className={styles.title}>
        Loyalty Exchange!
      </h1>
      <p>Welcome, {credential.publicKey}</p>
    </>
  )
}
