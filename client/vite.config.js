import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
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
});
