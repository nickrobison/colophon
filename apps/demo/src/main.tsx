import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@nickrobison/colophon/foundation.css";
import "@nickrobison/colophon/components.css";
import "./demo.css";
import { App } from "./App";
const root = document.getElementById("root");
if (!root) throw new Error("#root not found");
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
