import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  root: 'app',
  plugins: [react()],
  base: './',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./app/index.html', import.meta.url)),
        district: fileURLToPath(new URL('./app/district.html', import.meta.url)),
      },
    },
  },
})
