import React, { useRef, useState } from 'react';
import { get } from 'lodash';
import { ec } from 'elliptic';
import Router from 'next/router';
import { saveAs } from 'file-saver';
import classNames from 'classnames';
import { toast } from 'react-toastify';

import styles from '../styles/Login.module.scss';

const generator = new ec('secp256k1');

export default function Login() {
  const userName = useRef(null);
  const fileInput = useRef(null);
  const publicKeyField = useRef(null);
  const privateKeyField = useRef(null);
  const [keyPair, setKeyPair] = useState(generator.genKeyPair());
  const [initialLoad, setInitialLoad] = useState(true);
  const [modalAnimation, setModalAnimation] = useState(styles.hide);

  const handleSelectedCredentialFile = (event) => {
    const file = get(event, 'target.files[0]');
    const reader = new FileReader();

    reader.readAsText(file, 'UTF-8');
    reader.onload = async (readerEvent) => {
      const content = readerEvent.target.result;
      const { publicKey, privateKey, name } = JSON.parse(content);

      localStorage.setItem('credentials', JSON.stringify({ publicKey, privateKey, name }));
      await Router.push('/');
    };
  };

  const toggleModal = (openModal) => {
    if (openModal && initialLoad) {
      setInitialLoad(false);
    }

    setModalAnimation(openModal ? styles.fadeIn : styles.fadeOut);
  }
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

  const generateNewKeyPair = () => setKeyPair(generator.genKeyPair());

  const handleCreateWallet = async () => {
    try {
      const name = userName.current.value;
      const publicKey = keyPair.getPublic('hex');
      const privateKey = keyPair.getPrivate('hex');
      const dataToSave = JSON.stringify({ publicKey, privateKey, name });
      const credentialFile = new Blob([dataToSave], {
        type: 'text/plain;charset=utf-8',
      });

      saveAs(credentialFile, 'Credential.txt');
      toggleModal(false);

      userName.current.value = '';
      generateNewKeyPair();
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
          onClick={() => toggleModal(true)}
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

        <div className={classNames(styles.modal, modalAnimation)}>
          <div className={classNames(styles.content)}>
            <h3>How can we call you</h3>

            <input ref={userName} type="text" className={styles.input} placeholder="your name ..." />

            <button
              type="button"
              onClick={handleCreateWallet}
              className={classNames(styles.button, styles.buttonDimension)}
            >
              Submit
            </button>

            <button
              type="button"
              onClick={() => toggleModal(false)}
              className={classNames(styles.button, styles.buttonDimension)}
            >
              Close
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
