import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import axios from 'axios';
import Head from 'next/head';
import { useSelector, useDispatch } from 'react-redux';
import { toast, ToastContainer, Zoom } from 'react-toastify';
import { AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';
import { ModalProvider } from 'react-simple-hook-modal';

import { updateConfig } from './redux/config/action';
import { SERVER_ADDRESS, SERVER_ENDPOINT } from './utilities/constants';

import 'react-toastify/dist/ReactToastify.css';
import 'react-simple-hook-modal/dist/styles.css';
import styles from './styles/Layout.module.scss';

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const { resellers } = useSelector(({ config }) => config);
  const [connected, setConnected] = useState(false);
  const [openResellerList, setOpenResellerList] = useState(false);

  const fetchConfig = () => axios.get(`${SERVER_ADDRESS}/${SERVER_ENDPOINT.CONFIG}`, {})

  useEffect(() => {
    fetchConfig()
      .then(({ data }) => dispatch(updateConfig(data)))
      .catch(error => {
        console.log({ error });
        toast.error('Something happened! Please try again later.');
      });
  }, []);

  useEffect(() => {
    if (!connected && !!resellers.length) {
      setConnected(true);
    }
  }, [resellers, connected]);

  const toggleResellerList = () => setOpenResellerList(!openResellerList);

  const copyPublicKey = (publicKey, resellerName) => {
    navigator.clipboard.writeText(publicKey).then(() => {
      toast.success(`Public-key of ${resellerName} copied`);
    })
      .catch((error) => {
        toast.error('Can\'t copy, try again later.');
        console.log({ error });
      });
  };

  const renderResellerList = !!resellers.length && resellers.map(reseller => {
    const { name, image, publicKey } = reseller;

    return <img key={name} alt={name} src={image} onClick={() => copyPublicKey(publicKey, name)} />
  });

  return (
    <ModalProvider>
      <div className={styles.container}>
        <ToastContainer
          draggable
          newestOnTop
          rtl={false}
          closeOnClick
          hideProgressBar
          autoClose={3000}
          transition={Zoom}
          pauseOnHover={false}
          pauseOnFocusLoss={false}
          position="top-right"
        />

        <Head>
          <title>Loyalty Exchange</title>
          <link rel="icon" href="/favicon.ico" />
          <link rel="modulepreload" href="/mine.worker.js" />
        </Head>

        <main className={styles.main}>
          <div className={classnames(styles.grid, { [styles.open]: openResellerList })}>
            {connected && !!resellers.length &&
            <>
              {renderResellerList}
              <button onClick={toggleResellerList}>{openResellerList ? <AiOutlineRight /> : <AiOutlineLeft />}</button>
            </>
            }
          </div>
          {children}
        </main>

        <footer className={styles.footer}>
          <p>1712480</p>
        </footer>
      </div>
    </ModalProvider>
  )
};

export default Layout;
