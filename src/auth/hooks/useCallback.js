export const useCallBack = () => {
  const handleSpotifyLogin = (isLinking = false) => {
    localStorage.removeItem("spotify_callback_processed");

    localStorage.setItem("spotify_action", isLinking ? "linking" : "login");

    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
      response_type: "code",
      redirect_uri: import.meta.env.VITE_REDIRECT_URI,
      scope: "user-read-private user-read-email user-library-read",
      state: isLinking ? "linking" : "login",
    });

    window.location.href = `https://accounts.spotify.com/authorize?${params}`;
  };

  return { handleSpotifyLogin };
};
