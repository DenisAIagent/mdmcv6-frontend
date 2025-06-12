// src/config/api.config.js

const API_CONFIG = {
  // URL du backend - Production
  BASE_URL: process.env.VITE_API_URL || 'https://mdmcv4-backend-production-b615.up.railway.app/api',
  
  // Timeout pour les requêtes (10 secondes)
  TIMEOUT: 10000,
  
  // Headers par défaut
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Configuration CORS
  WITH_CREDENTIALS: true,
};

// Configuration pour différents environnements
const ENV_CONFIG = {
  development: {
    BASE_URL: 'http://localhost:5001/api',
  },
  production: {
    BASE_URL: 'https://mdmcv4-backend-production-b615.up.railway.app/api',
  }
};

// Détecter l'environnement et ajuster la config
const currentEnv = process.env.VITE_ENVIRONMENT || 'production';
if (ENV_CONFIG[currentEnv]) {
  Object.assign(API_CONFIG, ENV_CONFIG[currentEnv]);
}

// Debug en développement
if (currentEnv === 'development') {
  console.log('🔍 API Config:', {
    Environment: currentEnv,
    Base_URL: API_CONFIG.BASE_URL,
    Frontend_URL: window.location.origin
  });
}

export default API_CONFIG;
