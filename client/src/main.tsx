import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.js";
import "./style.css";
import "flag-icons/css/flag-icons.min.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find root element");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
