import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "@fontsource/inter/index.css";
import { BrowserRouter as Router } from "react-router-dom";

import App from "./App.tsx";

import "./amplifyConfig.ts";
import { NotificationProvider } from "./parts/Notification.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </Router>
  </StrictMode>
);
