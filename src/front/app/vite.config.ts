import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    proxy: {
      '/uploads': {
        target: 'https://nginx',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
