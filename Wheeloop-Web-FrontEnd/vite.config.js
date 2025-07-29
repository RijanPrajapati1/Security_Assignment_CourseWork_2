// vite.config.js
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
// import basicSsl from '@vitejs/plugin-basic-ssl'; // <-- You can remove or comment out this line now!
import fs from 'fs'; // <-- Add this line
import path from 'path'; // <-- Add this line

// Define the paths to your mkcert-generated certificate files
// Assuming server.crt and server.key are in the root of your frontend project
// If they are in a different folder, adjust the path.join accordingly.
const certPath = path.resolve(__dirname, 'server.crt');
const keyPath = path.resolve(__dirname, 'server.key');

export default defineConfig({
  plugins: [
    react(),
    // basicSsl() // <-- REMOVE or COMMENT OUT this plugin!
  ],
  server: {
    host: true,
    port: 5173,
    https: { // <-- Modify this HTTPS configuration
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    }
  }
});