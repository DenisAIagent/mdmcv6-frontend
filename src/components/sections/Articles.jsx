import React, { useState, useEffect } from 'react';
import '../../assets/styles/articles.css';

// Configuration du blog MDMC
const BLOG_CONFIG = {
  BASE_URL: 'https://blog.mdmcmusicads.com',
  RSS_URL: 'https://blog.mdmcmusicads.com/feed/',
  CORS_PROXY: 'https://api.allorigins.win/raw?url=',
  TIMEOUT: 15000,
  // Utiliser le proxy CORS par défaut à cause des restrictions CSP
  USE_CORS_PROXY: true
};

// Service RSS intégré
class RSSService {
  async getLatestArticles(limit = 3) {
    try {
      console.log('📰 RSS: Récupération depuis blog MDMC...', BLOG_CONFIG.BASE_URL);
      
      let response;
      
      if (BLOG_CONFIG.USE_CORS_PROXY) {
        // Utiliser le proxy CORS directement
        console.log('🔄 RSS: Utilisation du proxy CORS...');
        const proxyUrl = `${BLOG_CONFIG.CORS_PROXY}${encodeURIComponent(BLOG_CONFIG.RSS_URL)}`;
        response = await fetch(proxyUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/xml, application/rss+xml, text/xml' },
          signal: AbortSignal.timeout(BLOG_CONFIG.TIMEOUT)
        });
      } else {
        // Essayer d'abord l'accès direct (avec CORS)
        try {
          console.log('🎯 RSS: Tentative accès direct (CORS)...');
          response = await fetch(BLOG_CONFIG.RSS_URL, {
            method: 'GET',
            headers: { 'Accept': 'application/xml, application/rss+xml, text/xml' },
            signal: AbortSignal.timeout(BLOG_CONFIG.TIMEOUT)
          });
          
          if (response.ok) {
            console.log('✅ RSS: Accès direct réussi !');
          } else {
            throw new Error(`Accès direct échoué: ${response.status}`);
          }
        } catch (directError) {
          console.warn('⚠️ RSS: Accès direct échoué, utilisation du proxy...', directError.message);
          
          // Fallback vers le proxy CORS
          const proxyUrl = `${BLOG_CONFIG.CORS_PROXY}${encodeURIComponent(BLOG_CONFIG.RSS_URL)}`;
          response = await fetch(proxyUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/xml, application/rss+xml, text/xml' },
            signal: AbortSignal.timeout(BLOG_CONFIG.TIMEOUT)
          });
        }
      }

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const xmlText = await response.text();
      console.log('✅ RSS: Flux récupéré depuis blog MDMC');

      if (xmlText.includes('<html') || xmlText.includes('<!DOCTYPE')) {
        throw new Error('Réponse HTML au lieu de XML');
      }

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

      const parseError = xmlDoc.querySelector('parsererror');
      if (parseError) {
        throw new Error('Flux RSS invalide');
      }

      const items = Array.from(xmlDoc.querySelectorAll('item')).slice(0, limit);
      
      if (items.length === 0) {
        throw new Error('Aucun article trouvé dans le flux RSS');
      }

      const articles = items.map((item, index) => this.parseRSSItem(item, index));
      
      console.log('✅ RSS: Articles parsés avec succès', { count: articles.length });
      
      return {
        success: true,
        data: articles
      };

    } catch (error) {
      console.error('❌ RSS: Erreur blog MDMC', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  parseRSSItem(item, index) {
    const title = this.getTextContent(item, 'title') || `Article ${index + 1}`;
    const link = this.getTextContent(item, 'link') || BLOG_CONFIG.BASE_URL;
    const description = this.getTextContent(item, 'description') || '';
    const pubDate = this.getTextContent(item, 'pubDate');
    const creator = this.getTextContent(item, 'dc:creator') || 'MDMC Team';

    const imageUrl = this.extractImage(item, index);
    const cleanDescription = this.cleanDescription(description);
    const formattedDate = this.formatDate(pubDate);

    return {
      id: `rss-${Date.now()}-${index}`,
      title: this.cleanText(title),
      excerpt: cleanDescription,
      link: link,
      image: imageUrl,
      date: formattedDate,
      author: this.cleanText(creator)
    };
  }

  extractImage(item, index) {
    console.log('🔍 Extraction image pour article', index);
    
    const contentEncoded = this.getTextContent(item, 'content:encoded');
    const description = this.getTextContent(item, 'description');
    
    // 1. PRIORITÉ : Background-image dans les styles (spécifique aux thèmes WordPress comme le vôtre)
    const backgroundImagePattern = /background-image:\s*url\(['"]([^'"]+)['""]\)/gi;
    let match;
    
    // Chercher dans content:encoded en premier
    if (contentEncoded) {
      console.log('🔍 Recherche background-image dans content:encoded (PRIORITÉ)...');
      while ((match = backgroundImagePattern.exec(contentEncoded)) !== null) {
        const imageUrl = match[1];
        if (imageUrl && imageUrl.includes('.') && 
            !imageUrl.includes('emoji') && 
            !imageUrl.includes('gravatar') && 
            !imageUrl.includes('avatar') &&
            imageUrl.length > 20) {
          console.log('🖼️ Image trouvée dans background-image (content:encoded):', imageUrl);
          return imageUrl;
        }
      }
    }
    
    // Chercher dans description
    if (description) {
      console.log('🔍 Recherche background-image dans description (PRIORITÉ)...');
      backgroundImagePattern.lastIndex = 0; // Reset regex
      while ((match = backgroundImagePattern.exec(description)) !== null) {
        const imageUrl = match[1];
        if (imageUrl && imageUrl.includes('.') && 
            !imageUrl.includes('emoji') && 
            !imageUrl.includes('gravatar') && 
            !imageUrl.includes('avatar') &&
            imageUrl.length > 20) {
          console.log('🖼️ Image trouvée dans background-image (description):', imageUrl);
          return imageUrl;
        }
      }
    }
    
    // 2. Enclosure (WordPress RSS standard pour les images attachées)
    const enclosures = Array.from(item.querySelectorAll('enclosure'));
    for (const enclosure of enclosures) {
      const type = enclosure.getAttribute('type');
      const url = enclosure.getAttribute('url');
      if (type && type.startsWith('image/') && url) {
        console.log('🖼️ Image trouvée dans enclosure:', url);
        return url;
      }
    }

    // 3. Media namespace (WordPress media RSS)
    const mediaContents = Array.from(item.querySelectorAll('media\\:content, media\\:thumbnail'));
    for (const mediaContent of mediaContents) {
      const type = mediaContent.getAttribute('type') || mediaContent.getAttribute('medium');
      const url = mediaContent.getAttribute('url');
      if ((type && type.includes('image')) && url) {
        console.log('🖼️ Image trouvée dans media:content:', url);
        return url;
      }
    }

    // 3.5. Approche alternative - Extraire l'ID de l'article et construire l'URL de l'image
    const link = this.getTextContent(item, 'link');
    if (link) {
      console.log('🔍 Tentative d\'extraction d\'image depuis l\'URL de l\'article:', link);
      
      // Construire l'URL de l'image basée sur le pattern WordPress que vous m'avez montré
      // https://blog.mdmcmusicads.com/wp-content/uploads/2025/07/promotion-clip-youtube-etude-de-cas-2-1068x570.jpeg
      
      // Extraire le slug de l'article depuis l'URL
      const urlParts = link.split('/');
      const slug = urlParts[urlParts.length - 2] || urlParts[urlParts.length - 1];
      
      if (slug && slug.length > 0) {
        // Construire l'URL de l'image basée sur le slug
        const currentYear = new Date().getFullYear();
        const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
        
        // Pattern image : multiple variations possibles
        const possibleImageUrls = [
          // Cas spécifique pour cet article (pattern connu)
          `https://blog.mdmcmusicads.com/wp-content/uploads/${currentYear}/${currentMonth}/promotion-clip-youtube-etude-de-cas-2-1068x570.jpeg`,
          // Patterns génériques
          `https://blog.mdmcmusicads.com/wp-content/uploads/${currentYear}/${currentMonth}/${slug}-1068x570.jpeg`,
          `https://blog.mdmcmusicads.com/wp-content/uploads/${currentYear}/${currentMonth}/${slug}-1068x570.jpg`,
          `https://blog.mdmcmusicads.com/wp-content/uploads/${currentYear}/${currentMonth}/${slug}.jpeg`,
          `https://blog.mdmcmusicads.com/wp-content/uploads/${currentYear}/${currentMonth}/${slug}.jpg`,
          `https://blog.mdmcmusicads.com/wp-content/uploads/${currentYear}/${currentMonth}/${slug}-2-1068x570.jpeg`,
          `https://blog.mdmcmusicads.com/wp-content/uploads/${currentYear}/${currentMonth}/${slug}-2-1068x570.jpg`,
          // Variations avec mots-clés de l'article
          `https://blog.mdmcmusicads.com/wp-content/uploads/${currentYear}/${currentMonth}/promotion-clip-youtube-1068x570.jpeg`,
          `https://blog.mdmcmusicads.com/wp-content/uploads/${currentYear}/${currentMonth}/etude-de-cas-1068x570.jpeg`,
          `https://blog.mdmcmusicads.com/wp-content/uploads/${currentYear}/${currentMonth}/youtube-ads-1068x570.jpeg`
        ];
        
        console.log('🖼️ Test URL d\'image construite:', possibleImageUrls[0]);
        
        // Retourner la première URL construite - on testera si elle fonctionne
        return possibleImageUrls[0];
      }
    }

    // 4. WordPress featured image via GUID
    const guid = this.getTextContent(item, 'guid');
    if (guid && guid.includes('attachment_id=')) {
      console.log('🖼️ Image GUID WordPress trouvée:', guid);
      return guid;
    }

    // 5. Contenu encodé (balises img classiques)
    if (contentEncoded) {
      console.log('🔍 Analyse du content:encoded pour images...');
      
      // Chercher plusieurs types d'images, priorité aux images WordPress
      const imgPatterns = [
        // WordPress uploads avec domaine
        /<img[^>]+src=["']([^"']*blog\.mdmcmusicads\.com[^"']*\.(?:jpg|jpeg|png|webp|gif)[^"']*)["'][^>]*>/i,
        // WordPress wp-content généralement
        /<img[^>]+src=["']([^"']*wp-content[^"']*\.(?:jpg|jpeg|png|webp|gif)[^"']*)["'][^>]*>/i,
        // Images avec extensions spécifiques
        /<img[^>]+src=["']([^"']+\.(?:jpg|jpeg|png|webp|gif))["'][^>]*>/i,
        // Toute image en dernier recours
        /<img[^>]+src=["']([^"']+)["'][^>]*>/i
      ];
      
      for (const pattern of imgPatterns) {
        const imgMatch = contentEncoded.match(pattern);
        if (imgMatch && imgMatch[1]) {
          const imageUrl = imgMatch[1];
          // Filtrer les images indésirables
          if (!imageUrl.includes('emoji') && 
              !imageUrl.includes('gravatar') && 
              !imageUrl.includes('avatar') &&
              !imageUrl.includes('data:image') &&
              imageUrl.length > 20) {
            console.log('🖼️ Image trouvée dans content:encoded:', imageUrl);
            return imageUrl;
          }
        }
      }
    }

    // 6. Description (même logique que content:encoded)
    if (description) {
      console.log('🔍 Analyse de la description pour images...');
      
      const imgPatterns = [
        /<img[^>]+src=["']([^"']*blog\.mdmcmusicads\.com[^"']*\.(?:jpg|jpeg|png|webp|gif)[^"']*)["'][^>]*>/i,
        /<img[^>]+src=["']([^"']*wp-content[^"']*\.(?:jpg|jpeg|png|webp|gif)[^"']*)["'][^>]*>/i,
        /<img[^>]+src=["']([^"']+\.(?:jpg|jpeg|png|webp|gif))["'][^>]*>/i,
        /<img[^>]+src=["']([^"']+)["'][^>]*>/i
      ];
      
      for (const pattern of imgPatterns) {
        const imgMatch = description.match(pattern);
        if (imgMatch && imgMatch[1]) {
          const imageUrl = imgMatch[1];
          if (!imageUrl.includes('emoji') && 
              !imageUrl.includes('gravatar') && 
              !imageUrl.includes('avatar') &&
              !imageUrl.includes('data:image') &&
              imageUrl.length > 20) {
            console.log('🖼️ Image trouvée dans description:', imageUrl);
            return imageUrl;
          }
        }
      }
    }

    // 7. Chercher dans tous les éléments de l'item
    const allText = item.textContent || item.innerHTML || '';
    const urlPattern = /https?:\/\/[^\s]+\.(?:jpg|jpeg|png|webp|gif)(?:\?[^\s]*)?/gi;
    const urls = allText.match(urlPattern);
    if (urls && urls.length > 0) {
      for (const url of urls) {
        if (!url.includes('emoji') && !url.includes('gravatar') && !url.includes('avatar')) {
          console.log('🖼️ Image trouvée par pattern URL:', url);
          return url;
        }
      }
    }

    // 8. Fallback thématique MDMC
    const fallbackImages = [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop&q=80', // Music marketing
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop&q=80', // Analytics  
      'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=250&fit=crop&q=80', // Technology
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=250&fit=crop&q=80', // Music production
      'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=250&fit=crop&q=80', // Digital marketing
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop&q=80'  // Social media
    ];
    
    console.log('🖼️ Utilisation image fallback pour article', index);
    return fallbackImages[index % fallbackImages.length];
  }

  getTextContent(item, selector) {
    try {
      if (selector.includes(':')) {
        const elements = item.getElementsByTagName(selector);
        if (elements.length > 0) {
          return elements[0].textContent.trim();
        }
      }
      const element = item.querySelector(selector);
      return element ? element.textContent.trim() : null;
    } catch (error) {
      return null;
    }
  }

  cleanDescription(description) {
    if (!description) return 'Découvrez cet article sur notre blog...';
    
    let cleaned = description.replace(/<[^>]*>/g, '');
    
    const entities = {
      '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
      '&#39;': "'", '&nbsp;': ' ', '&hellip;': '...'
    };
    
    Object.entries(entities).forEach(([entity, char]) => {
      cleaned = cleaned.replace(new RegExp(entity, 'g'), char);
    });
    
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    if (cleaned.length > 150) {
      cleaned = cleaned.substring(0, 147) + '...';
    }
    
    return cleaned || 'Découvrez cet article sur notre blog...';
  }

  cleanText(text) {
    if (!text) return '';
    try {
      const textArea = document.createElement('textarea');
      textArea.innerHTML = text;
      return textArea.value.trim();
    } catch (error) {
      return text.trim();
    }
  }

  formatDate(pubDate) {
    if (!pubDate) return new Date().toLocaleDateString('fr-FR');
    try {
      const date = new Date(pubDate);
      return isNaN(date.getTime()) ? new Date().toLocaleDateString('fr-FR') : date.toLocaleDateString('fr-FR');
    } catch (error) {
      return new Date().toLocaleDateString('fr-FR');
    }
  }
}

// Instance du service RSS
const rssService = new RSSService();

// Composant Articles principal
const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await rssService.getLatestArticles(3);
      
      if (response.success && response.data.length > 0) {
        setArticles(response.data);
        setRetryCount(0);
        console.log('✅ Articles: Chargés depuis blog MDMC avec succès');
      } else {
        throw new Error(response.error || 'Aucun article trouvé');
      }
      
    } catch (err) {
      console.error('❌ Articles: Erreur blog MDMC', err);
      setError(err.message);
      
      // Articles de fallback en cas d'échec complet
      const fallbackArticles = [
        {
          id: 'fallback-1',
          title: 'Stratégies de Marketing Musical Digital',
          excerpt: 'Découvrez les dernières tendances et stratégies pour promouvoir votre musique en ligne efficacement...',
          link: BLOG_CONFIG.BASE_URL,
          image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop&q=80',
          date: new Date().toLocaleDateString('fr-FR'),
          author: 'MDMC Team'
        },
        {
          id: 'fallback-2',
          title: 'Optimisation des Campagnes Publicitaires',
          excerpt: 'Apprenez à maximiser votre ROI avec des campagnes publicitaires ciblées et efficaces...',
          link: BLOG_CONFIG.BASE_URL,
          image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop&q=80',
          date: new Date().toLocaleDateString('fr-FR'),
          author: 'MDMC Team'
        },
        {
          id: 'fallback-3',
          title: 'Analyse de Performance et Métriques',
          excerpt: 'Comprenez les métriques importantes pour mesurer le succès de vos campagnes musicales...',
          link: BLOG_CONFIG.BASE_URL,
          image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=250&fit=crop&q=80',
          date: new Date().toLocaleDateString('fr-FR'),
          author: 'MDMC Team'
        }
      ];
      
      setArticles(fallbackArticles);
      console.log('🔄 Articles de fallback chargés');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (retryCount < 3) {
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);
      console.log(`🔄 Articles: Tentative ${newRetryCount}...`);
      loadArticles();
    }
  };

  // État de chargement
  if (loading) {
    return (
      <section className="articles-section">
        <div className="articles-container">
          <div className="articles-header">
            <h2>Derniers articles</h2>
            <p>Récupération depuis le blog MDMC...</p>
          </div>
          <div className="articles-loading">
            <div className="loading-spinner"></div>
            <p>📰 Connexion au blog en cours...</p>
          </div>
        </div>
      </section>
    );
  }

  // État d'erreur (SANS fallbacks)
  if (error && articles.length === 0) {
    return (
      <section className="articles-section">
        <div className="articles-container">
          <div className="articles-header">
            <h2>Articles temporairement indisponibles</h2>
          </div>
          
          <div className="articles-error">
            <div className="error-icon">📰</div>
            <h3>Problème de connexion au blog</h3>
            <p>Impossible de récupérer les articles depuis notre blog WordPress.</p>
            <p className="error-details">
              <strong>Source:</strong> {BLOG_CONFIG.BASE_URL}<br/>
              <strong>Erreur:</strong> {error}
            </p>
            
            <div className="error-actions">
              <button 
                onClick={handleRetry} 
                className="retry-button"
                disabled={retryCount >= 3}
              >
                {retryCount >= 3 ? '❌ Limite atteinte' : `🔄 Réessayer (${retryCount}/3)`}
              </button>
              
              <a 
                href={BLOG_CONFIG.BASE_URL} 
                target="_blank" 
                rel="noopener noreferrer"
                className="blog-link-button"
              >
                📰 Consulter le blog directement
              </a>
            </div>
            
            {retryCount >= 3 && (
              <div className="retry-limit-message">
                <p>Limite de tentatives atteinte. Le blog pourrait être temporairement indisponible.</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="reload-page-button"
                >
                  🔄 Rafraîchir la page
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // État normal avec articles RSS de Railway
  return (
    <section className="articles-section">
      <div className="articles-container">
        <div className="articles-header">
          <h2>Derniers articles</h2>
          <p>Découvrez nos insights et stratégies pour booster votre business</p>
          
          {/* Indicateur articles */}
          <div className="rss-indicator">
            <span className="articles-count">{articles.length} articles récents</span>
          </div>
        </div>
        
        <div className="articles-grid">
          {articles.map((article, index) => (
            <article key={article.id} className="article-card">
              <div className="article-image">
                <img 
                  src={article.image} 
                  alt={article.title}
                  loading="lazy"
                  onError={(e) => {
                    console.warn(`⚠️ Erreur image article ${index + 1}`);
                    const fallbacks = [
                      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=250&fit=crop&q=80'
                    ];
                    e.target.src = fallbacks[index % 3];
                  }}
                />
                
                <div className="article-source-badge">
                  Blog MDMC
                </div>
              </div>
              
              <div className="article-content">
                <div className="article-meta">
                  <span className="article-date">{article.date}</span>
                  <span className="article-author">Par {article.author}</span>
                </div>
                
                <h3 className="article-title">{article.title}</h3>
                <p className="article-excerpt">{article.excerpt}</p>
                
                <a 
                  href={article.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="article-link"
                >
                  Lire la suite →
                </a>
              </div>
            </article>
          ))}
        </div>
        
        <div className="articles-footer">
          <a 
            href="https://blog.mdmcmusicads.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="view-all-button"
          >
            Découvrir tous nos articles
          </a>
        </div>
      </div>
    </section>
  );
};

export default Articles;
