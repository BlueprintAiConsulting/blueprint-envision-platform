import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    // API key is NOT injected into the client bundle.
    // All Gemini calls are proxied through the backend server (server.ts).
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        // Forward all /api/* requests to the Express backend in dev
        '/api': {
          target: 'http://localhost:3002',
          changeOrigin: true,
        },
      },
    },
  };
});
