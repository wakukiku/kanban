import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BoardProvider } from "./context/BoardContext";
import { LanguageProvider } from "./context/LanguageContext";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LanguageProvider>
      <BoardProvider>
        <App />
      </BoardProvider>
    </LanguageProvider>
  </React.StrictMode>,
);
