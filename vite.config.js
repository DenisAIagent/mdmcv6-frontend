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
    port: 3001,
    host: "localhost",
    middlewareMode: false,
    // Redirection pour les routes admin vers HashRouter
    configure: (app) => {
      app.use('/admin*', (req, res, next) => {
        if (req.path.startsWith('/admin') && !req.path.includes('#')) {
          const redirectPath = `/#${req.path}`;
          res.redirect(302, redirectPath);
        } else {
          next();
        }
      });
    }
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