// vite.config.js
import { defineConfig } from 'vite';
import copy from 'rollup-plugin-copy'; // Make sure to install the rollup-plugin-copy package

export default defineConfig({
  // other Vite configurations...

  build: {
    outDir: 'dist',
    assetsDir: 'assets', // Optional: You can change this directory if needed
    rollupOptions: {
      input: 'index.html',
      plugins: [
        copy({
          targets: [
            { src: 'js/*', dest: 'dist' },
            { src: 'become-host/*', dest: 'dist' },
            { src: 'auth/*', dest: 'dist' },
            { src: 'assets/*', dest: 'dist' },
            { src: 'addSong/*', dest: 'dist' },
            { src: 'terms-and-conditions/*', dest: 'dist' }
          ],
          hook: 'writeBundle' // Copy after bundling
        })
      ]
    }
  }
});
