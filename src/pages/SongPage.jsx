import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSpotifyTrackById } from "../auth/hooks/useSpotifyUser";
import UserContext from "../auth/contexts/UserContext";
import Header from "../components/Header";
import Sidebar from "../components/sidebar/SideBar";
import SongHero from "../music/songs/SongHero";

const SongPage = () => {
  const { id } = useParams(); 
  const { userState } = useContext(UserContext);
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const fetchSong = async () => {
      try {
        const data = await getSpotifyTrackById(userState.user?.spotify?.accessToken, id);
        setSong(data);
      } catch (err) {
        setError("Error al cargar la canción");
      } finally {
        setLoading(false);
        setTimeout(() => setShowContent(true), 50);
      }
    };

    if (id && userState.user?.spotify.accessToken) {
      fetchSong();
    }
  }, [id, userState]);

  return (
    <div className="h-full min-h-screen bg-[#0A0A1F] text-white font-sans">
      <Header />
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          {loading && (
            <div className="flex items-center justify-center h-screen">
              <p className="text-white">Cargando...</p>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-screen">
              <p className="text-red-500">{error}</p>
            </div>
          )}

          {!loading && !error && song && (
            <div
              className={`transition-opacity duration-500 ${
                showContent ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="min-h-screen bg-gradient-to-b from-[#110433] via-[#190852] to-black">
                <SongHero song={song} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SongPage;