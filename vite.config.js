import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Settings from .env are exposed to the app only if they use one of these prefixes.
// See config/settings.js — the app reads settings there, never from hard-coded strings.
export default defineConfig({
  plugins: [react()],
  envPrefix: ["VITE_", "MAP_", "DATA_", "STUDY_"],
  // /api/* is served by server/index.js (npm run server), which holds API keys from .env.
  server: { port: 5173, proxy: { "/api": "http://localhost:8787" } },
});
