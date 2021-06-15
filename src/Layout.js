import Head from 'next/head';
import { ToastContainer, Zoom } from 'react-toastify';

import styles from '../styles/Layout.module.scss';

const Layout = ({ children }) => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Loyalty with BlockChain</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {children}
      </main>

      <footer className={styles.footer}>
        1712480 - 1712740
      </footer>

      <ToastContainer
        limit={3}
        draggable
        newestOnTop
        rtl={false}
        closeOnClick
        hideProgressBar
        autoClose={3000}
        pauseOnFocusLoss
        transition={Zoom}
        pauseOnHover={false}
        position="top-center"
      />
    </div>
  )
};

export default Layout;
