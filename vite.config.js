import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { compression } from 'vite-plugin-compression'
import { ViteImageOptimize } from 'vite-plugin-imagemin'
import { splitVendorChunkPlugin } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    
    // Compression Gzip/Brotli
    compression({
      algorithm: 'gzip',
      threshold: 1024,
      deleteOriginFile: false
    }),
    compression({
      algorithm: 'brotliCompress',
      threshold: 1024,
      deleteOriginFile: false
    }),
    
    // Optimisation images
    ViteImageOptimize({
      gifsicle: { optimizationLevel: 7 },
      mozjpeg: { quality: 85 },
      optipng: { optimizationLevel: 7 },
      pngquant: { quality: [0.8, 0.9] },
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'removeEmptyAttrs', active: true }
        ]
      },
      webp: { quality: 85 }
    }),
    
    // Split vendor chunks pour better caching
    splitVendorChunkPlugin(),
    
    // Bundle analyzer (dev only)
    process.env.ANALYZE && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ],
  
  // Optimisation build
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks séparés
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          router: ['react-router-dom'],
          utils: ['lodash', 'date-fns']
        }
      }
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 500
  },
  
  // Preview server
  preview: {
    port: 4173,
    host: true
  },
  
  // Dev server
  server: {
    port: 3000,
    host: true,
    open: true
  },
  
  // Alias pour imports courts
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@assets': '/src/assets',
      '@services': '/src/services',
      '@utils': '/src/utils'
    }
  }
})
