import { useState, useEffect } from 'react';
import classnames from 'classnames';
import { get } from 'lodash';
import Head from 'next/head';
import { toast, ToastContainer, Zoom } from 'react-toastify';
import { AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';

import socket from './utilities/socket';
import { SOCKET_CLIENT_EVENT } from './utilities/constants';

import 'react-toastify/dist/ReactToastify.css';
import styles from './styles/Layout.module.scss';

const Layout = ({ children }) => {
  const [resellers, setResellers] = useState([]);
  const [openResellerList, setOpenResellerList] = useState(false);

  useEffect(() => {
    socket.on(SOCKET_CLIENT_EVENT.UPDATE_ALL, (data) => {
      const resellerList = get(data, 'resellers') || [];

      if (resellerList.length) {
        setResellers(resellerList)
      }
    });
  }, []);

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
    <div className={styles.container}>
      <ToastContainer
        draggable
        newestOnTop
        rtl={false}
        closeOnClick
        hideProgressBar
        autoClose={3000}
        pauseOnFocusLoss
        transition={Zoom}
        pauseOnHover={false}
        position="top-right"
      />

      <Head>
        <title>Loyalty Exchange</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="modulepreload" href="/mine.worker.js" />
      </Head>

      <main className={styles.main}>
        <div className={classnames(styles.grid, { [styles.open]: openResellerList })}>
          {!!resellers.length &&
          <>
            {renderResellerList}
            <button onClick={toggleResellerList}>{openResellerList ? <AiOutlineRight /> : <AiOutlineLeft />}</button>
          </>
          }
        </div>
        {children}
      </main>

      <footer className={styles.footer}>
        1712480 - 1712740
      </footer>
    </div>
  )
};

export default Layout;
