import topLevelAwait from 'vite-plugin-top-level-await';

import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'become-host': resolve(__dirname, 'become-host/index.html'),
        auth_process: resolve(__dirname, 'auth/process.html'),
        auth_error: resolve(__dirname, 'auth/error.html'),
        auth_success: resolve(__dirname, 'auth/success.html'),
        addSong: resolve(__dirname, 'addSong/index.html')
      }
    }
  },
  plugins: [
    topLevelAwait({
      // The export name of top-level await promise for each chunk module
      promiseExportName: '__tla',
      // The function to generate import names of top-level await promise in each chunk module
      promiseImportName: (i) => `__tla_${i}`
    })
  ]
});
