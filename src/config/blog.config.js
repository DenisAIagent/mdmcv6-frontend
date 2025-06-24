// src/config/blog.config.js
const BLOG_CONFIG = {
  // URL de base de votre blog WordPress (hébergé sur Railway)
  BASE_URL: import.meta.env.VITE_BLOG_URL || 'https://blog-wp-production.up.railway.app',
  
  // Flux RSS (WordPress génère automatiquement /feed/)
  RSS_URL: (import.meta.env.VITE_BLOG_URL || 'https://blog-wp-production.up.railway.app') + '/feed/',
  
  // API WordPress REST (si on veut utiliser l'API au lieu du RSS)
  API_URL: (import.meta.env.VITE_BLOG_URL || 'https://blog-wp-production.up.railway.app') + '/wp-json/wp/v2',
  
  // Configuration par défaut
  ARTICLES_LIMIT: 3,
  TIMEOUT: 15000, // 15 secondes
  
  // Proxy CORS (pour éviter les problèmes de CORS)
  CORS_PROXY: 'https://api.allorigins.win/raw?url=',
  
  // Images de fallback thématiques
  FALLBACK_IMAGES: [
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop&q=80', // Music marketing
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop&q=80', // Analytics  
    'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=250&fit=crop&q=80'  // Technology
  ]
};

// Validation de la configuration au chargement
const validateConfig = () => {
  if (!BLOG_CONFIG.BASE_URL.startsWith('http')) {
    console.error('❌ BLOG_CONFIG: URL de base invalide:', BLOG_CONFIG.BASE_URL);
  }
  
  console.log('🔍 Configuration Blog:', {
    'Base URL': BLOG_CONFIG.BASE_URL,
    'RSS URL': BLOG_CONFIG.RSS_URL,
    'Environment': import.meta.env.MODE
  });
};

// Valider au chargement du module
validateConfig();

export default BLOG_CONFIG;
