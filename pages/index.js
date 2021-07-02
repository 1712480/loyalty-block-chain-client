import { useEffect, useState } from 'react';
import classnames from 'classnames';
import { withRouter } from 'next/router';
import { toast } from 'react-toastify';
import { FaCopy } from 'react-icons/fa';
import { Fade } from 'react-awesome-reveal';
import SkewLoader from 'react-spinners/SkewLoader';
import { css as emotionCss } from '@emotion/react';
import { useDispatch, useSelector } from 'react-redux';

import Chain from '../entities/chain';
import useSocket from '../utilities/useSocket';
import useWallet from '../utilities/useWallet';
import { userLogout } from '../redux/user/action';

import styles from '../styles/Layout.module.scss';

const Home = ({ router }) => {
  const wallet = useWallet();
  const dispatch = useDispatch();
  const { socketUpdateChain, userDisconnected } = useSocket();
  const { balance } = useSelector(({ user }) => user);
  const { chain } = useSelector(({ blockChain }) => blockChain);
  const { resellers } = useSelector(({ config }) => config);
  const { publicKey } = useSelector(({ user }) => user);
  const [connected, setConnected] = useState(false);
  const [reseller, setReseller] = useState({ image: '' });

  useEffect(() => {
    socketUpdateChain();

    if (resellers.length) {
      const foundReseller = resellers.find(({ publicKey: resellerKey }) => publicKey === resellerKey);

      foundReseller && setReseller(foundReseller);
    }
  }, []);

  useEffect(() => {
    if (!connected && !!chain.length) {
      setConnected(true);
    }
  }, [chain, connected]);

  if (!wallet || !connected) {
    return <SkewLoader css={emotionCss`size: 60; color: 'black'`} />;
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
    userDisconnected();
    dispatch(userLogout());
  }

  return (
    <Fade triggerOnce className={styles.content} cascade damping={0.3} duration={500}>
      <h1 className={styles.title}>
        Loyalty Exchange!
      </h1>
      <p>
        Welcome{wallet.name && `, ${wallet.name}`}
        <button onClick={copyPublicKey}>
          <FaCopy /><span>(Copy your public-key)</span>
        </button>
      </p>

      {reseller.image
        ? <img src={reseller.image} alt={reseller.name} className={styles.resellerImage} />
        : <h4>Balance: {balance}</h4>
      }

      <button className={classnames(styles.button, styles.buttonDimension)} onClick={() => router.push('/mining')}>Start mining</button>
      <button className={classnames(styles.button, styles.buttonDimension)} onClick={() => router.push('/transaction')}>Make a transaction</button>
      <button className={classnames(styles.button, styles.buttonDimension)} onClick={() => router.push('/transaction-history')}>Transaction history</button>
      <button className={classnames(styles.button, styles.buttonDimension)} onClick={exit}>Exit</button>
      <input hidden id="publicKey" type="text" value={wallet.publicKey} />
    </Fade>
  )
};

export default withRouter(Home);
