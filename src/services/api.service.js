// src/services/api.service.js - Version Complète Finale

const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'development' ? '/api' : 'https://mdmcv4-backend-production-b615.up.railway.app/api');
const API_TIMEOUT = 10000;

console.log('🔧 API Service Config:', {
  baseURL: API_BASE_URL,
  environment: import.meta.env.MODE,
  timestamp: new Date().toISOString()
});

// Fallback uniquement pour les reviews (données réelles clients)
const FALLBACK_REVIEWS = {
  success: true,
  data: [
    {
      _id: 'sidilarsen1',
      name: 'David',
      title: 'Chanteur de Sidilarsen',
      rating: 5,
      message: "Avant MDMC, notre chaîne YouTube stagnait. Depuis, on a franchi un vrai cap : millions de vues, abonnés x4, impact direct sur notre carrière. Collaboration ultra efficace.",
      createdAt: new Date().toISOString(),
      avatar: null
    },
    {
      _id: 'mox1',
      name: 'Isabelle Fontan',
      title: 'MOX Musique',
      rating: 5,
      message: "Denis est un professionnel fiable, sérieux, réactif et surtout efficace. Il m'a conseillé au mieux sur de nombreuses campagnes, avec des résultats très satisfaisants. L'expert Google Ads qu'il vous faut !",
      createdAt: '2023-02-03T00:00:00.000Z',
      avatar: null
    },
    {
      _id: 'trydye1',
      name: 'Fred Tavernier',
      title: 'Try & Dye Records',
      rating: 5,
      message: "Cela fait plusieurs années que nous collaborons avec Denis sur les campagnes clips de nos artistes (dont OUTED). Communication fluide, résultats au rendez-vous, Denis s'adapte à nos besoins et nos budgets avec réactivité.",
      createdAt: '2023-02-03T00:00:00.000Z',
      avatar: null
    },
    {
      _id: 'mlh1',
      name: "Manon L'Huillier",
      title: 'MLH Promotion',
      rating: 5,
      message: "Un travail efficace à chaque collaboration. Denis a su être à l'écoute de nos attentes et proposer des stratégies adaptées aux deadlines et aux budgets imposés.",
      createdAt: '2019-07-09T00:00:00.000Z',
      avatar: null
    }
  ]
};

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.timeout = API_TIMEOUT;
  }

  async request(endpoint, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const config = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers
        },
        credentials: 'include',
        signal: controller.signal,
        ...options
      };

      console.log('📤 API Request:', {
        method: config.method,
        url: `${this.baseURL}${endpoint}`,
        headers: config.headers
      });

      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      clearTimeout(timeoutId);

      console.log('📥 API Response:', {
        status: response.status,
        url: `${this.baseURL}${endpoint}`
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Délai d\'attente dépassé');
      }
      
      console.error('❌ API Error:', error);
      throw error;
    }
  }

  // SERVICE REVIEWS - Avec fallback car données marketing importantes
  reviews = {
    getReviews: async (params = {}) => {
      try {
        console.log('🔍 Reviews: Chargement via API...', params);
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/reviews${queryString ? `?${queryString}` : ''}`;
        
        const response = await this.request(endpoint);
        return response;
      } catch (error) {
        console.warn('⚠️ Reviews: API indisponible, fallback activé');
        console.log('🔄 Reviews: Utilisation des données de fallback');
        return FALLBACK_REVIEWS;
      }
    },

    createReview: async (reviewData) => {
      try {
        console.log('📤 Reviews: Soumission via API...', reviewData);
        return await this.request('/reviews', {
          method: 'POST',
          body: JSON.stringify(reviewData)
        });
      } catch (error) {
        console.warn('⚠️ Reviews: Soumission échouée, mode simulation');
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { success: true, message: 'Avis soumis (mode démo)' };
      }
    }
  };

  // SERVICE AUTH
  auth = {
    getMe: async () => {
      try {
        console.log('🔐 Auth: Vérification statut utilisateur...');
        return await this.request('/auth/me');
      } catch (error) {
        console.warn('🔐 Auth: Non authentifié');
        return { success: false, error: 'Non authentifié' };
      }
    },

    login: async (credentials) => {
      try {
        console.log('🔐 Auth: Tentative de connexion...', { email: credentials.email });
        return await this.request('/auth/login', {
          method: 'POST',
          body: JSON.stringify(credentials)
        });
      } catch (error) {
        console.error('🔐 Auth: Erreur de connexion', error);
        throw error;
      }
    },

    logout: async () => {
      try {
        console.log('🔐 Auth: Déconnexion...');
        return await this.request('/auth/logout', { method: 'POST' });
      } catch (error) {
        console.warn('🔐 Auth: Déconnexion locale forcée');
        return { success: true };
      }
    }
  };

  // SERVICE WORDPRESS
  wordpress = {
    getPosts: async (limit = 3) => {
      try {
        console.log('📝 WordPress: Récupération articles...', { limit });
        return await this.request(`/wordpress/posts?limit=${limit}`);
      } catch (error) {
        console.warn('📝 WordPress: API indisponible');
        throw error;
      }
    }
  };

  // SERVICE ARTISTS - Sans fallback, 404 si pas de données
  artists = {
    getArtists: async () => {
      console.log('👨‍🎤 Artists: Récupération liste artistes...');
      return await this.request('/artists');
    },

    getAllArtists: async () => {
      console.log('👨‍🎤 Artists: Récupération liste artistes (getAllArtists)...');
      return await this.request('/artists');
    },

    create: async (artistData) => {
      console.log('👨‍🎤 Artists: Création artiste...', artistData);
      return await this.request('/artists', {
        method: 'POST',
        body: JSON.stringify(artistData)
      });
    }
  };

  // SERVICE SMARTLINKS - Sans fallback, 404 si pas de données
  smartlinks = {
    getAll: async () => {
      console.log('🔗 SmartLinks: Récupération liste...');
      return await this.request('/smartlinks');
    },

    create: async (smartlinkData) => {
      console.log('🔗 SmartLinks: Création...', smartlinkData);
      return await this.request('/smartlinks', {
        method: 'POST',
        body: JSON.stringify(smartlinkData)
      });
    },

    update: async (id, smartlinkData) => {
      console.log('🔗 SmartLinks: Mise à jour...', { id, smartlinkData });
      return await this.request(`/smartlinks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(smartlinkData)
      });
    },

    getById: async (id) => {
      console.log('🔗 SmartLinks: Récupération par ID...', id);
      return await this.request(`/smartlinks/${id}`);
    },

    getBySlugs: async (artistSlug, trackSlug) => {
      console.log('🔗 SmartLinks: Récupération par slugs...', { artistSlug, trackSlug });
      return await this.request(`/smartlinks/by-slugs/${artistSlug}/${trackSlug}`);
    },

    deleteById: async (id) => {
      console.log('🔗 SmartLinks: Suppression...', id);
      return await this.request(`/smartlinks/${id}`, {
        method: 'DELETE'
      });
    },

    fetchPlatformLinks: async (sourceUrl) => {
      console.log('🔗 SmartLinks: Récupération liens plateformes...', sourceUrl);
      return await this.request('/smartlinks/fetch-platform-links', {
        method: 'POST',
        body: JSON.stringify({ sourceUrl })
      });
    }
  };

  // SERVICE MUSIC PLATFORM - Sans fallback
  musicPlatform = {
    fetchLinksFromSourceUrl: async (sourceUrl) => {
      console.log('🎵 MusicPlatform: Récupération liens...', sourceUrl);
      return await this.request('/music-platform/fetch-links', {
        method: 'POST',
        body: JSON.stringify({ sourceUrl })
      });
    }
  };
}

// Instance singleton
const apiService = new ApiService();

// Gestion globale des erreurs non capturées
window.addEventListener('unhandledrejection', (event) => {
  console.warn('🔧 Promise non gérée:', event.reason);
  event.preventDefault();
});

// Export par défaut compatible avec votre code existant
export default apiService;
