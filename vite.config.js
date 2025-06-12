import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  
  // Résolution des paths et alias
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/assets': path.resolve(__dirname, './src/assets'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
  },

  // Configuration build pour Railway
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2015',
    
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material']
        }
      },
      
      // Gestion des warnings dynamiques
      onwarn(warning, warn) {
        // Ignore "use client" warnings de MUI
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return
        
        // Ignore dynamic import warnings si c'est voulu
        if (warning.code === 'DYNAMIC_IMPORT') return
        
        warn(warning)
      }
    }
  },

  // Configuration pour preview/serve
  preview: {
    port: process.env.PORT || 3000,
    host: '0.0.0.0'
  },

  server: {
    port: 3000,
    host: '0.0.0.0'
  }
}) 