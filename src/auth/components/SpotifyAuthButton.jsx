export const SpotifyAuthButton = () => {
    const handleSpotifyLogin = () => {
      const params = new URLSearchParams({
        client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
        response_type: 'code',
        redirect_uri: import.meta.env.VITE_REDIRECT_URI,
        scope: 'user-read-private user-read-email user-library-read', 
      });
  
      window.location.href = `https://accounts.spotify.com/authorize?${params}`;
    };
  
    return (
      <button
        onClick={handleSpotifyLogin}
        className="flex w-full justify-center rounded-md bg-green-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 mt-4"
      >
        Continuar con Spotify
      </button>
    );
  };