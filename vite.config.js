import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src') // Ensures '@/components' works
    },
  },
  preview:{
    host:true,
    port:8080
  },
  optimizeDeps: {
    exclude: [
      // Add the paths of the problematic dependencies here
      '/node_modules/.vite/deps/chunk-WA7HSD3A.js',
      '/node_modules/.vite/deps/chunk-BZHC2YG4.js',
    ],
  },
  server: {
    watch: {
      usePolling: true,
    },
    host: true, // needed for the Docker Container port mapping to work
    strictPort: true,
    port: 8080, // you can replace this port with any port
  }
})
