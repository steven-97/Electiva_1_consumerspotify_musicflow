import React, { useContext, useEffect, useState } from "react";
import { MusicIcon } from "lucide-react";
import SidebarItem from "./SidebarItem";
import UserContext from "../../auth/contexts/UserContext";
import {
  getSpotifyCurrentUserPlaylist,
  getSpotifyUserTracks,
} from "../../auth/hooks/useSpotifyUser";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const { userState } = useContext(UserContext);
  const [userData, setUserTracks] = useState(null);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);

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
        } catch (err) {
          console.log("Error al cargar el perfil del usuario.", err);
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [userState]);

  console.log("userData", userPlaylists);
  return (
    <aside className="w-72 bg-[#11112B] p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <MusicIcon className="text-pink-500" size={28} />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-blue-500 text-transparent bg-clip-text">
            Music Flow
          </h1>
        </div>

        <div className="mb-6">
          <h2 className="text-sm text-gray-400 mb-2 uppercase tracking-wide">
            Tus me gusta
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-6 h-6 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ul className="space-y-2">
              {userData?.items?.slice(0, 5).map((item, idx) => (
                <Link to={`/song/${item?.track?.id}`} key={idx}>
                  <SidebarItem
                    title={item?.track?.name}
                    subtitle={item?.track?.artists
                      .map((artist) => artist.name)
                      .join(", ")}
                    image={item?.track?.album?.images[0]?.url}
                    type={"track"}
                    id={item?.track?.id}
                  />
                </Link>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-sm text-gray-400 mb-2 uppercase tracking-wide">
            Tus Playlists
          </h2>
          <ul className="space-y-2">
            {userPlaylists?.slice(0, 3).map((pl, idx) => (
              <Link to={`/playlist/${pl?.id}`} key={idx}>
                <SidebarItem
                  key={idx}
                  title={pl?.name}
                  subtitle={`${pl?.tracks?.total || 0} canciones`}
                  image={pl?.images?.[0]?.url}
                />
              </Link>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
