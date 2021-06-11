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
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
};

export default LayoutContainer;
