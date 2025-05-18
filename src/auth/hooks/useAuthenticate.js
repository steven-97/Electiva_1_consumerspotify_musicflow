import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { authTypes } from "../types/authtypes";
import { getSpotifyUserProfile } from "./useSpotifyUser";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { auth, googleProvider } from "../../firebase/firebase";

export const useAuthenticate = (dispatch) => {
  const handleSuccessfulLogin = (user, provider = "local") => {
    const userData = {
      email: user.email,
      uid: user.uid,
      display_name: user.displayName || user.email,
      photoURL: user.photoURL || null,
      provider,
      logged: true,
    };

    localStorage.setItem("user", JSON.stringify(userData));

    dispatch({
      type: authTypes.login,
      payload: userData,
    });
  };

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

  const handleSpotifyCallback = async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");

    // 1. Manejo inicial de errores
    if (error) {
      console.error("Error de Spotify:", error);
      dispatch({
        type: authTypes.errors,
        payload: `Error de Spotify: ${error}`,
      });
      return false;
    }

    if (!code) {
      dispatch({
        type: authTypes.errors,
        payload: "No se recibió código de autorización",
      });
      return false;
    }

    console.log("Código de autorización:", code);
    try {
      // 2. Obtener token de Spotify
      const tokenResponse = await fetch(
        "https://accounts.spotify.com/api/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${btoa(
              `${import.meta.env.VITE_SPOTIFY_CLIENT_ID}:${
                import.meta.env.VITE_SPOTIFY_CLIENT_SECRET
              }`
            )}`,
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code: code,
            redirect_uri:
              import.meta.env.VITE_REDIRECT_URI ||
              window.location.origin + "/callback",
          }),
        }
      );

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new Error(
          errorData.error_description || "Código de autorización inválido"
        );
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // 3. Obtener perfil de Spotify
      const profileResponse = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!profileResponse.ok) {
        throw new Error("Error al obtener perfil de Spotify");
      }

      const spotifyProfile = await profileResponse.json();
      const spotifyId = spotifyProfile.id;

      // 4. Buscar usuario existente en Firestore
      const db = getFirestore();
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("spotify.id", "==", spotifyId));
      const querySnapshot = await getDocs(q);

      let firebaseUser;

      if (!querySnapshot.empty) {
        // Usuario existe - obtener sus datos
        const userDoc = querySnapshot.docs[0];
        firebaseUser = { uid: userDoc.id, ...userDoc.data() };
      } else {
        // Crear nuevo usuario en Firebase
        const auth = getAuth();

        // Necesitarás un backend para crear el usuario seguro
        const createUserResponse = await fetch(
          "https://tu-backend.com/create-spotify-user",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              spotifyId: spotifyId,
              email: spotifyProfile.email || `${spotifyId}@spotify.musicapp`,
              displayName: spotifyProfile.display_name,
              profileImage: spotifyProfile.images?.[0]?.url,
              accessToken: accessToken,
              refreshToken: tokenData.refresh_token,
            }),
          }
        );

        if (!createUserResponse.ok) {
          throw new Error("Error al crear usuario");
        }

        const { customToken } = await createUserResponse.json();
        const userCredential = await signInWithCustomToken(auth, customToken);
        firebaseUser = userCredential.user;
      }

      // 5. Actualizar estado de la aplicación
      dispatch({
        type: authTypes.login,
        payload: {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: spotifyProfile.display_name,
          photoURL: spotifyProfile.images?.[0]?.url,
          provider: "spotify",
          spotify: {
            token: accessToken,
            refreshToken: tokenData.refresh_token,
            profile: spotifyProfile,
          },
        },
      });

      return true;
    } catch (error) {
      console.error("Error completo:", error);
      dispatch({
        type: authTypes.errors,
        payload: error.message || "Error en autenticación",
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
