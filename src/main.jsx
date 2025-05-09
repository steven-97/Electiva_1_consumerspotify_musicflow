import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { UserProvider } from "./auth/contexts/UserProvider.jsx";
import { AppRouter } from "./router/AppRouter.jsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
    </UserProvider>
  </StrictMode>
);
