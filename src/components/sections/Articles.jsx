import React, { useState, useEffect } from 'react';
import rssService from '../../services/rss.service';
import '../../assets/styles/articles.css';

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
      console.log('📡 Articles: Chargement via flux RSS...');
      
      // Récupération des 3 derniers articles via RSS
      const response = await rssService.getLatestArticles(3);
      
      if (response.success && response.data.length > 0) {
        setArticles(response.data);
        setRetryCount(0); // Reset retry count on success
        console.log('✅ Articles: Importés via RSS avec succès', { 
          count: response.data.length,
          source: response.source 
        });
      } else {
        throw new Error(response.error || 'Aucun article trouvé dans le flux RSS');
      }
      
    } catch (err) {
      console.error('❌ Articles: Erreur import RSS', err);
      setError(err.message);
      setArticles([]); // Pas de fallbacks - liste vide
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);
    console.log(`🔄 Articles: Tentative ${newRetryCount}...`);
    loadArticles();
  };

  // État de chargement
  if (loading) {
    return (
      <section className="articles-section">
        <div className="articles-container">
          <div className="articles-header">
            <h2>Derniers articles</h2>
            <p>Récupération des derniers articles depuis notre blog...</p>
          </div>
          <div className="articles-loading">
            <div className="loading-spinner"></div>
            <p>📡 Connexion au flux RSS en cours...</p>
          </div>
        </div>
      </section>
    );
  }

  // État d'erreur (sans fallbacks)
  if (error && articles.length === 0) {
    return (
      <section className="articles-section">
        <div className="articles-container">
          <div className="articles-header">
            <h2>Articles temporairement indisponibles</h2>
          </div>
          
          <div className="articles-error">
            <div className="error-icon">📡</div>
            <h3>Problème de connexion au blog</h3>
            <p>Impossible de récupérer les articles depuis le flux RSS.</p>
            <p className="error-details">
              <strong>Erreur:</strong> {error}
            </p>
            
            <div className="error-actions">
              <button 
                onClick={handleRetry} 
                className="retry-button"
                disabled={retryCount >= 3}
              >
                {retryCount >= 3 ? '❌ Limite atteinte' : `🔄 Réessayer${retryCount > 0 ? ` (${retryCount}/3)` : ''}`}
              </button>
              
              <a 
                href="https://blog.mdmcmusicads.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="blog-link-button"
              >
                📖 Consulter le blog directement
              </a>
            </div>
            
            {retryCount >= 3 && (
              <p className="retry-limit-message">
                Limite de tentatives atteinte. Veuillez rafraîchir la page ou consulter directement notre blog.
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  // État normal avec articles RSS
  return (
    <section className="articles-section">
      <div className="articles-container">
        <div className="articles-header">
          <h2>Derniers articles</h2>
          <p>Découvrez nos insights et stratégies pour booster votre business</p>
          
          {/* Indicateur de source RSS */}
          <div className="rss-indicator">
            <span className="rss-badge">📡 Synchronisé avec le blog</span>
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
                    console.warn(`⚠️ Erreur chargement image pour l'article ${index + 1}`);
                    // Image de secours spécifique au marketing musical
                    const fallbackImages = [
                      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=250&fit=crop&q=80'
                    ];
                    e.target.src = fallbackImages[index % 3];
                  }}
                />
                
                {/* Badge pour indiquer la source RSS */}
                <div className="article-source-badge">
                  RSS
                </div>
              </div>
              
              <div className="article-content">
                <div className="article-meta">
                  <span className="article-date">{article.date}</span>
                  <span className="article-author">Par {article.author}</span>
                </div>
                
                <h3 className="article-title">{article.title}</h3>
                <p className="article-excerpt">{article.excerpt}</p>
                
                <div className="article-footer">
                  <a 
                    href={article.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="article-link"
                  >
                    Lire la suite →
                  </a>
                </div>
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
          
          <button 
            onClick={handleRetry} 
            className="refresh-articles-button"
            title="Actualiser les articles"
          >
            🔄 Actualiser
          </button>
        </div>
      </div>
    </section>
  );
};

export default Articles;
