import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import AuthenticationContextProvider from "./context/auth/AuthenticationContextProvider.tsx";
import ToastsContextProvider from "./context/toasts/ToastsContextProvider.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <AuthenticationContextProvider>
                <ToastsContextProvider>
                    <App />
                </ToastsContextProvider>
            </AuthenticationContextProvider>
        </BrowserRouter>
    </StrictMode>,
);
