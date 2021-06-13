import Head from 'next/head';
import Image from "next/image";

import css from '../styles/Layout.module.css';
import styles from '../styles/Layout.module.css';

const LayoutContainer = ({ children }) => {
  return (
    <div className={css.container}>
      <Head>
        <title>Loyalty with BlockChain</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={css.main}>
        {children}
      </main>

      <footer className={styles.footer}>
        1712480 - 1712740
      </footer>
    </div>
  )
};

export default LayoutContainer;
