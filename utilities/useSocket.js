import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';

import Chain from '../entities/chain';
import { updateAll, newChain, newTransaction, newBlock } from '../redux/blockChain/action';
import { updateBalance } from '../redux/user/action';
import { SERVER_ADDRESS, SOCKET_CLIENT_EVENT } from './constants';

const socket = io(SERVER_ADDRESS);

const useSocket = () => {
  const dispatch = useDispatch();
  const { publicKey } = useSelector(({ user }) => user);

  const socketUpdateAll = () => socket.emit(SOCKET_CLIENT_EVENT.UPDATE_ALL);
  const socketUpdateChain = () => socket.emit(SOCKET_CLIENT_EVENT.UPDATE_CHAIN);
  const socketUpdateBlock = () => socket.emit(SOCKET_CLIENT_EVENT.UPDATE_BLOCK);

  const requestVerify = (block) => socket.emit(SOCKET_CLIENT_EVENT.REQUEST_VERIFY, { block });
  const validBlock = (block) => socket.emit(SOCKET_CLIENT_EVENT.VALID_BLOCK, { block });
  const socketUpdateTransactions = (transaction) => socket.emit(SOCKET_CLIENT_EVENT.UPDATE_TRANSACTIONS, transaction);
  const userDisconnected = () => socket.emit(SOCKET_CLIENT_EVENT.USER_DISCONNECTED);

  const handleUpdateAll = (data) => {
    const { chain, transactions: pendingTransactions, block } = data;
    dispatch(updateAll({ chain, pendingTransactions, block }));
    publicKey && chain.length && dispatch(updateBalance(Chain.getBalanceOfAddress(publicKey, chain)));
  };

  const handleUpdateChain = ({ chain }) => {
    dispatch(newChain(chain));
    publicKey && chain.length && dispatch(updateBalance(Chain.getBalanceOfAddress(publicKey, chain)));
  };
  const handleUpdateBlock = ({ block }) => dispatch(newBlock(block));
  const handleUpdateTransactions = ({ transactions }) => dispatch(newTransaction(transactions));

  useEffect(() => {
    socket.on(SOCKET_CLIENT_EVENT.UPDATE_ALL, handleUpdateAll);
    socket.on(SOCKET_CLIENT_EVENT.UPDATE_CHAIN, handleUpdateChain);
    socket.on(SOCKET_CLIENT_EVENT.UPDATE_BLOCK, handleUpdateBlock);
    socket.on(SOCKET_CLIENT_EVENT.UPDATE_TRANSACTIONS, handleUpdateTransactions);
  }, []);

  return {
    socketUpdateAll,
    socketUpdateChain,
    socketUpdateBlock,
    socketUpdateTransactions,
    requestVerify,
    validBlock,
    userDisconnected
  };
};

export default useSocket;
