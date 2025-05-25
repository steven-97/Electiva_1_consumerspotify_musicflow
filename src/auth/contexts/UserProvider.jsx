import { useEffect, useReducer } from "react";
import UserContext from "./UserContext";
import { authReducer } from "../reducers/authReducer";
import { useAuthenticate } from "../hooks/useAuthenticate";

const authInitialState = {
  logged: false,
  user: null,
  errorMessage: null,
};

const init = () => {
  const localUser = JSON.parse(localStorage.getItem("user")) || null;
  return localUser
    ? { ...authInitialState, logged: true, user: localUser }
    : authInitialState;
};

export const UserProvider = ({ children }) => {
  const [userState, dispatch] = useReducer(authReducer, authInitialState, init);

  const {
    login,
    logout,
    loginWithGoogle,
    loginWithEmail,
    checkAuthState,
    handleSpotifyCallback,
  } = useAuthenticate(dispatch);

  return (
    <UserContext.Provider
      value={{
        userState,
        login,
        logout,
        loginWithGoogle,
        loginWithEmail,
        checkAuthState,
        handleSpotifyCallback,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
