import { io } from 'socket.io-client';
import { SERVER_ADDRESS } from './constants';

export default io(SERVER_ADDRESS);
