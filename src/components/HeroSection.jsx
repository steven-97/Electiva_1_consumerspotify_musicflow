import React from 'react';

const HeroSection = () => (
  <section className="text-center mb-12">
    <img src="/logo.jpg" alt="Music Flow Logo" className="mx-auto w-24 h-24 mb-4 rounded-full" />
    <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
      Music Flow
    </h1>
    <p className="text-gray-300">Comparte y explora playlists únicas.</p>
  </section>
);

export default HeroSection;