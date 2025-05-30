import React, { useContext, useState, useEffect } from "react";
import { LogOut, Settings, User, Music } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import UserContext from "../auth/contexts/UserContext";
import { getSpotifyUserProfile } from "../auth/hooks/useSpotifyUser";
import { useCallBack } from "../auth/hooks/useCallback";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { db } from "../firebase/firebase";

const Header = () => {
  const navigate = useNavigate();
  const { logout, userState, dispatch } = useContext(UserContext);
  const { handleSpotifyLogin } = useCallBack();

  const [open, setOpen] = useState(false);
  const [spotifyProfile, setSpotifyProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSpotifyProfile = async () => {
      if (userState.logged && userState.user?.spotify?.accessToken) {
        try {
          setLoading(true);
          const profile = await getSpotifyUserProfile(
            userState.user.spotify.accessToken
          );
          setSpotifyProfile(profile);
        } catch (err) {
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSpotifyProfile();
  }, [userState]);

  const handleSpotifyConnect = async () => {
    if (userState.user?.spotify?.refreshToken) {
      const confirm = window.confirm("¿Desconectar tu cuenta de Spotify?");
      if (confirm) {
        try {
          const updatedUser = {
            ...userState.user,
            spotify: null,
          };

          await setDoc(doc(db, "users", userState.user.uid), updatedUser);

          localStorage.setItem("user", JSON.stringify(updatedUser));
          dispatch({
            type: "UPDATE_USER",
            payload: updatedUser,
          });

          setSpotifyProfile(null);

          toast.success("Cuenta de Spotify desconectada");
        } catch (error) {
          toast.error("Error al desconectar Spotify");
        }
      }
    } else {
      localStorage.removeItem("spotify_callback_processed");
      localStorage.setItem("spotify_action", "linking");
      handleSpotifyLogin(true);
    }
  };

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/login");
  };

  const getUserImage = (size = "small") => {
    if (spotifyProfile?.images?.length > 0) {
      const img = spotifyProfile.images.find((img) =>
        size === "large" ? img.width >= 300 : img.width === 64
      );
      return img?.url;
    }
    return userState.user?.photoURL || null;
  };

  const getDisplayName = () => {
    return (
      spotifyProfile?.display_name ||
      userState.user?.displayName ||
      userState.user?.email?.split("@")[0] ||
      "Usuario"
    );
  };

  const getDisplayEmail = () => {
    return userState.user?.email || spotifyProfile?.email || "Sin correo";
  };

  const smallImage = getUserImage("small");
  const largeImage = getUserImage("large");

  return (
    <header className="w-full h-20 px-6 py-3 flex justify-between items-center bg-gradient-to-r from-[#1A1A35] to-[#2A2A4B] text-white shadow-lg sticky top-0 z-50">
      <Link
        to="/"
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
      >
        <div className="bg-gradient-to-r from-pink-500 to-blue-500 p-2 rounded-full">
          <Music size={24} className="text-white" />
        </div>
        <span className="text-2xl font-bold tracking-wide bg-gradient-to-r from-pink-500 to-blue-500  bg-clip-text  text-transparent">
          Music Flow
        </span>
      </Link>

      {userState.logged ? (
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className={`flex items-center space-x-3 ${
              open ? "bg-[#3A3A5D]" : "bg-[#2A2A4B] hover:bg-[#3A3A5D]"
            } rounded-full px-4 py-2 text-sm text-white transition-all`}
            aria-label="Menú de usuario"
          >
            {smallImage ? (
              <img
                src={smallImage}
                alt="User Avatar"
                className="w-8 h-8 rounded-full object-cover border border-[#1DB954]"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#1DB954] flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
            )}
            <span className="font-medium hidden md:inline-block">
              {getDisplayName()}
            </span>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-64 bg-[#2A2A4B] rounded-lg shadow-xl overflow-hidden border border-[#3A3A5D] animate-fade-in">
              <div className="flex items-center p-4 bg-gradient-to-r from-[#1A1A35] to-[#2A2A4B]">
                {largeImage ? (
                  <img
                    src={largeImage}
                    alt="User Avatar"
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#1DB954]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#1DB954] flex items-center justify-center">
                    <User size={24} className="text-white" />
                  </div>
                )}
                <div className="ml-3 overflow-hidden">
                  <p className="text-sm font-semibold truncate">
                    {getDisplayName()}
                  </p>
                  <p className="text-xs text-gray-300 truncate">
                    {getDisplayEmail()}
                  </p>
                  {userState.user?.spotify && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-[#1DB954] rounded-full">
                      Spotify Conectado
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-[#3A3A5D]">
                <Link
                  to="/settings"
                  className="flex items-center w-full px-4 py-3 text-sm hover:bg-[#3A3A5D] transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <Settings size={16} className="mr-2" />
                  Configuración
                </Link>
                {!userState.user?.spotify && (
                  <button
                    onClick={handleSpotifyConnect}
                    className="flex items-center w-full px-4 py-3 text-sm hover:bg-[#3A3A5D] transition-colors"
                  >
                    <Music size={16} className="mr-2" />
                    {userState.user?.spotify?.refreshToken
                      ? "Desconectar Spotify"
                      : "Conectar Spotify"}
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 text-sm hover:bg-[#3A3A5D] transition-colors text-red-400"
                >
                  <LogOut size={16} className="mr-2" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex space-x-3">
          <Link
            to="/login"
            className="bg-transparent hover:bg-[#3A3A5D] text-white px-4 py-2 rounded-full text-sm font-medium border border-[#3A3A5D] transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/register"
            className="font-bold bg-gradient-to-r from-pink-500 to-blue-500 text-transparent bg-clip-text px-4 py-2 rounded-full text-sm  transition-colors"
          >
            Registrarse
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
