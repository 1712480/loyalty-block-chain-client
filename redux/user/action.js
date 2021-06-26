export const USER_LOGIN = 'USER_LOGIN';
export const USER_LOGOUT = 'USER_LOGOUT';
export const UPDATE_BALANCE = 'UPDATE_BALANCE';

export const userLogin = (payload) => ({
  type: USER_LOGIN,
  payload
});

export const userLogout = () => ({
  type: USER_LOGOUT,
});

export const updateBalance = (payload) => ({
  type: UPDATE_BALANCE,
  payload
});
