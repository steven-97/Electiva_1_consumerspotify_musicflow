import React from "react";
import PlaylistRow from "./playlist/PlaylistRow";

const MainContent = ({ userPlaylists }) => {
  
  const formattedUserPlaylists = userPlaylists.map((p) => ({
    id: p.id,
    playlistName: p.name,
    username: p.owner.display_name || "Tú",
    image: p.images?.[0]?.url,
    url: p.external_urls?.spotify,
  }));

  return (
    <main className="flex-1 px-4 py-8 overflow-y-auto">
      <div className="space-y-10">
        {userPlaylists ? (
          <div>
            <h1 className="text-3xl font-bold mb-4">De todo tu gusto</h1>
            <PlaylistRow
              user={{
                playlists: formattedUserPlaylists,
              }}
            />
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-bold mb-4">No tienes playlists</h1>
            <p className="text-gray-500">Parece que no tienes playlists disponibles en tu cuenta.</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default MainContent;