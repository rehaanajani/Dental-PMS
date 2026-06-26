import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron/simple';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  root: path.join(__dirname, 'src/renderer'),
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
  },
  plugins: [
    react(),
    electron({
      main: {
        entry: path.join(__dirname, 'src/main/main.ts'),
        vite: {
          build: {
            outDir: path.join(__dirname, 'dist-electron'),
          },
        },
      },
      preload: {
        input: path.join(__dirname, 'src/main/preload.ts'),
        vite: {
          build: {
            outDir: path.join(__dirname, 'dist-electron'),
          },
        },
      },
      renderer: {},
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/renderer/src'),
    },
  },
});
