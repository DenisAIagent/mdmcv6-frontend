import React, { useState, useEffect } from 'react';
import '../../assets/styles/articles.css';

// Configuration du blog Railway
const BLOG_CONFIG = {
  BASE_URL: 'https://blog-wp-production.up.railway.app',
  RSS_URL: 'https://blog-wp-production.up.railway.app/feed/',
  CORS_PROXY: 'https://api.allorigins.win/raw?url=',
  TIMEOUT: 15000
};

// Service RSS intégré
class RSSService {
  async getLatestArticles(limit = 3) {
    try {
      console.log('🚂 RSS: Récupération depuis Railway...', BLOG_CONFIG.BASE_URL);
      
      const proxyUrl = `${BLOG_CONFIG.CORS_PROXY}${encodeURIComponent(BLOG_CONFIG.RSS_URL)}`;
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/xml, application/rss+xml, text/xml' },
        signal: AbortSignal.timeout(BLOG_CONFIG.TIMEOUT)
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const xmlText = await response.text();
      console.log('✅ RSS: Flux récupéré depuis Railway');

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
      console.error('❌ RSS: Erreur Railway', error);
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
    // 1. Contenu encodé
    const contentEncoded = this.getTextContent(item, 'content:encoded');
    if (contentEncoded) {
      const imgMatch = contentEncoded.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
      if (imgMatch && imgMatch[1]) {
        return imgMatch[1];
      }
    }

    // 2. Description
    const description = this.getTextContent(item, 'description');
    if (description) {
      const imgMatch = description.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
      if (imgMatch && imgMatch[1]) {
        return imgMatch[1];
      }
    }

    // 3. Fallback thématique
    const fallbackImages = [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=250&fit=crop&q=80'
    ];
    
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
        console.log('✅ Articles: Chargés depuis Railway avec succès');
      } else {
        throw new Error(response.error || 'Aucun article trouvé');
      }
      
    } catch (err) {
      console.error('❌ Articles: Erreur Railway', err);
      setError(err.message);
      setArticles([]); // PAS de fallbacks
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
            <p>Récupération depuis le blog Railway...</p>
          </div>
          <div className="articles-loading">
            <div className="loading-spinner"></div>
            <p>🚂 Connexion à Railway en cours...</p>
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
            <div className="error-icon">🚂</div>
            <h3>Problème de connexion au blog Railway</h3>
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
                🚂 Consulter le blog directement
              </a>
            </div>
            
            {retryCount >= 3 && (
              <div className="retry-limit-message">
                <p>Limite de tentatives atteinte. Le blog Railway pourrait être temporairement indisponible.</p>
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
                  Railway
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
