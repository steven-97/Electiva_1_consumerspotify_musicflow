import { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../contexts/UserContext";

export const CallbackPage = () => {
  const { handleSpotifyCallback, userState } = useContext(UserContext);
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (code) {
        const success = await handleSpotifyCallback();
        setIsProcessing(false);

        if (success && userState.logged) {
          navigate("/", { replace: true });
        }
      }
    };

    processAuth();
  }, []);

  useEffect(() => {
    if (!isProcessing && userState.logged) {
      navigate("/", { replace: true });
    }
  }, [userState.logged, isProcessing]);

  return <div className="text-center p-8">Procesando autenticación...</div>;
};
