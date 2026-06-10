import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// 추가: React Router 사용을 위한 BrowserRouter import
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);