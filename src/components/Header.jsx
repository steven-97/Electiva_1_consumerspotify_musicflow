import React, { useContext, useState, useEffect } from "react";
import { LogOut, Settings, User, Music } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import UserContext from "../auth/contexts/UserContext";
import { getSpotifyUserProfile } from "../auth/hooks/useSpotifyUser";

const Header = () => {
  const [open, setOpen] = useState(false);
  const [spotifyProfile, setSpotifyProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const { logout, userState } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSpotifyProfile = async () => {
      console.log("userState", userState);

      if (userState.logged && userState.user?.spotify?.token) {
        try {
          setLoading(true);
          const profile = await getSpotifyUserProfile(
            userState.user.spotify.token
          );
          setSpotifyProfile(profile);
        } catch (err) {
          console.error("Error al cargar perfil de Spotify:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSpotifyProfile();
  }, [userState]);

  console.log("------", spotifyProfile);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/login");
  };

  // Obtener imagen del usuario (Spotify, Google o default)
  const getUserImage = (size = "small") => {
    if (spotifyProfile?.images?.length > 0) {
      const img = spotifyProfile.images.find((img) =>
        size === "large" ? img.width >= 300 : img.width === 64
      );
      return img?.url;
    }
    return userState.user?.photoURL || null;
  };

  // Obtener nombre para mostrar
  const getDisplayName = () => {
    return (
      spotifyProfile?.display_name ||
      userState.user?.displayName ||
      userState.user?.email?.split("@")[0] ||
      "Usuario"
    );
  };

  // Obtener email para mostrar
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
        <div className="bg-[#1DB954] p-2 rounded-full">
          <Music size={24} className="text-white" />
        </div>
        <span className="text-2xl font-bold tracking-wide bg-gradient-to-r from-[#1DB954] to-[#4B00FF] bg-clip-text text-transparent">
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
                  <Link
                    to="/connect-spotify"
                    className="flex items-center w-full px-4 py-3 text-sm hover:bg-[#3A3A5D] transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <Music size={16} className="mr-2" />
                    Conectar Spotify
                  </Link>
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
            className="bg-[#1DB954] hover:bg-[#1AA84C] text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
          >
            Registrarse
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
