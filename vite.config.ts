import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Freebuff runs the local Convex backend on port 3210; the app talks to it
// through the same-origin /convex-url proxy (see useConvexUrl in src/App.tsx).
const CONVEX_LOCAL = process.env.CONVEX_LOCAL_URL || "http://127.0.0.1:3210";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: Number(process.env.PORT || 5173),
    strictPort: false,
    hmr: false,
    proxy: {
      "/convex-url": {
        target: CONVEX_LOCAL,
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/convex-url/, ""),
      },
    },
  },
  preview: {
    host: "0.0.0.0",
    port: Number(process.env.PORT || 4173),
  },
});
