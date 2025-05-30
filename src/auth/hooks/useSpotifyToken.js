import { useContext, useEffect, useState } from "react";
import UserContext from "../contexts/UserContext";
import { toast } from "react-hot-toast";

export const useSpotifyToken = () => {
  const { userState, dispatch } = useContext(UserContext);
  const [validToken, setValidToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getValidToken = async () => {
      if (!userState.user?.spotify?.accessToken) {
        setLoading(false);
        return;
      }

      const { accessToken, refreshToken, expiresAt } = userState.user.spotify;

      if (Date.now() < expiresAt) {
        setValidToken(accessToken);
        setLoading(false);
        return;
      }

      try {
        const newTokenData = await refreshSpotifyToken(refreshToken);
        
        const updatedUser = {
          ...userState.user,
          spotify: {
            ...userState.user.spotify,
            ...newTokenData,
          },
        };

        await setDoc(doc(db, "users", userState.user.uid), updatedUser, { merge: true });
        
        localStorage.setItem("user", JSON.stringify(updatedUser));
        dispatch({
          type: authTypes.updateUser,
          payload: updatedUser,
        });

        setValidToken(newTokenData.accessToken);
      } catch (error) {
        toast.error("La sesión de Spotify ha expirado. Por favor, reconecta tu cuenta.");
      } finally {
        setLoading(false);
      }
    };

    getValidToken();
  }, [userState.user]);

  return { token: validToken, loading };
};