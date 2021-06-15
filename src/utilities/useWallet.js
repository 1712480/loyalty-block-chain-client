import { useEffect, useState } from 'react';
import Router from 'next/router'

import { EMPTY } from './constants';

export default ({ redirectTo = false }) => {
  const [credentials, setCredentials] = useState(null);

  useEffect(() => {
    const data = window.localStorage.getItem('credentials');
    setCredentials(!data ? EMPTY : JSON.parse(data));
  }, []);

  useEffect(() => {
    if (!redirectTo || !credentials) {
      return;
    }

    if (credentials && credentials === EMPTY) {
      Router.push(redirectTo);
    }
  }, [credentials, redirectTo]);

  return credentials;
};
