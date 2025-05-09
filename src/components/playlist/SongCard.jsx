import React from 'react';

const SongCard = ({ song }) => (
  <div className="min-w-[200px] bg-[#1A1A2E] rounded-xl p-4 shadow-md hover:shadow-lg transition-all">
    <h3 className="text-md font-bold">{song.title}</h3>
    <p className="text-sm text-gray-400">{song.artist}</p>
  </div>
);

export default SongCard;