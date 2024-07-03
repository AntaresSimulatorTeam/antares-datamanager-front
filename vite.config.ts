/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import path from 'path';
import { defineConfig } from "vite";

const DEFAULT_PORT = 8080;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: "esnext",
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/testSetup.ts",
  },
  server: {
    port: DEFAULT_PORT,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  esbuild: {
    supported: {
      "top-level-await": true,
    },
  },
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
  },
});
