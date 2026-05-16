import path from "path";
import { fileURLToPath } from "url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Repo root (parent of `client/`) — same `.env` as the API uses.
const repoRoot = path.resolve(__dirname, "..");

export default defineConfig(({ mode }) => {
  loadEnv(mode, repoRoot, "");
  return {
    // Load `.env*` from monorepo root so `VITE_*` keys live next to server vars.
    envDir: repoRoot,
    plugins: [react()],
    optimizeDeps: {
      include: [
        "react",
        "react/jsx-runtime",
        "react-dom",
        "react-dom/client",
        "react-router-dom",
        "@react-oauth/google",
        "framer-motion",
      ],
    },
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: "http://localhost:5000",
          changeOrigin: true,
        },
        "/socket.io": {
          target: "http://localhost:5000",
          changeOrigin: true,
          ws: true,
        },
        "/sitemap.xml": {
          target: "http://localhost:5000",
          changeOrigin: true,
        },
        "/robots.txt": {
          target: "http://localhost:5000",
          changeOrigin: true,
        },
      },
    },
  };
});
