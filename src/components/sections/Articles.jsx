import React, { useState, useEffect } from 'react';
import '../../assets/styles/articles.css';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // NOUVELLE CONFIGURATION - API WordPress directe (sans backend proxy)
  const BLOG_BASE_URL = 'https://blog.mdmcmusicads.com';
  const WP_API_URL = `${BLOG_BASE_URL}/wp-json/wp/v2/posts`;
  
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Récupération articles WordPress (API directe)...');
      
      // Appel direct à l'API WordPress (sans backend proxy)
      const params = new URLSearchParams({
        per_page: 3,
        _embed: true, // Inclut les images et métadonnées
        status: 'publish',
        orderby: 'date',
        order: 'desc'
      });

      const response = await fetch(`${WP_API_URL}?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur WordPress API: ${response.status} ${response.statusText}`);
      }

      const wpPosts = await response.json();
      
      console.log('📦 === RÉPONSE WORDPRESS API DIRECTE ===');
      console.log('📊 Nombre articles:', wpPosts?.length);
      
      if (!Array.isArray(wpPosts)) {
        throw new Error('Format de réponse invalide de WordPress');
      }

      if (wpPosts.length === 0) {
        console.warn('⚠️ Aucun article retourné par WordPress');
        setArticles(getFallbackArticles());
        return;
      }

      // Traitement des articles WordPress
      const processedArticles = wpPosts.map((post, index) => {
        console.log(`\n🔄 === TRAITEMENT ARTICLE ${index + 1} ===`);
        
        const processed = {
          id: post.id || `temp-${index}`,
          title: extractTitle(post),
          excerpt: extractExcerpt(post),
          date: formatDate(post.date),
          link: post.link || `${BLOG_BASE_URL}/?p=${post.id}`,
          category: mapCategory(post._embedded?.['wp:term']?.[0]),
          image: extractImage(post) || getPlaceholderImage(post.id || (index + 1))
        };
        
        console.log('✅ Article traité:', processed.title);
        return processed;
      });

      setArticles(processedArticles);
      console.log(`✅ ${processedArticles.length} articles WordPress traités`);
      
    } catch (err) {
      console.error('❌ Erreur WordPress API:', err);
      setError(err.message);
      
      // Fallback vers articles de démonstration
      console.log('🔄 Activation du fallback...');
      setArticles(getFallbackArticles());
    } finally {
      setLoading(false);
    }
  };

  const extractTitle = (post) => {
    if (!post) return 'Sans titre';
    
    if (post.title && typeof post.title === 'object' && post.title.rendered) {
      return post.title.rendered;
    }
    
    return 'Sans titre';
  };

  const extractExcerpt = (post) => {
    if (!post) return 'Pas de description disponible.';

    let rawText = '';

    // WordPress excerpt.rendered
    if (post.excerpt && typeof post.excerpt === 'object' && post.excerpt.rendered) {
      rawText = post.excerpt.rendered;
    }
    // Début du contenu
    else if (post.content && typeof post.content === 'object' && post.content.rendered) {
      rawText = post.content.rendered.substring(0, 200);
    }
    else {
      return 'Découvrez cet article sur notre blog.';
    }

    // Nettoyage sécurisé
    try {
      let clean = String(rawText)
        .replace(/<[^>]*>/g, ' ')
        .replace(/&[^;]+;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (clean.length === 0) {
        return 'Découvrez cet article sur notre blog.';
      }

      return clean.length > 120 ? clean.substring(0, 120) + '...' : clean;

    } catch (err) {
      console.warn('Erreur nettoyage excerpt:', err);
      return 'Découvrez cet article sur notre blog.';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString('fr-FR');
    
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (err) {
      return new Date().toLocaleDateString('fr-FR');
    }
  };

  const mapCategory = (categories) => {
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return 'ARTICLE';
    }
    
    // Mapping par nom de catégorie (plus fiable que par ID)
    const categoryMap = {
      'strategie': 'STRATÉGIE',
      'strategy': 'STRATÉGIE',
      'tendances': 'TENDANCES',
      'trends': 'TENDANCES',
      'publicite': 'PUBLICITÉ',
      'advertising': 'PUBLICITÉ',
      'ads': 'PUBLICITÉ',
      'analyse': 'ANALYSE',
      'analysis': 'ANALYSE',
      'conseils': 'CONSEILS',
      'tips': 'CONSEILS',
      'tutoriel': 'TUTORIEL',
      'tutorial': 'TUTORIEL'
    };
    
    const firstCategory = categories[0];
    const categoryName = firstCategory?.name?.toLowerCase() || '';
    
    return categoryMap[categoryName] || 'ARTICLE';
  };

  const extractImage = (post) => {
    if (!post) return null;
    
    console.log(`🖼️ Extraction image pour post ${post.id}`);
    
    try {
      // WordPress _embedded featured media
      if (post._embedded && 
          post._embedded['wp:featuredmedia'] && 
          Array.isArray(post._embedded['wp:featuredmedia']) &&
          post._embedded['wp:featuredmedia'].length > 0) {
        
        const featuredMedia = post._embedded['wp:featuredmedia'][0];
        
        // Source URL directe
        if (featuredMedia.source_url) {
          console.log(`✅ Image WordPress: ${featuredMedia.source_url}`);
          return featuredMedia.source_url;
        }
        
        // Media details avec différentes tailles
        if (featuredMedia.media_details && featuredMedia.media_details.sizes) {
          const sizes = featuredMedia.media_details.sizes;
          const preferredSizes = ['large', 'medium_large', 'medium', 'full', 'thumbnail'];
          
          for (const sizeKey of preferredSizes) {
            if (sizes[sizeKey] && sizes[sizeKey].source_url) {
              console.log(`✅ Image WordPress (${sizeKey}): ${sizes[sizeKey].source_url}`);
              return sizes[sizeKey].source_url;
            }
          }
        }
      }
      
      // Recherche dans le contenu HTML
      if (post.content && typeof post.content === 'object' && post.content.rendered) {
        const imgMatches = post.content.rendered.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
        if (imgMatches && imgMatches.length > 0) {
          const srcMatch = imgMatches[0].match(/src=["']([^"']+)["']/);
          if (srcMatch && srcMatch[1]) {
            console.log(`✅ Image extraite du contenu: ${srcMatch[1]}`);
            return srcMatch[1];
          }
        }
      }
      
      console.log(`⚠️ Aucune image trouvée pour le post ${post.id}`);
      
    } catch (err) {
      console.error(`❌ Erreur extraction image post ${post.id}:`, err);
    }
    
    return null;
  };

  const getPlaceholderImage = (articleId) => {
    const placeholders = [
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop&crop=center", // Concert
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=400&fit=crop&crop=center", // Studio
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop&crop=center", // Marketing
      "https://images.unsplash.com/photo-1499415479124-43c32433a620?w=800&h=400&fit=crop&crop=center", // Microphone
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&h=400&fit=crop&crop=center"  // Concert night
    ];
    
    const id = typeof articleId === 'number' ? articleId : parseInt(articleId) || 1;
    const imageIndex = (id - 1) % placeholders.length;
    const selectedImage = placeholders[imageIndex];
    
    console.log(`🖼️ Placeholder sélectionné pour article ${articleId}: ${selectedImage}`);
    return selectedImage;
  };

  const getFallbackArticles = () => [
    {
      id: 'fallback-1',
      title: "Stratégies YouTube Ads pour Artistes Musicaux",
      excerpt: "Découvrez comment maximiser votre visibilité sur YouTube avec des campagnes publicitaires ciblées et optimisées pour l'industrie musicale.",
      date: formatDate(new Date()),
      link: `${BLOG_BASE_URL}`,
      category: 'STRATÉGIE',
      image: getPlaceholderImage(1)
    },
    {
      id: 'fallback-2',
      title: "Meta Ads : Facebook & Instagram pour la Musique",
      excerpt: "Guide complet pour promouvoir votre musique sur les plateformes Meta et toucher efficacement votre audience cible.",
      date: formatDate(new Date(Date.now() - 86400000)),
      link: `${BLOG_BASE_URL}`,
      category: 'PUBLICITÉ',
      image: getPlaceholderImage(2)
    },
    {
      id: 'fallback-3',
      title: "TikTok Ads : La Révolution Marketing Musical",
      excerpt: "Comment TikTok transforme la découverte musicale et les stratégies publicitaires. Apprenez à exploiter cette plateforme explosive.",
      date: formatDate(new Date(Date.now() - 172800000)),
      link: `${BLOG_BASE_URL}`,
      category: 'TENDANCES',
      image: getPlaceholderImage(3)
    }
  ];

  const getCategoryClass = (category) => {
    const classes = {
      'STRATÉGIE': 'strategie',
      'TENDANCES': 'tendances', 
      'PUBLICITÉ': 'publicite',
      'ANALYSE': 'analyse',
      'CONSEILS': 'conseils',
      'TUTORIEL': 'tutoriel',
      'ARTICLE': 'article'
    };
    
    return classes[category] || 'article';
  };

  const handleImageError = (e, articleId) => {
    e.target.src = getPlaceholderImage(articleId);
  };

  const handleReadMore = (link) => {
    console.log('📝 Redirection vers:', link);
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  // LOADING
  if (loading) {
    return (
      <section className="articles-section">
        <div className="articles-container">
          <div className="articles-header">
            <h2>Chargement des derniers articles...</h2>
          </div>
          <div className="articles-grid loading">
            {[1, 2, 3].map(i => (
              <div key={i} className="article-card loading-card">
                <div className="loading-shimmer"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // SUCCESS - Articles affichés (WordPress ou fallback)
  return (
    <section className="articles-section">
      <div className="articles-container">
        <div className="articles-header">
          <h2>Derniers Articles</h2>
          {error && (
            <p style={{ color: '#ff6b35', fontSize: '14px', fontStyle: 'italic' }}>
              Mode hors ligne - Articles de démonstration
            </p>
          )}
        </div>
        
        <div className="articles-grid">
          {articles.map((article) => (
            <article key={article.id} className="article-card">
              <div className="article-visual">
                <img 
                  src={article.image || getPlaceholderImage(article.id)} 
                  alt={article.title} 
                  className="article-image"
                  onError={(e) => handleImageError(e, article.id)}
                />
                <div className={`article-category ${getCategoryClass(article.category)}`}>
                  {article.category}
                </div>
              </div>
              
              <div className="article-content">
                <h3 className="article-title">{article.title}</h3>
                <p className="article-excerpt">{article.excerpt}</p>
                
                <div className="article-footer">
                  <span className="article-date">{article.date}</span>
                  <button 
                    className="read-more-btn"
                    onClick={() => handleReadMore(article.link)}
                  >
                    Lire la suite
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
        
        <div className="articles-cta">
          <button 
            className="view-all-btn"
            onClick={() => window.open(BLOG_BASE_URL, '_blank')}
          >
            Voir tous les articles
          </button>
        </div>
      </div>
    </section>
  );
};

export default Articles;