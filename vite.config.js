import { resolve } from 'path';
import pkg from 'fs-extra';
const { copy } = pkg;
import { defineConfig } from 'vite';
import topLevelAwait from 'vite-plugin-top-level-await'; // Import the top-level await plugin

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'become-host': resolve(__dirname, 'become-host/index.html'),
        auth_process: resolve(__dirname, 'auth/process.html'),
        auth_error: resolve(__dirname, 'auth/error.html'),
        auth_success: resolve(__dirname, 'auth/success.html'),
        addSong: resolve(__dirname, 'addSong/index.html'),
        'qrcode-template': resolve(__dirname, 'qrcode-template/index.html'),
        'terms-and-conditions-us': resolve(
          __dirname,
          'terms-and-conditions/us/index.html'
        ),
        'terms-and-conditions-spotify': resolve(
          __dirname,
          'terms-and-conditions/spotify/index.html'
        ),
        dashboard: resolve(__dirname, 'dashboard/index.html'),
        'service-worker': resolve(__dirname, 'js/service-worker.js'), // Assuming service-worker.js is located in the 'js' folder,
        404: resolve(__dirname, 'error/404.html')
      }
    },
    // Output to the root 'dist' directory
    outDir: resolve(__dirname, 'dist')
  },
  plugins: [
    topLevelAwait({
      // The export name of top-level await promise for each chunk module
      promiseExportName: '__tla',
      // The function to generate import names of top-level await promise in each chunk module
      promiseImportName: (i) => `__tla_${i}`
    }),
    {
      name: 'copy-assets',
      async writeBundle() {
        // Copy assets to the 'dist' folder
        await copy(
          resolve(__dirname, 'assets'),
          resolve(__dirname, 'dist/assets')
        );

        // Copy service-worker.js to the 'dist/js' folder
        await copy(
          resolve(__dirname, 'js/service-worker.js'),
          resolve(__dirname, 'dist/js/service-worker.js')
        );
      }
    }
  ]
});
