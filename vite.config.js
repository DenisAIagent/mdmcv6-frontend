import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild"
  },
  
  server: {
    port: 3000,
    host: "localhost",
    // Support des routes SPA avec fallback
    proxy: {},
    cors: true,
    open: true
  },
  
  preview: {
    port: process.env.PORT || 3000,
    host: "0.0.0.0",
    allowedHosts: [
      "healthcheck.railway.app",
      ".railway.app",
      "localhost",
      "www.mdmcmusicads.com",
      "mdmcmusicads.com",
      ".mdmcmusicads.com",
      "blog.mdmcmusicads.com"
    ]
  }
})