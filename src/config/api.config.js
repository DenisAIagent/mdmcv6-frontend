 // src/config/api.config.js

  const API_CONFIG = {
    // URL du backend - Production avec custom domain  
    BASE_URL: 'https://api.mdmcmusicads.com/api',

    // Timeout pour les requêtes (30 secondes)
    TIMEOUT: 30000,

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
      BASE_URL: 'https://api.mdmcmusicads.com/api',
    }
  };

  // Détecter l'environnement et ajuster la config
  const currentEnv = import.meta.env.MODE || 'production';
  if (ENV_CONFIG[currentEnv]) {
    Object.assign(API_CONFIG, ENV_CONFIG[currentEnv]);
  }

  // Debug pour toujours voir la config
  console.log('🔍 API Config:', {
    Environment: currentEnv,
    Base_URL: API_CONFIG.BASE_URL,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    Frontend_URL: window.location.origin
  });

  export default API_CONFIG;
