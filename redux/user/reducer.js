import { USER_LOGIN, USER_LOGOUT } from './action';

const initialState = {
  publicKey: '',
  privateKey: '',
  signature: '',
  name: ''
}
const userReducer = (state = initialState, action) => {
  switch ((action.type)) {
    case USER_LOGIN:
      return {
        ...action.payload,
      }
    case USER_LOGOUT:
      return {};
    default:
      return state;
  }
};

export default userReducer;
