import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})

/*
  server: {
    proxy: {
      '/json': {
        target: 'https://api.radio-browser.info',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/json/, ''),
      },
    },
  }, */