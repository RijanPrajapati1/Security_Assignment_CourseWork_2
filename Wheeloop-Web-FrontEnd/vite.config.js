// vite.config.js
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import fs from 'fs'; 
import path from 'path'; 

const certPath = path.resolve(__dirname, 'server.crt');
const keyPath = path.resolve(__dirname, 'server.key');

export default defineConfig({
  plugins: [
    react(),

  ],
  server: {
    host: true,
    port: 5173,
    https: { 
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    }
  }
});