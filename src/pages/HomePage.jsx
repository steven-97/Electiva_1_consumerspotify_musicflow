import React, { useContext, useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/sidebar/SideBar";
import MainContent from "../components/MainContent";
import UserContext from "../auth/contexts/UserContext";
import {
  getSpotifyCurrentUserPlaylist,
  getSpotifyUserTracks,
} from "../auth/hooks/useSpotifyUser";

const HomePage = () => {
  const { userState } = useContext(UserContext);
  const [userTracks, setUserTracks] = useState(null);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (userState.logged && userState.user.token) {
        try {
          setLoading(true);
          const tracks = await getSpotifyUserTracks(userState.user.token);
          setUserTracks(tracks);

          const playlistData = await getSpotifyCurrentUserPlaylist(
            userState.user.token
          );
          setUserPlaylists(playlistData.items);
          setLoading(false);
          setTimeout(() => setShowContent(true), 50);
        } catch (err) {
          console.error("Error al cargar el perfil del usuario.", err);
          setLoading(false);
          setTimeout(() => setShowContent(true), 50);
        }
      }
    };

    fetchUserData();
  }, [userState]);

  return (
    <div className="h-full min-h-screen bg-[#0A0A1F] text-white font-sans">
      <Header />
      <div className="flex min-h-screen">
        <Sidebar userData={userTracks} />

        {loading && (
          <div className="flex items-center justify-center flex-1">
            <p className="text-white">Cargando...</p>
          </div>
        )}

        {!loading && (
          <div
            className={`flex-1 transition-opacity duration-500 ${
              showContent ? "opacity-100" : "opacity-0"
            }`}
          >
            <MainContent userPlaylists={userPlaylists} />
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
