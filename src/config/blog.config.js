// Configuration centralisée du blog MDMC
const BLOG_CONFIG = {
  BASE_URL: import.meta.env.VITE_BLOG_URL || 'https://blog.mdmcmusicads.com',
  RSS_URL: (import.meta.env.VITE_BLOG_URL || 'https://blog.mdmcmusicads.com') + '/feed/',
  API_URL: (import.meta.env.VITE_BLOG_URL || 'https://blog.mdmcmusicads.com') + '/wp-json/wp/v2',
  CORS_PROXY: 'https://api.allorigins.win/raw?url=',
  TIMEOUT: 15000,
  // Utiliser le proxy CORS par défaut à cause des restrictions CSP
  USE_CORS_PROXY: true,
  // Limites et configuration
  MAX_ARTICLES: 3,
  MAX_EXCERPT_LENGTH: 150,
  MAX_RETRY_COUNT: 3
};

export default BLOG_CONFIG;