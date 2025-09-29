import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [tailwindcss(), basicSsl()],
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
