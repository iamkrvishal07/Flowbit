import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'supportTicketsApp',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.jsx',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  server: {
    port: 3001,
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'OPTIONS'],
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
})
