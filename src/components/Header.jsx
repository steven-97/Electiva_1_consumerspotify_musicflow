import React, { useContext, useEffect, useState } from "react";
import { LogOut, Settings, User } from "lucide-react";
import { Link } from "react-router-dom";
import UserContext from "../auth/contexts/UserContext";
import { getSpotifyUserProfile } from "../auth/hooks/useSpotifyUser";

const Header = () => {
  const [open, setOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { logout, userState } = useContext(UserContext);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (userState.logged && userState.user.token) {
        try {
          setLoading(true);
          const profile = await getSpotifyUserProfile(userState.user.token);

          setUserProfile(profile);
          setLoading(false);
        } catch (err) {
          setLoading(false);
          setError("Error al cargar el perfil del usuario.");
        }
      }
    };

    fetchUserProfile();
  }, [userState]);

  const onLogout = () => {
    logout();
  };

  const smallImage =
    userProfile?.images?.find((img) => img.width === 64)?.url ||
    "default-avatar.jpg";
  const largeImage =
    userProfile?.images?.find((img) => img.width === 300)?.url ||
    "default-avatar.jpg";

  return (
    <header className="w-full  h-22 px-6 py-4 flex justify-between items-center bg-[#1A1A35] text-white shadow-lg">
      <Link to="/" className="flex items-center gap-3">
        <img
          src="/logo.jpg"
          alt="Music Flow logo"
          width={50}
          height={50}
          className="rounded-full"
        />
        <span className="text-2xl font-bold tracking-wide">Music Flow</span>
      </Link>

      {userState.logged ? (
        <div className="relative">
          {loading ? (
            <span className="text-sm text-gray-400">Cargando...</span>
          ) : error ? (
            <span className="text-sm text-red-500">{error}</span>
          ) : (
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center space-x-3 bg-[#2A2A4B] hover:bg-[#3A3A5D] rounded-full px-4 py-2 text-sm text-white transition-all"
            >
              {smallImage ? (
                <img
                  src={smallImage}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <User size={20} />
              )}
              <span className="font-medium">
                {userProfile?.display_name || "Usuario"}
              </span>
            </button>
          )}

          {open && (
            <div className="absolute right-0 mt-2 w-56 bg-[#2A2A4B] rounded-lg shadow-lg overflow-hidden border border-[#3A3A5D]">
              <div className="flex items-center p-4 bg-[#3A3A5D]">
                <img
                  src={largeImage}
                  alt="User Avatar Large"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="ml-3 truncate">
                  <p className="text-sm font-semibold">{userProfile?.display_name || "Usuario"}</p>
                  <p className="text-xs text-gray-300">{userProfile?.email || "Sin correo"}</p>
                </div>
              </div>
              <button className="w-full text-left px-4 py-3 text-sm hover:bg-[#3A3A5D] flex items-center gap-2">
                <Settings size={16} /> Configuración
              </button>
              <button
                onClick={onLogout}
                className="w-full text-left px-4 py-3 text-sm hover:bg-[#3A3A5D] flex items-center gap-2"
              >
                <LogOut size={16} /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-x-4">
          <button className="bg-[#1DB954] hover:bg-[#1AA84C] text-white px-4 py-2 rounded-full text-sm font-medium">
            Iniciar sesión
          </button>
          <button className="bg-gray-100 hover:bg-gray-200 text-[#1A1A35] px-4 py-2 rounded-full text-sm font-medium">
            Registrarse
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;