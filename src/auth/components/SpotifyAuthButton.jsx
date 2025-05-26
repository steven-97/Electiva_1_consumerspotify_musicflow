import { useCallBack } from "../hooks/useCallback";

export const SpotifyAuthButton = () => {
  const { handleSpotifyLogin } = useCallBack();

  return (
    <button
      onClick={() => {
        localStorage.removeItem('spotify_action');
        handleSpotifyLogin(false);
      }}
      className="flex w-full justify-center rounded-md bg-green-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 mt-4"
    >
      Continuar con Spotify
    </button>
  );
};
