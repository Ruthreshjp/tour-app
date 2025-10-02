import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5175,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
      "/images": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
      "/proxy-image": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      }
    },
  },
  plugins: [react()],
  build: {
    sourcemap: true,
  },
});
