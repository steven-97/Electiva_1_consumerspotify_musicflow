import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../auth/pages/LoginPage";
import { useContext } from "react";
import UserContext from "../auth/contexts/UserContext";
import PlaylistPage from "../pages/PlaylistPage";
import { CallbackPage } from "../auth/pages/CallbackPage";
import SongPage from "../pages/SongPage";

export const AppRouter = () => {
  const {
    userState: { logged },
  } = useContext(UserContext);

  return (
    <Routes>
      {!logged ? (
        <>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/callback" element={<CallbackPage />} />
          <Route path="/*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <>
          <Route path="/" element={<HomePage />} />
          <Route path="/callback" element={<CallbackPage />} />
          <Route path="/playlist/:id" element={<PlaylistPage />} />
          <Route path="/song/:id" element={<SongPage />} />
          <Route path="/*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  );
};
