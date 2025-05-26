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

      // Verificar si el usuario ya existe en Firestore
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
      console.error("Error con Google:", error);
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
    console.log("handleSpotifyCallback called......");
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state"); // Nuevo: obtenemos el parámetro state

    console.log("Spotify callback params:", { code, state });
    if (!code) {
      dispatch({
        type: authTypes.errors,
        payload: "No se recibió código de autorización",
      });
      return false;
    }

    console.log("Spotify code:", code);
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
    const redirectUri = import.meta.env.VITE_REDIRECT_URI;
    const basic = btoa(`${clientId}:${clientSecret}`);

    try {
      // 1. Obtener token de acceso de Spotify
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

      console.log("Spotify token response:", response);
      const data = await response.json();
      console.log("Spotify token data:", data);
      if (!data.access_token) return false;

      console.log("Spotify access token:", data.access_token);
      // 2. Obtener perfil de Spotify
      const spotifyUser = await getSpotifyUserProfile(data.access_token);
      console.log("Spotify user data:", spotifyUser);
      const spotifyId = spotifyUser.id;

      // 3. Determinar si es vinculación o login normal
      const isLinkingAccount = state === "linking";
      const currentUserStr = localStorage.getItem("user");
      const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

      // 4. Validar usuario para vinculación
      if (isLinkingAccount && !currentUser) {
        throw new Error("Debes iniciar sesión primero para vincular Spotify");
      }

      // 5. Buscar si el Spotify ID ya está en uso
      const userQuery = await getDocs(
        query(collection(db, "users"), where("spotify.id", "==", spotifyId))
      );

      // 6. Manejar casos posibles
      if (!userQuery.empty) {
        // Usuario existente con este Spotify ID
        const existingUserDoc = userQuery.docs[0];
        const existingUser = existingUserDoc.data();

        console.log("Usuario existente:", userQuery.docs[0]);
        console.log("Usuario actual:", existingUserDoc.data());
        console.log("isLinkingAccount:", isLinkingAccount);

        // Si es vinculación pero a otro usuario
        if (isLinkingAccount && existingUser.uid !== currentUser?.uid) {
          throw new Error(
            "Esta cuenta de Spotify ya está vinculada a otro usuario"
          );
        }

        // Actualizar token y datos (para ambos casos)
        const updatedUser = {
          ...existingUser,
          spotify: {
            ...existingUser.spotify,
            accessToken: data.access_token,
            linkedAt: new Date(),
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

      // 7. Si es vinculación a usuario existente
      console.log(isLinkingAccount, currentUser);
      if (isLinkingAccount && currentUser) {
        const userData = {
          ...currentUser,
          spotify: {
            id: spotifyId,
            email: spotifyUser.email,
            displayName: spotifyUser.display_name,
            photoURL: spotifyUser.images?.[0]?.url || null,
            accessToken: data.access_token,
            linkedAt: new Date(),
          },
        };
        console.log("Vinculando Spotify a usuario existente:", userData);
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

      // 8. Si es login nuevo con Spotify
      const newUserData = {
        uid: `spotify_${spotifyId}`,
        displayName: spotifyUser.display_name,
        email: spotifyUser.email,
        photoURL: spotifyUser.images?.[0]?.url || null,
        provider: "spotify",
        spotify: {
          id: spotifyId,
          accessToken: data.access_token,
          linkedAt: new Date(),
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
      console.error("Error en Spotify callback:", error);
      dispatch({
        type: authTypes.errors,
        payload: error.message || "Error al conectar con Spotify",
      });
      return false;
    }
  };

  return {
    loginWithGoogle,
    loginWithEmail,
    logout,
    checkAuthState,
    handleSpotifyCallback,
  };
};
