import { useContext, useEffect, useState } from "react";
import UserContext from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";

export const CallbackPage = () => {
  const { handleSpotifyCallback } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      const success = await handleSpotifyCallback();
      if (success) {
        toast.success("Vinculación exitosa");
        navigate("/", { replace: true });
      } else {
        navigate("/login");
      }
    };

    processCallback();
  }, []);

  return <div>Cargando...</div>;
};