import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    proxy:{
      "/api":{
        // 127.0.0.1 で起動している場合 localhost では接続できない
        target: "http://127.0.0.1:8888/",
        changeOrigin: true,
      }
    }
  }
})
