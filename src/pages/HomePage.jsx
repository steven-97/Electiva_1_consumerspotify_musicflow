import React, { useContext, useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/sidebar/SideBar";
import MainContent from "../components/MainContent";
import UserContext from "../auth/contexts/UserContext";
import {
  getSpotifyCurrentUserPlaylist,
  getSpotifyUserTracks,
  getUserPlaylistsFromDB,
  saveUserPlaylists,
} from "../auth/hooks/useSpotifyUser";
import { useSpotifyToken } from "../auth/hooks/useSpotifyToken";
import toast from "react-hot-toast";

const HomePage = () => {
  const { userState } = useContext(UserContext);
  const [userTracks, setUserTracks] = useState(null);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const { token: spotifyToken, loading: tokenLoading } = useSpotifyToken();

  useEffect(() => {
    const fetchData = async () => {
      if (!spotifyToken || tokenLoading) return;

      setLoading(true);
      try {
        const dbPlaylists = await getUserPlaylistsFromDB(userState.user.uid);

        if (dbPlaylists.length > 0) {
          setUserPlaylists(dbPlaylists);
        } else {
          const playlists = await getSpotifyCurrentUserPlaylist(spotifyToken);
          setUserPlaylists(playlists.items);
          await saveUserPlaylists(userState.user.uid, playlists.items);
        }

        const tracks = await getSpotifyUserTracks(spotifyToken);
        setUserTracks(tracks);
      } catch (error) {
        toast.error("Error al cargar datos de Spotify");
      } finally {
        setLoading(false);
        setShowContent(true);
      }
    };

    fetchData();
  }, [spotifyToken, tokenLoading, userState.user?.uid]);

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
