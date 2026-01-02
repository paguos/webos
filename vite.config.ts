import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    electron({
      entry: 'electron/main.cjs'
    })
  ],
  base: './', // Use relative paths for Electron
  server: {
    port: 5173,
    open: false // Don't open browser when running Electron
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'pinia'],
          'draggable': ['vuedraggable']
        }
      }
    }
  }
})
