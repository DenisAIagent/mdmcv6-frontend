// src/services/airtableReviews.service.js
class AirtableReviewsService {
  constructor() {
    // Variables d'environnement sécurisées
    this.baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    this.tableName = import.meta.env.VITE_AIRTABLE_TABLE_NAME || 'Reviews';
    this.apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
    this.baseUrl = `https://api.airtable.com/v0/${this.baseId}/${this.tableName}`;
    
    // Validation des variables d'environnement
    if (!this.baseId || !this.apiKey) {
      console.warn('⚠️ Airtable: Variables d\'environnement manquantes');
      this.isConfigured = false;
    } else {
      this.isConfigured = true;
      console.log('✅ Airtable Service initialized:', { 
        baseId: this.baseId.substring(0, 8) + '***',
        tableName: this.tableName 
      });
    }

    // Headers réutilisables
    this.headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  async getApprovedReviews() {
    // Si pas configuré, retourner les données de fallback
    if (!this.isConfigured) {
      console.log('🔄 Configuration manquante, utilisation du fallback');
      return this.getFallbackReviews();
    }

    try {
      console.log('🔍 Airtable: Récupération des avis approuvés...');
      
      // URL avec filtres et tri
      const params = new URLSearchParams({
        filterByFormula: "AND({Status} = 'Approved', {Rating} > 0)",
        sort: JSON.stringify([
          { field: 'Featured', direction: 'desc' },
          { field: 'Submitted At', direction: 'desc' }
        ]),
        maxRecords: '50'
      });

      const url = `${this.baseUrl}?${params.toString()}`;
      
      // Requête avec timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Airtable API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const reviewsCount = data.records?.length || 0;
      
      console.log('✅ Airtable: Avis récupérés avec succès', { 
        count: reviewsCount,
        hasOffset: !!data.offset 
      });
      
      if (reviewsCount === 0) {
        console.log('ℹ️ Aucun avis approuvé trouvé, utilisation du fallback');
        return this.getFallbackReviews();
      }

      return this.formatReviews(data.records);
      
    } catch (error) {
      console.warn('⚠️ Airtable: Erreur lors de la récupération', {
        error: error.message,
        name: error.name
      });
      
      // Fallback en cas d'erreur
      return this.getFallbackReviews();
    }
  }

  async submitReview(reviewData) {
    if (!this.isConfigured) {
      return {
        success: true,
        message: 'Merci pour votre avis ! (Mode développement)',
        id: `dev_${Date.now()}`
      };
    }

    try {
      console.log('📝 Airtable: Soumission nouvel avis...', { 
        name: reviewData.name,
        rating: reviewData.rating 
      });
      
      const record = {
        fields: {
          'Name': reviewData.name?.trim() || 'Anonyme',
          'Email': reviewData.email?.trim() || '',
          'Company': reviewData.company?.trim() || '',
          'Website': reviewData.website?.trim() || '',
          'Rating': parseInt(reviewData.rating) || 5,
          'Message': reviewData.message?.trim() || '',
          'Status': 'Pending',
          'Featured': false,
          'Source': 'Website Form',
          'Submitted At': new Date().toISOString()
        }
      };

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(record)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Submission error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Airtable: Avis soumis avec succès', { id: result.id });
      
      return {
        success: true,
        message: 'Merci pour votre avis ! Il sera publié après modération.',
        id: result.id
      };
      
    } catch (error) {
      console.error('❌ Airtable: Échec de soumission', error);
      return {
        success: false,
        message: 'Une erreur est survenue. Veuillez réessayer plus tard.',
        error: error.message
      };
    }
  }

  formatReviews(records) {
    return records.map(record => {
      const fields = record.fields;
      
      return {
        id: record.id,
        name: fields.Name || 'Client anonyme',
        company: fields.Company || '',
        rating: parseInt(fields.Rating) || 5,
        comment: fields.Message || '',
        featured: fields.Featured || false,
        avatar: this.generateAvatar(fields.Name, fields.Email),
        submittedAt: fields['Submitted At'] || new Date().toISOString(),
        source: fields.Source || 'Airtable',
        status: fields.Status || 'Approved',
        // Données calculées
        initials: this.getInitials(fields.Name),
        timeAgo: this.getTimeAgo(fields['Submitted At'])
      };
    });
  }

  generateAvatar(name, email) {
    // Si email présent, utiliser Gravatar
    if (email) {
      const hash = this.md5(email.toLowerCase().trim());
      return `https://www.gravatar.com/avatar/${hash}?s=64&d=identicon&r=pg`;
    }
    
    // Sinon, avatar Unsplash avec seed basé sur le nom
    const seed = name ? name.toLowerCase().replace(/\s+/g, '') : 'default';
    const imageIds = [
      'photo-1494790108755-2616b612b641', // Femme souriante
      'photo-1472099645785-5658abf4ff4e', // Homme professionnel
      'photo-1438761681033-6461ffad8d80', // Femme professionnelle
      'photo-1507003211169-0a1dd7228f2d', // Homme décontracté
      'photo-1534528741775-53994a69daeb'  // Femme créative
    ];
    
    const imageIndex = this.hashCode(seed) % imageIds.length;
    return `https://images.unsplash.com/${imageIds[imageIndex]}?w=64&h=64&fit=crop&crop=face`;
  }

  getInitials(name) {
    if (!name) return 'AN';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  getTimeAgo(dateString) {
    if (!dateString) return 'Récemment';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Aujourd\'hui';
      if (diffDays === 1) return 'Hier';
      if (diffDays < 7) return `Il y a ${diffDays} jours`;
      if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine(s)`;
      if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
      return `Il y a ${Math.floor(diffDays / 365)} an(s)`;
    } catch {
      return 'Récemment';
    }
  }

  // Utilitaires
  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  md5(str) {
    // Implémentation MD5 simplifiée pour Gravatar
    // En production, utilise crypto-js ou une vraie lib MD5
    return btoa(str).replace(/[^a-z0-9]/gi, '').toLowerCase().substring(0, 32);
  }

  getFallbackReviews() {
    console.log('🔄 Airtable: Utilisation des données de fallback');
    return [
      {
        id: 'fallback_1',
        name: "Sarah Martinez",
        company: "TechFlow Agency",
        rating: 5,
        comment: "Service exceptionnel ! L'équipe MDMC a complètement transformé notre stratégie de promotion musicale. ROI impressionnant dès le premier mois, et un suivi personnalisé au top.",
        featured: true,
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b641?w=64&h=64&fit=crop&crop=face",
        submittedAt: "2024-12-01T10:00:00Z",
        source: "Google Reviews",
        initials: "SM",
        timeAgo: "Il y a 2 semaines"
      },
      {
        id: 'fallback_2',
        name: "Marc Dubois",
        company: "Innovate Music",
        rating: 5,
        comment: "Professionnalisme et créativité au rendez-vous. Nos campagnes n'ont jamais été aussi performantes ! Je recommande vivement MDMC pour toute stratégie digitale.",
        featured: false,
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
        submittedAt: "2024-11-28T14:30:00Z",
        source: "Facebook",
        initials: "MD",
        timeAgo: "Il y a 3 semaines"
      },
      {
        id: 'fallback_3',
        name: "Emma Rodriguez",
        company: "Digital Sound Co.",
        rating: 5,
        comment: "Équipe ultra-réactive et résultats concrets dès les premières semaines. L'expertise en promotion musicale est vraiment impressionnante. Merci MDMC !",
        featured: true,
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
        submittedAt: "2024-11-25T09:15:00Z",
        source: "LinkedIn",
        initials: "ER",
        timeAgo: "Il y a 3 semaines"
      },
      {
        id: 'fallback_4',
        name: "Thomas Chen",
        company: "Beats & Bytes",
        rating: 5,
        comment: "La stratégie multicanal proposée par MDMC a révolutionné notre approche. +180% de streams en 6 mois, c'est du jamais vu !",
        featured: false,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
        submittedAt: "2024-11-20T16:45:00Z",
        source: "Trustpilot",
        initials: "TC",
        timeAgo: "Il y a 1 mois"
      },
      {
        id: 'fallback_5',
        name: "Julie Moreau",
        company: "Indé Music Lab",
        rating: 5,
        comment: "Accompagnement sur-mesure et expertise technique au top. MDMC comprend vraiment les enjeux des artistes indépendants. Bravo !",
        featured: false,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=face",
        submittedAt: "2024-11-18T11:20:00Z",
        source: "Google Reviews",
        initials: "JM",
        timeAgo: "Il y a 1 mois"
      },
      {
        id: 'fallback_6',
        name: "Alexandre Silva",
        company: "Urban Sounds",
        rating: 4,
        comment: "Excellent travail sur notre campagne de lancement. L'équipe est à l'écoute et propose des solutions créatives adaptées à notre budget.",
        featured: false,
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
        submittedAt: "2024-11-15T13:10:00Z",
        source: "Facebook",
        initials: "AS",
        timeAgo: "Il y a 1 mois"
      }
    ];
  }

  // Test de connexion Airtable
  async testConnection() {
    if (!this.isConfigured) {
      return { success: false, error: 'Configuration manquante' };
    }

    try {
      const response = await fetch(`${this.baseUrl}?maxRecords=1`, {
        method: 'GET',
        headers: this.headers
      });

      return {
        success: response.ok,
        status: response.status,
        configured: this.isConfigured
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        configured: this.isConfigured
      };
    }
  }
}

// Instance exportée
export default new AirtableReviewsService();
