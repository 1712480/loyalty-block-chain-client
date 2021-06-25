import { useEffect, useState } from 'react';
import classnames from 'classnames';
import { get } from 'lodash';
import { withRouter } from 'next/router';
import { toast } from 'react-toastify';
import { FaCopy } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

import Chain from '../entities/chain';
import socket from '../utilities/socket';
import useWallet from '../utilities/useWallet';
import { userLogout } from '../redux/user/action';
import { EMPTY, SOCKET_CLIENT_EVENT } from '../utilities/constants';

import styles from '../styles/Layout.module.scss';

const Home = ({ router }) => {
  const wallet = useWallet();
  const dispatch = useDispatch();
  const [balance, setBalance] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.emit(SOCKET_CLIENT_EVENT.UPDATE_ALL);
    socket.on(SOCKET_CLIENT_EVENT.UPDATE_ALL, (data) => {
      const chain = get(data, 'chain') || [];
      Chain.setChain(chain);
      setConnected(true);
    });
  }, []);

  useEffect(() => {
    if (wallet && wallet.publicKey && connected) {
      setBalance(Chain.getBalanceOfAddress(wallet.publicKey));
    }
  }, [wallet, connected]);

  if (!wallet || wallet === EMPTY || !connected) {
    return <h1>Loading ...</h1>
  }

  const copyPublicKey = () => {
    const input = document.getElementById('publicKey');
    navigator.clipboard.writeText(input.value).then(() => {
      toast.success('Public-key copied');
    })
      .catch((error) => {
        toast.error('Can\'t copy, try again later.');
        console.log({ error });
      });
  }

  const exit = () => {
    socket.emit(SOCKET_CLIENT_EVENT.USER_DISCONNECTED);
    dispatch(userLogout());
  }

  return (
    <div className={styles.content}>
      <h1 className={styles.title}>
        Loyalty Exchange!
      </h1>
      <p>Welcome{wallet.name && `, ${wallet.name}`} <button onClick={copyPublicKey}><FaCopy /><span>(Copy your public-key)</span></button></p>

      <h4>Balance: {balance}</h4>
      <button className={classnames(styles.button, styles.buttonDimension)} onClick={() => router.push('/mining')}>Start mining</button>
      <button className={classnames(styles.button, styles.buttonDimension)} onClick={() => router.push('/transaction')}>Make a transaction</button>
      <button className={classnames(styles.button, styles.buttonDimension)} onClick={() => router.push('/transaction-history')}>Transaction history</button>
      <button className={classnames(styles.button, styles.buttonDimension)} onClick={exit}>Exit</button>
      <input hidden id="publicKey" type="text" value={wallet.publicKey} />
    </div>
  )
};

export default withRouter(Home);
