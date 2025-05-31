import React from 'react';
import { Link } from 'react-router-dom';

const formatDuration = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const SongCardList = ({ songs }) => {
  
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {songs.map((song, index) => (
        <Link
          key={index}
          to={`/song/${song.track.id}`}
          className="bg-white/5 backdrop-blur-md rounded-2xl p-4 shadow-md hover:shadow-pink-500/20 transition-all group w-64 h-70 flex flex-col"
        >
          <img
            src={song.track.album.images[0].url} 
            alt={song.track.name}
            className="rounded-xl w-full h-36 object-cover mb-3 group-hover:scale-105 transition"
          />
          <p className="font-semibold text-lg truncate">{song.track.name}</p>
          <p className="text-sm text-white/60 truncate">{song.track.artists[0].name}</p>
          <div className="flex justify-between text-xs text-white/50 mt-2">
            <span className="truncate">{song.track.album.name}</span>
            <span>{formatDuration(song.track.duration_ms)}</span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default SongCardList;