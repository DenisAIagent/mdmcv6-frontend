import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Headers de sécurité et CSP
app.use((req, res, next) => {
  console.log('🔒 Setting security headers for:', req.path);
  
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff'); 
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  const cspPolicy = "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://cdnjs.cloudflare.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https: https://via.placeholder.com; " +
    "media-src 'self' blob: data: https: https://res.cloudinary.com; " +
    "connect-src 'self' https://api.mdmcmusicads.com https://region1.google-analytics.com https://ipapi.co;";
  
  res.setHeader('Content-Security-Policy', cspPolicy);
  console.log('🔒 CSP Policy set:', cspPolicy.substring(0, 100) + '...');
  
  next();
});

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'dist')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// SPA fallback - toutes les routes renvoient index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Health check available at http://localhost:${PORT}/health`);
});