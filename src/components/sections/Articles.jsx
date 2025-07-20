import React, { useState, useEffect } from 'react';
import '../../assets/styles/articles.css';

// Configuration du blog MDMC
const BLOG_CONFIG = {
  BASE_URL: 'https://blog.mdmcmusicads.com',
  // Utiliser la route wordpress existante
  API_PROXY_URL: '/api/wordpress/blog/articles',
  TIMEOUT: 15000,
  USE_BACKEND_PROXY: true
};

// Service RSS intégré
class RSSService {
  async getLatestArticles(limit = 3) {
    try {
      console.log('📰 RSS: Récupération depuis backend proxy...', BLOG_CONFIG.API_PROXY_URL);
      
      if (BLOG_CONFIG.USE_BACKEND_PROXY) {
        // Utiliser le proxy backend
        console.log('🔄 RSS: Utilisation du proxy backend...');
        
        const response = await fetch(`${BLOG_CONFIG.API_PROXY_URL}?limit=${limit}`, {
          method: 'GET',
          headers: { 
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(BLOG_CONFIG.TIMEOUT)
        });
        
        console.log('🔄 RSS: Réponse du proxy backend:', response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`Erreur proxy backend: ${response.status}`);
        }

        const jsonData = await response.json();
        console.log('✅ RSS: Données JSON récupérées depuis le proxy backend');
        console.log('📋 RSS: Articles reçus:', jsonData.data?.length || 0);

        if (!jsonData.success || !jsonData.data) {
          throw new Error(jsonData.error || 'Aucune donnée reçue du proxy');
        }

        return {
          success: true,
          data: jsonData.data
        };
      }

      // Fallback vers l'ancienne méthode (ne devrait plus être utilisé)
      throw new Error('Proxy backend désactivé');

    } catch (error) {
      console.error('❌ RSS: Erreur proxy backend', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  // Les méthodes de parsing ne sont plus nécessaires car le backend fait le travail
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
      setArticles([]); // Pas d'articles fallback - on laisse vide
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
                {article.image ? (
                  <img 
                    src={article.image} 
                    alt={article.title}
                    loading="lazy"
                    onError={(e) => {
                      console.warn(`⚠️ Erreur image article ${index + 1}:`, article.image);
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="no-image-placeholder">
                    <span>📰</span>
                    <p>Image non disponible</p>
                  </div>
                )}
                
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
