import React from "react";
import {
  Calendar,
  Clock,
  Flame,
  Ban,
  Check,
  Volume2,
  ExternalLink,
  Disc3,
} from "lucide-react";

const SongHero = ({ song }) => {
  const durationMinutes = Math.floor(song.duration_ms / 60000);
  const durationSeconds = ((song.duration_ms % 60000) / 1000)
    .toFixed(0)
    .padStart(2, "0");
  const releaseYear = song.album.release_date?.split("-")[0];
  const artists = song.artists.map((artist) => artist.name).join(", ");

  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 text-white bg-gradient-to-b from-[#110433] via-[#190852] to-black min-h-screen">
      <img
        src={song.album.images[0].url}
        alt={song.name}
        className="w-72 h-72 rounded-lg shadow-2xl mb-8"
      />

      <div className="text-center">
        <p className="uppercase text-sm text-gray-400">Canción destacada</p>
        <h1 className="text-5xl font-bold mt-2">{song.name}</h1>
        <p className="mt-4 text-xl text-gray-300">{artists}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-10 text-sm text-gray-300 max-w-3xl">
        <div className="flex items-center gap-2">
          <Disc3 size={18} />
          <span className="text-white">Álbum:</span> {song.album.name}
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={18} />
          <span className="text-white">Año:</span> {releaseYear}
        </div>
        <div className="flex items-center gap-2">
          <Clock size={18} />
          <span className="text-white">Duración:</span> {durationMinutes}:
          {durationSeconds}
        </div>
        <div className="flex items-center gap-2">
          <Flame size={18} />
          <span className="text-white">Popularidad:</span> {song.popularity}/100
        </div>
        <div className="flex items-center gap-2">
          {song.explicit ? (
            <>
              <Ban size={18} className="text-red-500" />
              <span className="text-white">Explícita</span>
            </>
          ) : (
            <>
              <Check size={18} className="text-green-500" />
              <span className="text-white">No explícita</span>
            </>
          )}
        </div>
        {song.preview_url && (
          <div className="flex items-center gap-2 col-span-2 md:col-span-1">
            <Volume2 size={18} />
            <audio controls className="w-full">
              <source src={song.preview_url} type="audio/mpeg" />
              Tu navegador no soporta el audio.
            </audio>
          </div>
        )}
      </div>

      <a
        href={song.external_urls.spotify}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-10 inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 px-6 py-3 rounded-full text-white transition"
      >
        <ExternalLink size={18} />
        Escuchar en Spotify
      </a>
    </div>
  );
};

export default SongHero;
