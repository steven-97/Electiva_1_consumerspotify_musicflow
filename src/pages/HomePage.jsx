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
  const fetchData = async () => {
    if (userState.user?.spotify?.accessToken) {
      try {
        const [tracks, playlists] = await Promise.all([
          getSpotifyUserTracks(userState.user.spotify.accessToken),
          getSpotifyCurrentUserPlaylist(userState.user.spotify.accessToken)
        ]);
        
        setUserTracks(tracks);
        setUserPlaylists(playlists.items);
      } catch (error) {
        toast.error("Error al cargar datos de Spotify");
      }
    }
  };

  fetchData();
}, [userState.user?.spotify?.accessToken]); 

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
