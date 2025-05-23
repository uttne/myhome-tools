import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import dotenv from "dotenv";
import path from "path";

dotenv.config({path: path.resolve(__dirname, "./../terraform/.env.cognito")});

// https://vite.dev/config/
export default defineConfig({
  base: "/", // GitHub Pages でデプロイする場合は "/repo名/" に変更
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        // 127.0.0.1 で起動している場合 localhost では接続できない
        target: "http://127.0.0.1:8888/",
        changeOrigin: true,
      },
    },
    host: true,
    allowedHosts:[
      ".trycloudflare.com",
    ]
  },
});
