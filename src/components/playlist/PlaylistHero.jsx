import React from "react";
import { ExternalLink, Music } from "lucide-react";

const PlaylistHero = ({ playlist }) => {
  return (
    <div className="flex items-center gap-6 px-6 sm:px-10 pt-10">
      <img
        src={playlist?.images?.[0]?.url || "/playlist.webp"}
        alt={playlist.name}
        className="w-[160px] h-[160px] rounded-xl shadow-lg object-cover"
      />

      <div className="flex flex-col justify-center">
        <span className="uppercase text-xs text-pink-500 font-semibold mb-2">
          Playlist
        </span>

        <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center gap-2">
          <Music className="h-6 w-6 text-fuchsia-600 animate-pulse" />
          {playlist.name}
        </h1>

        <p className="text-sm text-white/70 mt-2">
          Creada por {playlist.owner?.display_name || "Desconocido"} ·{" "}
          {playlist.tracks?.total} canciones
        </p>

        <a
          href={playlist.external_urls.spotify}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 w-60 inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 px-6 py-3 rounded-full text-white transition"
        >
          <ExternalLink size={18} />
          Escuchar en Spotify
        </a>
      </div>
    </div>
  );
};

export default PlaylistHero;
