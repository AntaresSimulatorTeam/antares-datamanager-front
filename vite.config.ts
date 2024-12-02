/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

const DEFAULT_PORT = 8080;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        format: 'es',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        manualChunks(id) {
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
