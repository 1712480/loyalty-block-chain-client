import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useDispatch } from 'react-redux';

import { updateAll, newChain, newTransaction } from '../redux/blockChain/action';
import { SERVER_ADDRESS, SOCKET_CLIENT_EVENT } from './constants';

const socket = io(SERVER_ADDRESS);

const useSocket = () => {
  const dispatch = useDispatch();

  const socketUpdateAll = () => socket.emit(SOCKET_CLIENT_EVENT.UPDATE_ALL);
  const socketUpdateChain = () => socket.emit(SOCKET_CLIENT_EVENT.UPDATE_CHAIN);
  const socketUpdateBlock = () => socket.emit(SOCKET_CLIENT_EVENT.UPDATE_BLOCK);
  const socketUpdateTransactions = (transaction) => socket.emit(SOCKET_CLIENT_EVENT.UPDATE_TRANSACTIONS, transaction);
  const userDisconnected = () => socket.emit(SOCKET_CLIENT_EVENT.USER_DISCONNECTED);

  const handleUpdateAll = (data) => {
    const { chain, transactions: pendingTransactions, block } = data;
    dispatch(updateAll({ chain, pendingTransactions, block }));
  };

  const handleUpdateChain = ({ chain }) => dispatch(newChain(chain));
  const handleUpdateTransactions = ({ transactions }) => dispatch(newTransaction(transactions));

  useEffect(() => {
    socket.on(SOCKET_CLIENT_EVENT.UPDATE_ALL, handleUpdateAll);
    socket.on(SOCKET_CLIENT_EVENT.UPDATE_CHAIN, handleUpdateChain);
    socket.on(SOCKET_CLIENT_EVENT.UPDATE_TRANSACTIONS, handleUpdateTransactions);

    return () => {
      socket.disconnect();
    }
  }, []);

  return {
    socketUpdateAll,
    socketUpdateChain,
    socketUpdateBlock,
    socketUpdateTransactions,
    userDisconnected
  };
};

export default useSocket;
