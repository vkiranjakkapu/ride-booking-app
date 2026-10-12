import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import AuthenticationContextProvider from "./context/auth/AuthenticationContextProvider.tsx";
import ToastsContextProvider from "./context/toasts/ToastsContextProvider.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ToastsContextProvider>
            <AuthenticationContextProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </AuthenticationContextProvider>
        </ToastsContextProvider>
    </StrictMode>,
);
