import Head from 'next/head';
import { ToastContainer, Zoom } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import styles from './styles/Layout.module.scss';

const Layout = ({ children }) => {
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
        <title>Loyalty with BlockChain</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="modulepreload" href="/mine.worker.js" />
      </Head>

      <main className={styles.main}>
        {children}
      </main>

      <footer className={styles.footer}>
        1712480 - 1712740
      </footer>
    </div>
  )
};

export default Layout;
