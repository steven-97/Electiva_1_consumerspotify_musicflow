import React from "react";
import { Link } from "react-router-dom";

const PlaylistRow = ({ user = {}, playlists = [], showOwner = false }) => {
  const displayedPlaylists =
    playlists.length > 0 ? playlists : user.playlists || [];

  return (
    <div className="space-y-3">
      {user.username && (
        <h2 className="text-xl font-bold mb-2">{user.username}</h2>
      )}

      <div
        className={`grid gap-4 pb-2 scrollbar-thin scrollbar-thumb-zinc-700 ${
          displayedPlaylists.length > 7 ? "max-h-[420px] overflow-y-auto" : ""
        }`}
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}
      >
        {displayedPlaylists.map((playlist) => (
          <Link
            key={playlist.id}
            to={`/playlist/${playlist.id}`}
            className="bg-[#1A1A35] hover:bg-[#2A2A4B] transition-all rounded-lg p-3 shadow hover:shadow-lg flex flex-col"
          >
            <img
              src={playlist.image ?? "/playlist.webp"}
              alt={playlist.name}
              className="w-full h-[150px] object-cover rounded-md mb-2"
            />
            <h3
              className="text-sm font-semibold text-white truncate"
              title={playlist.name}
            >
              {playlist.name}
            </h3>
            <p
              className="text-xs text-gray-400 truncate"
              title={`Creado por ${
                showOwner && playlist.userDisplayName
                  ? playlist.userDisplayName
                  : playlist.owner
              }`}
            >
              By{" "}
              {showOwner && playlist.userDisplayName
                ? playlist.userDisplayName
                : playlist.owner}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PlaylistRow;
