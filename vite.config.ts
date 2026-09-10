import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Freebuff runs the local Convex backend on port 3210; the app talks to it
// through the same-origin /convex-url proxy (see useConvexUrl in src/App.tsx).
const CONVEX_LOCAL = process.env.CONVEX_LOCAL_URL || "http://127.0.0.1:3210";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Split heavy vendors into cacheable chunks so the core bundle stays
        // small for 30 teams on venue wifi. Path matching catches the CJS
        // internals (react-dom/cjs etc.) that entry-name matching misses.
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("framer-motion")) return "motion";
          if (id.includes("/convex/")) return "convex";
          if (id.includes("react-dom") || /[\\/]react[\\/]/.test(id) || id.includes("scheduler")) {
            return "react";
          }
          return undefined; // lucide icons + app code stay in index
        },
      },
    },
  },
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
