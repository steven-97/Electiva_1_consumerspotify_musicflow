import React, { useContext, useEffect, useState } from "react";
import PlaylistHero from "../components/playlist/PlaylistHero";
import SongCardList from "../components/playlist/SongCardList";
import { getSpotifyPlaylistById } from "../auth/hooks/useSpotifyUser";
import { useParams } from "react-router-dom";
import UserContext from "../auth/contexts/UserContext";
import Header from "../components/Header";
import Sidebar from "../components/sidebar/SideBar";

const PlaylistPage = () => {
  const { id } = useParams();
  const { userState } = useContext(UserContext);
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const data = await getSpotifyPlaylistById(
          userState.user?.spotify?.accessToken,
          id
        );
        setPlaylist(data);
      } catch (error) {
        setError("Error al cargar la playlist");
      } finally {
        setLoading(false);
        setTimeout(() => setShowContent(true), 50);
      }
    };

    if (id && userState.user?.spotify.accessToken) {
      fetchPlaylist();
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

          {!loading && !error && playlist && (
            <div
              className={`transition-opacity duration-500 ${
                showContent ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="min-h-screen bg-gradient-to-b from-[#110433] via-[#190852] to-black">
                <PlaylistHero playlist={playlist} />
                <div className="px-6 sm:px-10 mt-10 pb-20">
                  <SongCardList songs={playlist.tracks.items} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistPage;
