import { authTypes } from "../types/authtypes";

export const authReducer = (state, action) => {
  switch (action.type) {
    case authTypes.login:
      return {
        ...state,
        logged: true,
        user: action.payload,
        errorMessage: null,
      };
    case authTypes.logout:
      return {
        logged: false,
        user: {},
        errorMessage: null,
      };
    case authTypes.errors:
      return {
        ...state,
        logged: false,
        errorMessage: action.payload,
      };

    default:
      return state;
  }
};
