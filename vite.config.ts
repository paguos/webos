import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import { resolve } from 'path'

// Detect build target from environment variable
const buildTarget = process.env.BUILD_TARGET || 'web'
const isExtension = buildTarget === 'extension'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // Only load electron plugin for electron builds
    ...(buildTarget === 'electron' ? [
      electron({
        entry: 'electron/main.cjs'
      })
    ] : [])
  ],
  base: './', // Use relative paths for Electron and Extension
  server: {
    port: 5173,
    open: false // Don't open browser when running Electron
  },
  build: {
    outDir: isExtension ? 'dist-extension' : 'dist',
    sourcemap: false,
    rollupOptions: {
      input: isExtension ? {
        newtab: resolve(process.cwd(), 'extension/newtab.html')
      } : {
        main: resolve(process.cwd(), 'index.html')
      },
      output: {
        manualChunks: isExtension ? undefined : {
          'vendor': ['vue', 'pinia'],
          'draggable': ['vuedraggable']
        },
        // Extension uses predictable filenames (no hashes)
        entryFileNames: isExtension ? 'assets/[name].js' : 'assets/[name]-[hash].js',
        chunkFileNames: isExtension ? 'assets/[name].js' : 'assets/[name]-[hash].js',
        assetFileNames: isExtension ? 'assets/[name].[ext]' : 'assets/[name]-[hash].[ext]'
      }
    }
  }
})
