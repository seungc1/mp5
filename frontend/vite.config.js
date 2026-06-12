import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:8080",
      "/books": "http://localhost:8080",
      // 백엔드 uploads/ 폴더를 /videos/** 로 서빙하는 Spring 정적 핸들러로 연결
      "/videos": "http://localhost:8080",
    },
  },
})
