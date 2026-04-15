import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // ── Dev server ─────────────────────────────────────────────────
  server: {
    port: 5173,
    // Proxy API requests to the backend — eliminates CORS issues in dev
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // ── Build optimization ─────────────────────────────────────────
  build: {
    // Source maps for debugging production issues
    sourcemap: true,

    // Code splitting — separate vendor chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — changes rarely, cached aggressively
          vendor: ["react", "react-dom"],
          // Router — changes rarely
          router: ["react-router-dom"],
        },
      },
    },

    // Warn on large chunks (> 500 KB)
    chunkSizeWarningLimit: 500,
  },
});
