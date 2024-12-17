/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import topLevelAwait from 'vite-plugin-top-level-await';
var DEFAULT_PORT = 8080;
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    topLevelAwait({
      // The export name of top-level await promise for each chunk module
      promiseExportName: '__tla',
      // The function to generate import names of top-level await promise in each chunk module
      promiseImportName: function (i) {
        return '__tla_'.concat(i);
      },
    }),
  ],
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        format: 'es',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        manualChunks: function (id) {
          if (/envVariables.ts/.test(id)) {
            return 'envVariables';
          }
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/testSetup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text'],
      exclude: ['src/*.test.ts', 'src/shared/**', 'src/components/common/**'],
    },
  },
  server: {
    port: DEFAULT_PORT,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@common': path.resolve(__dirname, './src/components/common'),
    },
  },
  esbuild: {
    supported: {
      'top-level-await': true,
    },
  },
  define: {
    APP_VERSION: JSON.stringify(process.env.APP_VERSION),
  },
  publicDir: './public',
});
