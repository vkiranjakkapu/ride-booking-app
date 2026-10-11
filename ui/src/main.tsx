import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import AuthenticationContextProvider from "./context/auth/AuthenticationContextProvider.tsx";
import NotificationsContextProvider from "./context/notifications/NotificationsContextProvider.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <NotificationsContextProvider>
            <AuthenticationContextProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </AuthenticationContextProvider>
        </NotificationsContextProvider>
    </StrictMode>,
);
