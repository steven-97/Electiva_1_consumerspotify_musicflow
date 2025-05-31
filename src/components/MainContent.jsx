import React, { useState, useEffect } from "react";
import PlaylistRow from "../music/playlist/PlaylistRow";
import { getOtherUsersPlaylists } from "../auth/hooks/useSpotifyUser";
import { useContext } from "react";
import UserContext from "../auth/contexts/UserContext";

const MainContent = ({ userPlaylists }) => {
  const { userState } = useContext(UserContext);
  const [otherUsersPlaylists, setOtherUsersPlaylists] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOtherPlaylists = async () => {
      try {
        const playlists = await getOtherUsersPlaylists(userState.user?.uid);
        setOtherUsersPlaylists(playlists);
      } catch (error) {
      }
    };

    if (userState.user?.uid) {
      fetchOtherPlaylists();
    }
  }, [userState.user?.uid]);

  useEffect(() => {
    const fetchOtherPlaylists = async () => {
      setError(null);
      try {
        const playlists = await getOtherUsersPlaylists(userState.user?.uid);
        setOtherUsersPlaylists(playlists);
      } catch (error) {
        setError("No se pudieron cargar las playlists de otros usuarios");
      }
    };

    if (userState.user?.uid) {
      fetchOtherPlaylists();
    }
  }, [userState.user?.uid]);

  const formattedUserPlaylists =
    userPlaylists?.map((p) => ({
      id: p.id,
      name: p.name,
      owner: typeof p.owner === "string" ? p.owner : "Tú",
      image: p.image || p.images?.[0]?.url,
      url: p.url || p.external_urls?.spotify,
    })) || [];

  return (
    <main className="flex-1 px-4 py-8 overflow-y-auto">
      {error && (
        <div className="text-red-500 p-4 bg-red-500/10 rounded-lg">{error}</div>
      )}
      <div className="space-y-10">
        {formattedUserPlaylists.length > 0 && (
          <div>
            <h1 className="text-3xl font-bold mb-4">Tus playlists</h1>
            <PlaylistRow playlists={formattedUserPlaylists} />
          </div>
        )}

        {otherUsersPlaylists.length > 0 && (
          <div>
            <h1 className="text-3xl font-bold mb-4">
              Playlists de la comunidad
            </h1>
            <PlaylistRow playlists={otherUsersPlaylists} showOwner={true} />
          </div>
        )}

        {formattedUserPlaylists.length === 0 &&
          otherUsersPlaylists.length === 0 && (
            <div>
              <h1 className="text-3xl font-bold mb-4">
                No hay playlists disponibles
              </h1>
              <p className="text-gray-500">
                Parece que no hay playlists disponibles en este momento.
              </p>
            </div>
          )}
      </div>
    </main>
  );
};

export default MainContent;
