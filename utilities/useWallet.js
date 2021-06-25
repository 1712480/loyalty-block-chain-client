import Router from 'next/router'
import { useSelector } from 'react-redux';

const useWallet = () => {
  const credentials = useSelector(({ user }) => user);

  if (process.browser && (!credentials || !credentials.publicKey)) {
    return Router.push('/login');
  }

  return credentials;
};

export default useWallet;
