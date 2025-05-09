import { authTypes } from "../types/authtypes";
import { getSpotifyUserProfile } from "./useSpotifyUser";

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

  const logout = () => {
    localStorage.removeItem("user");
    dispatch({ type: authTypes.logout });
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

        localStorage.setItem(
          "user",
          JSON.stringify({
            email: user.email,
            id: user.id,
            password: "contraseña",
            token: data.access_token
          })
        );

        dispatch({
          type: authTypes.login,
          payload: {
            email: "correo@spotify.com",
            password: "contraseña",
            token: data.access_token,
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

  return {
    login,
    logout,
    handleSpotifyCallback
  };
};
