import React, { useRef } from 'react';
import { get } from 'lodash';
import { ec } from 'elliptic';
import Router from 'next/router';
import { saveAs } from 'file-saver';
import classNames from 'classnames';
import { toast } from 'react-toastify';

import styles from '../../styles/Login.module.scss';

const generator = new ec('secp256k1');
const key = generator.genKeyPair();

export default function Login() {
  const fileInput = useRef(null);
  const publicKeyField = useRef(null);
  const privateKeyField = useRef(null);

  const handleSelectedCredentialFile = (event) => {
    const file = get(event, 'target.files[0]');
    const reader = new FileReader();

    reader.readAsText(file, 'UTF-8');
    reader.onload = async (readerEvent) => {
      const content = readerEvent.target.result;
      const { publicKey, privateKey } = JSON.parse(content);

      localStorage.setItem('credentials', JSON.stringify({ publicKey, privateKey }));
      await Router.push('/');
    };
  };

  const toggleFileDialog = () => fileInput.current.click();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (privateKeyField.current.value && publicKeyField.current.value) {
      const privateKey = privateKeyField.current.value;
      const publicKey = publicKeyField.current.value;

      localStorage.setItem('credentials', JSON.stringify({ publicKey, privateKey }));
      await Router.push('/');
    } else {
      toast.error('Please provide all required data');
    }
  };

  const handleCreateWallet = async () => {
    try {
      const publicKey = key.getPublic('hex');
      const privateKey = key.getPrivate('hex');
      const dataToSave = JSON.stringify({ publicKey, privateKey });
      const credentialFile = new Blob([dataToSave], {
        type: 'text/plain;charset=utf-8',
      });

      saveAs(credentialFile, 'Credential.txt');
    } catch (err) {
      console.log({ err });
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h1>Access your wallet</h1>

        <input
          className={classNames(styles.input)}
          type="text"
          placeholder="public key ..."
          ref={publicKeyField}
        />
        <input
          className={classNames(styles.input)}
          type="password"
          placeholder="private key ..."
          ref={privateKeyField}
        />

        <button
          className={classNames(styles.button, styles.buttonDimension)}
          type="submit"
        >
          Submit
        </button>

        <button
          onClick={handleCreateWallet}
          className={classNames(styles.button, styles.buttonDimension)}
          type="button"
        >
          Create New Wallet
        </button>

        <button
          type="button"
          onClick={toggleFileDialog}
          className={classNames(styles.button, styles.buttonDimension)}
        >
          Select Credential File
        </button>

        <input
          className={styles.hidden}
          onChange={handleSelectedCredentialFile}
          id="file-input"
          type="file"
          ref={fileInput}
        />
      </form>
    </div>
  );
}
