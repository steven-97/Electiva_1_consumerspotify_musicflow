import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { UserProvider } from "./auth/contexts/UserProvider.jsx";
import { AppRouter } from "./router/AppRouter.jsx";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <AppRouter />
      </BrowserRouter>
    </UserProvider>
  </StrictMode>
);
