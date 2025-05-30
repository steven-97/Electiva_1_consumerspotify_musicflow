import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { authTypes } from "../types/authtypes";
import { getSpotifyUserProfile } from "./useSpotifyUser";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { auth, db, googleProvider } from "../../firebase/firebase";

export const useAuthenticate = (dispatch) => {
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userExists = userDoc.exists();

      if (!userExists) {
        const newUserData = {
          uid: user.uid,
          displayName: user.displayName || user.email.split("@")[0],
          email: user.email,
          photoURL: user.photoURL || null,
          provider: "google",
          spotify: null,
        };
        await setDoc(doc(db, "users", user.uid), newUserData);
      } else {
        const existingUser = userDoc.data();
        if (existingUser.spotify) {
          localStorage.setItem(
            "spotify_data",
            JSON.stringify(existingUser.spotify)
          );
        }
      }

      handleSuccessfulLogin(user, "google");
      return true;
    } catch (error) {
      toast.error("Error al iniciar con Google");
      return false;
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      handleSuccessfulLogin(result.user);
      return true;
    } catch (error) {
      toast.error("Error con email:", error);
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
      toast.error("Error al cerrar sesión:", error);
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

  const registerWithEmail = async (email, password) => {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = result.user;

      const newUserData = {
        uid: user.uid,
        displayName: user.email.split("@")[0],
        email: user.email,
        photoURL: null,
        provider: "email",
        spotify: null,
      };

      await setDoc(doc(db, "users", user.uid), newUserData);
      handleSuccessfulLogin(user, "email");

      return true;
    } catch (error) {
      toast.error("Error al registrar usuario:", error);
      dispatch({
        type: authTypes.errors,
        payload: "Error al registrar usuario: " + error.message,
      });
      return false;
    }
  };

  const handleSpotifyCallback = async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");

    if (!code) {
      dispatch({
        type: authTypes.errors,
        payload: "No se recibió código de autorización",
      });
      return false;
    }

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
      if (!data.access_token) return false;

      const spotifyUser = await getSpotifyUserProfile(data.access_token);
      const spotifyId = spotifyUser.id;

      const isLinkingAccount = state === "linking";
      const currentUserStr = localStorage.getItem("user");
      const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

      if (isLinkingAccount && !currentUser) {
        toast.error("Debes iniciar sesión primero para vincular Spotify");
      }

      const userQuery = await getDocs(
        query(collection(db, "users"), where("spotify.id", "==", spotifyId))
      );

      if (!userQuery.empty) {
        const existingUserDoc = userQuery.docs[0];
        const existingUser = existingUserDoc.data();

        if (isLinkingAccount && existingUser.uid !== currentUser?.uid) {
          toast.error(
            "Esta cuenta de Spotify ya está vinculada a otro usuario"
          );
        }

        const updatedUser = {
          ...existingUser,
          spotify: {
            ...existingUser.spotify,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            linkedAt: new Date(),
            expiresAt: Date.now() + data.expires_in * 1000,
          },
        };

        await setDoc(existingUserDoc.ref, updatedUser, { merge: true });
        localStorage.setItem("user", JSON.stringify(updatedUser));

        dispatch({
          type: isLinkingAccount ? authTypes.updateUser : authTypes.login,
          payload: updatedUser,
        });
        return true;
      }

      if (isLinkingAccount && currentUser) {
        const userData = {
          ...currentUser,
          spotify: {
            id: spotifyId,
            email: spotifyUser.email,
            displayName: spotifyUser.display_name,
            photoURL: spotifyUser.images?.[0]?.url || null,
            accessToken: data.access_token,
            refresh_token: data.refresh_token,
            linkedAt: new Date(),
            expiresAt: Date.now() + data.expires_in * 1000,
          },
        };
        await setDoc(doc(db, "users", currentUser.uid), userData, {
          merge: true,
        });
        await setDoc(doc(db, "spotify_links", spotifyId), {
          firebaseUid: currentUser.uid,
        });

        localStorage.setItem("user", JSON.stringify(userData));
        dispatch({
          type: authTypes.updateUser,
          payload: userData,
        });
        return true;
      }

      const newUserData = {
        uid: `spotify_${spotifyId}`,
        displayName: spotifyUser.display_name,
        email: spotifyUser.email,
        photoURL: spotifyUser.images?.[0]?.url || null,
        provider: "spotify",
        spotify: {
          id: spotifyId,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          linkedAt: new Date(),
          expiresAt: Date.now() + data.expires_in * 1000,
        },
      };

      await setDoc(doc(db, "users", newUserData.uid), newUserData);
      await setDoc(doc(db, "spotify_links", spotifyId), {
        firebaseUid: newUserData.uid,
      });

      localStorage.setItem("user", JSON.stringify(newUserData));
      dispatch({
        type: authTypes.login,
        payload: newUserData,
      });
      return true;
    } catch (error) {
      toast.error("Error en Spotify callback:", error);
      dispatch({
        type: authTypes.errors,
        payload: error.message || "Error al conectar con Spotify",
      });
      return false;
    }
  };

  const refreshSpotifyToken = async (refreshToken) => {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
    const basic = btoa(`${clientId}:${clientSecret}`);

    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${basic}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      });

      const data = await response.json();
      if (!data.access_token) throw new Error("Failed to refresh token");

      return {
        accessToken: data.access_token,
        expiresAt: Date.now() + data.expires_in * 1000,
        refreshToken: data.refresh_token || refreshToken,
      };
    } catch (error) {
      toast.error("Error refreshing Spotify token:", error);
      throw error;
    }
  };

  return {
    loginWithGoogle,
    loginWithEmail,
    logout,
    checkAuthState,
    handleSpotifyCallback,
    registerWithEmail,
  };
};
