import React from "react";
import { Link } from "react-router-dom";

const PlaylistRow = ({ user = {} }) => {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold mb-2">{user.username}</h2>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-700">
        {user.playlists?.map((playlist) => (
          <Link
            key={playlist.id}
            to={`/playlist/${playlist.id}`}
            className="min-w-[150px] bg-[#1A1A35] hover:bg-[#2A2A4B] transition-all rounded-lg p-3 flex-shrink-0 shadow hover:shadow-lg"
          >
            <img
              src={playlist.image ?? "/playlist.webp"}
              alt={playlist.playlistName}
              className="w-full h-[150px] object-cover rounded-md mb-2"
            />
            <h3
              className="text-sm font-semibold text-white truncate"
              title={playlist.playlistName}
            >
              {playlist.playlistName}
            </h3>
            <p
              className="text-xs text-gray-400 truncate"
              title={`Creado por ${playlist.username}`}
            >
              By {playlist.username}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PlaylistRow;