import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { authTypes } from "../types/authtypes";
import { getSpotifyUserProfile } from "./useSpotifyUser";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../../firebase/firebase";

export const useAuthenticate = (dispatch) => {
  const login = async ({ email, password }) => {
    try {
      const action = {
        type: authTypes.login,
        payload: {
          email,
          password,
        },
      };

      localStorage.setItem("user", JSON.stringify({ email, password }));

      dispatch(action);
    } catch (error) {
      console.error("Error al iniciar sesión con Spotify:", error);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      handleSuccessfulLogin(result.user, "google");
      return true;
    } catch (error) {
      console.error("Error con Google:", error);
      dispatch({
        type: authTypes.errors,
        payload: "Error al iniciar con Google",
      });
      return false;
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      handleSuccessfulLogin(result.user);
      return true;
    } catch (error) {
      console.error("Error con email:", error);
      dispatch({
        type: authTypes.errors,
        payload: "Credenciales incorrectas",
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem("user");
      dispatch({ type: authTypes.logout });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const checkAuthState = () => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        handleSuccessfulLogin(
          user,
          user.providerData[0]?.providerId || "local"
        );
      } else if (localStorage.getItem("user")) {
        logout();
      }
    });
  };

  const handleSuccessfulLogin = (firebaseUser, provider = "local") => {
    const userFormatted = {
      uid: firebaseUser.uid,
      displayName:
        firebaseUser.displayName || firebaseUser.email?.split("@")[0],
      email: firebaseUser.email,
      photoURL: firebaseUser.photoURL || null,
      provider,
      spotify: null,
    };

    localStorage.setItem("user", JSON.stringify(userFormatted));
    dispatch({
      type: authTypes.login,
      payload: userFormatted,
    });
  };

  const handleSpotifyCallback = async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) return;

    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
    const redirectUri = import.meta.env.VITE_REDIRECT_URI;

    const basic = btoa(`${clientId}:${clientSecret}`);

    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${basic}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        }),
      });

      const data = await response.json();

      if (data.access_token) {
        const user = await getSpotifyUserProfile(data.access_token);

        const userData = {
          id: user.id,
          email: user.email,
          displayName: user.display_name,
          provider: "spotify",
          photoURL: user.images?.[0]?.url || null,
          createdAt: new Date(),
        };

        await saveUserToFirestore(userData);
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: user.id,
            email: user.email,
            displayName: user.display_name,
            provider: "spotify",
            photoURL: user.images?.[0]?.url || null,
            createdAt: new Date(),
            token: data.access_token,
            spotify: true,
          })
        );

        dispatch({
          type: authTypes.login,
          payload: {
            id: user.id,
            email: user.email,
            displayName: user.display_name,
            provider: "spotify",
            photoURL: user.images?.[0]?.url || null,
            createdAt: new Date(),
            token: data.access_token,
            spotify: true,
          },
        });

        return true;
      }
      return false;
    } catch (error) {
      console.error("Error en autenticación Spotify:", error);
      return false;
    }
  };

  const saveUserToFirestore = async (userData) => {
    const userRef = doc(db, "users", userData.id);
    await setDoc(userRef, userData, { merge: true });
  };

  return {
    loginWithGoogle,
    loginWithEmail,
    logout,
    checkAuthState,
    handleSpotifyCallback,
  };
};
