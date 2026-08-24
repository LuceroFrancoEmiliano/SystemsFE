import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    open: false,
    cors: true,
    allowedHosts: true
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
  }
});
