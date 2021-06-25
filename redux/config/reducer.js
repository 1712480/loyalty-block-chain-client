import { UPDATE_CONFIG } from './action';

const initialState = {
  resellers: [],
  difficulty: 4,
};

const reducer = (state = initialState, action) => {
  switch (state.type) {
    case UPDATE_CONFIG:
      return { ...action.payload };
    default:
      return state;
  }
};

export default reducer;
