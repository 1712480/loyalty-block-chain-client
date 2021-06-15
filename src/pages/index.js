import { useEffect } from 'react';

import socket from '../utilities/socket';
import { SOCKET_CLIENT_EVENT } from '../utilities/constants';

import styles from '../../styles/Layout.module.css'

export default function Home() {
  useEffect(() => {
    socket.emit(SOCKET_CLIENT_EVENT.UPDATE);
    socket.on(SOCKET_CLIENT_EVENT.UPDATE, (data) => {
      console.log(data);
    });

    return () => {
      socket.emit(SOCKET_CLIENT_EVENT.USER_DISCONNECTED);
    }
  }, []);

  return (
    <>
      <h1 className={styles.title}>
        Loyalty Exchange!
      </h1>
    </>
  )
}
