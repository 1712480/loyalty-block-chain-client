import { USER_LOGIN, USER_LOGOUT, UPDATE_BALANCE } from './action';

const initialState = {
  publicKey: '',
  privateKey: '',
  signature: '',
  name: '',
  balance: 0,
};

const userReducer = (state = initialState, action) => {
  switch ((action.type)) {
    case USER_LOGIN:
      return {
        ...action.payload,
      }
    case USER_LOGOUT:
      return {};
    case UPDATE_BALANCE:
      return {
        ...state,
        balance: action.payload
      };
    default:
      return state;
  }
};

export default userReducer;
