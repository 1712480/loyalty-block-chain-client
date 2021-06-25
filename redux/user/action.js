export const USER_LOGIN = 'USER_LOGIN';
export const USER_LOGOUT = 'USER_LOGOUT';

export const userLogin = (payload) => ({
  type: USER_LOGIN,
  payload
});

export const userLogout = () => ({
  type: USER_LOGOUT,
})
