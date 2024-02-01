import topLevelAwait from 'vite-plugin-top-level-await';
import { resolve } from 'path';
import pkg from 'fs-extra';
const { copy } = pkg;
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
        addSong: resolve(__dirname, 'addSong/index.html'),
        'qrcode-template': resolve(__dirname, 'qrcode-template/index.html'),
        'terms-and-conditions-us': resolve(
          __dirname,
          'terms-and-conditions/us/index.html'
        ),
        'terms-and-conditions-spotify': resolve(
          __dirname,
          'terms-and-conditions/spotify/index.html'
        )
      }
    }
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
        await copy(
          resolve(__dirname, 'assets'),
          resolve(__dirname, 'dist/assets')
        );
      }
    }
  ]
});
