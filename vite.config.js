import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/services": path.resolve(__dirname, "./src/services"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/pages": path.resolve(__dirname, "./src/pages"),
      "@/hooks": path.resolve(__dirname, "./src/hooks"),
      "@/utils": path.resolve(__dirname, "./src/utils"),
      "@/assets": path.resolve(__dirname, "./src/assets"),
    },
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json"]
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild",
    target: "es2015",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          mui: ["@mui/material", "@mui/icons-material", "@mui/x-data-grid"],
          form: ["@hookform/resolvers", "zod", "react-hook-form"]
        }
      },
      onwarn(warning, warn) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") return
        if (warning.code === "DYNAMIC_IMPORT") return
        if (warning.code === "UNRESOLVED_IMPORT") return
        if (warning.message.includes("dynamic import")) return
        warn(warning)
      }
    }
  },
  preview: {
    port: process.env.PORT || 3000,
    host: "0.0.0.0"
  },
  server: {
    port: 3000,
    host: "0.0.0.0"
  }
})