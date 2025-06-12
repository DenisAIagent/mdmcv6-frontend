import React, { useState, useEffect } from 'react';
import '../../assets/styles/articles.css';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configuration - URLs CORRECTES
  const BACKEND_PROXY_API = 'https://mdmcv4-backend-production-b615.up.railway.app/api/wordpress/posts';
  const BLOG_BASE_URL = 'https://blog.mdmcmusicads.com';
  
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Récupération articles WordPress...');
      
      const response = await fetch(`${BACKEND_PROXY_API}?limit=3`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur backend: ${response.status}`);
      }

      const result = await response.json();
      
      console.log('📦 === RÉPONSE BACKEND COMPLÈTE ===');
      console.log('✅ Success:', result.success);
      console.log('📊 Data:', result.data);
      console.log('📊 Nombre articles:', result.data?.length);
      
      // Debug approfondi de la structure des articles
      if (result.data && Array.isArray(result.data)) {
        result.data.forEach((article, index) => {
          console.log(`\n📄 === ARTICLE ${index + 1} STRUCTURE COMPLÈTE ===`);
          console.log('🆔 ID:', article.id);
          console.log('📝 Title:', article.title);
          console.log('📄 Excerpt:', article.excerpt);
          console.log('🔗 Link:', article.link);
          console.log('📅 Date:', article.date);
          console.log('🏷️ Categories:', article.categories);
          console.log('🖼️ Featured Image URL:', article.featured_image_url);
          console.log('📦 _embedded keys:', article._embedded ? Object.keys(article._embedded) : 'none');
          
          if (article._embedded && article._embedded['wp:featuredmedia']) {
            console.log('📷 Featured Media:', article._embedded['wp:featuredmedia'][0]);
          }
          
          // Log spécial pour identifier les URLs d'images
          const imageUrls = [];
          if (article.featured_image_url) imageUrls.push(`featured_image_url: ${article.featured_image_url}`);
          if (article._embedded && article._embedded['wp:featuredmedia'] && article._embedded['wp:featuredmedia'][0]) {
            const media = article._embedded['wp:featuredmedia'][0];
            if (media.source_url) imageUrls.push(`source_url: ${media.source_url}`);
          }
          console.log('🎯 URLs d\'images détectées:', imageUrls);
        });
      }
      
      if (!result.success || !Array.isArray(result.data)) {
        throw new Error('Format de réponse invalide');
      }

      if (result.data.length === 0) {
        console.warn('⚠️ Aucun article retourné');
        setArticles([]);
        return;
      }

      // Traitement des articles WordPress avec logging détaillé
      const processedArticles = result.data.map((article, index) => {
        console.log(`\n🔄 === TRAITEMENT ARTICLE ${index + 1} ===`);
        console.log('📦 Article brut:', {
          id: article.id,
          title: article.title,
          excerpt: article.excerpt,
          date: article.date,
          link: article.link,
          categories: article.categories,
          featured_image_url: article.featured_image_url,
          hasEmbedded: !!article._embedded,
          embeddedKeys: article._embedded ? Object.keys(article._embedded) : []
        });
        
        const processed = {
          id: article.id || `temp-${index}`,
          title: extractTitle(article),
          excerpt: extractExcerpt(article),
          date: formatDate(article.date),
          link: buildArticleLink(article),
          category: mapCategory(article.categories),
          image: extractImage(article) || getPlaceholderImage(article.id || (index + 1))
        };
        
        console.log('✅ Article traité:', {
          id: processed.id,
          title: processed.title,
          date: processed.date,
          category: processed.category,
          hasImage: !!processed.image,
          imageUrl: processed.image
        });
        
        return processed;
      });

      setArticles(processedArticles);
      console.log(`✅ ${processedArticles.length} articles WordPress traités`);
      
    } catch (err) {
      console.error('❌ Erreur:', err);
      setError(err.message);
      setArticles([]); // PAS DE FALLBACKS
    } finally {
      setLoading(false);
    }
  };

  const extractTitle = (article) => {
    if (!article) return 'Sans titre';
    
    if (article.title && typeof article.title === 'object' && article.title.rendered) {
      return article.title.rendered;
    }
    
    if (typeof article.title === 'string') {
      return article.title;
    }
    
    return 'Sans titre';
  };

  const extractExcerpt = (article) => {
    if (!article) return 'Pas de description disponible.';

    let rawText = '';

    // WordPress excerpt.rendered
    if (article.excerpt && typeof article.excerpt === 'object' && article.excerpt.rendered) {
      rawText = article.excerpt.rendered;
    }
    // Excerpt direct
    else if (typeof article.excerpt === 'string') {
      rawText = article.excerpt;
    }
    // Début du contenu
    else if (article.content && typeof article.content === 'object' && article.content.rendered) {
      rawText = article.content.rendered.substring(0, 200);
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

  const buildArticleLink = (article) => {
    if (!article) return BLOG_BASE_URL;
    
    // Lien WordPress complet (corrigé pour production)
    if (article.link && typeof article.link === 'string') {
      return article.link.replace('https://blog-wp-production.up.railway.app', BLOG_BASE_URL);
    }
    
    // Construction à partir du slug
    if (article.slug && typeof article.slug === 'string') {
      return `${BLOG_BASE_URL}/${article.slug}`;
    }
    
    return BLOG_BASE_URL;
  };

  const mapCategory = (categories) => {
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return 'ARTICLE';
    }
    
    const categoryMap = {
      1: 'STRATÉGIE',
      2: 'TENDANCES', 
      3: 'PUBLICITÉ',
      4: 'ANALYSE',
      44: 'STRATÉGIE'
    };
    
    return categoryMap[categories[0]] || 'ARTICLE';
  };

  const extractImage = (article) => {
    if (!article) return null;
    
    console.log(`🖼️ Extraction image pour article ${article.id}:`, {
      hasEmbedded: !!article._embedded,
      hasFeaturedMedia: !!(article._embedded && article._embedded['wp:featuredmedia']),
      featuredImageUrl: article.featured_image_url,
      hasContent: !!article.content
    });
    
    // Fonction helper pour transformer les URLs de staging vers production
    const transformImageUrl = (url) => {
      if (!url || typeof url !== 'string') return url;
      
      // Transformer les URLs de staging vers production
      const transformedUrl = url.replace(
        'https://blog-wp-production.up.railway.app',
        'https://blog.mdmcmusicads.com'
      );
      
      if (transformedUrl !== url) {
        console.log(`🔄 URL transformée: ${url} → ${transformedUrl}`);
      }
      
      return transformedUrl;
    };
    
    try {
      // Méthode 1: Featured media WordPress (_embedded)
      if (article._embedded && 
          article._embedded['wp:featuredmedia'] && 
          Array.isArray(article._embedded['wp:featuredmedia']) &&
          article._embedded['wp:featuredmedia'].length > 0) {
        
        const featuredMedia = article._embedded['wp:featuredmedia'][0];
        console.log(`📷 Featured media trouvé:`, featuredMedia);
        
        // Source URL directe
        if (featuredMedia.source_url) {
          const transformedUrl = transformImageUrl(featuredMedia.source_url);
          console.log(`✅ Image WordPress trouvée: ${transformedUrl}`);
          return transformedUrl;
        }
        
        // Media details avec différentes tailles
        if (featuredMedia.media_details && featuredMedia.media_details.sizes) {
          const sizes = featuredMedia.media_details.sizes;
          // Priorité: large > medium_large > medium > thumbnail > full
          const preferredSizes = ['large', 'medium_large', 'medium', 'full', 'thumbnail'];
          
          for (const sizeKey of preferredSizes) {
            if (sizes[sizeKey] && sizes[sizeKey].source_url) {
              const transformedUrl = transformImageUrl(sizes[sizeKey].source_url);
              console.log(`✅ Image WordPress (${sizeKey}): ${transformedUrl}`);
              return transformedUrl;
            }
          }
        }
      }
      
      // Méthode 2: featured_image_url directe
      if (article.featured_image_url && typeof article.featured_image_url === 'string') {
        const transformedUrl = transformImageUrl(article.featured_image_url);
        console.log(`✅ Featured image directe: ${transformedUrl}`);
        return transformedUrl;
      }
      
      // Méthode 3: featured_media_src (parfois présent)
      if (article.featured_media_src && typeof article.featured_media_src === 'string') {
        const transformedUrl = transformImageUrl(article.featured_media_src);
        console.log(`✅ Featured media src: ${transformedUrl}`);
        return transformedUrl;
      }
      
      // Méthode 4: Recherche dans le contenu HTML
      if (article.content && typeof article.content === 'object' && article.content.rendered) {
        const imgMatches = article.content.rendered.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
        if (imgMatches && imgMatches.length > 0) {
          // Extraire la première URL d'image
          const srcMatch = imgMatches[0].match(/src=["']([^"']+)["']/);
          if (srcMatch && srcMatch[1]) {
            const transformedUrl = transformImageUrl(srcMatch[1]);
            console.log(`✅ Image extraite du contenu: ${transformedUrl}`);
            return transformedUrl;
          }
        }
      }
      
      console.log(`⚠️ Aucune image trouvée pour l'article ${article.id}`);
      
    } catch (err) {
      console.error(`❌ Erreur extraction image article ${article.id}:`, err);
    }
    
    return null;
  };

  const getPlaceholderImage = (articleId) => {
    // Images variées liées à la musique/marketing
    const placeholders = [
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop&crop=center", // Concert
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=400&fit=crop&crop=center", // Studio
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop&crop=center", // Marketing
      "https://images.unsplash.com/photo-1499415479124-43c32433a620?w=800&h=400&fit=crop&crop=center", // Microphone
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&h=400&fit=crop&crop=center"  // Concert night
    ];
    
    // Utiliser l'ID de l'article pour avoir des images différentes
    const id = typeof articleId === 'number' ? articleId : parseInt(articleId) || 1;
    const imageIndex = (id - 1) % placeholders.length;
    const selectedImage = placeholders[imageIndex];
    
    console.log(`🖼️ Placeholder sélectionné pour article ${articleId}: index ${imageIndex}, image: ${selectedImage}`);
    return selectedImage;
  };

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
    
    const cssClass = classes[category] || 'article';
    console.log(`🎨 Classe CSS pour catégorie "${category}": ${cssClass}`);
    return cssClass;
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

  // ERROR - Sans fallbacks
  if (error || articles.length === 0) {
    return (
      <section className="articles-section">
        <div className="articles-container">
          <div className="no-articles-message">
            <div className="no-articles-content">
              <h3>Articles temporairement indisponibles</h3>
              <p>
                {error 
                  ? `Problème de connexion: ${error}` 
                  : 'Aucun article disponible actuellement.'
                }
              </p>
              <p>Consultez directement notre blog :</p>
              <button 
                className="visit-blog-btn"
                onClick={() => window.open(BLOG_BASE_URL, '_blank')}
              >
                Visiter le Blog MDMC
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // SUCCESS - Articles WordPress réels
  return (
    <section className="articles-section">
      <div className="articles-container">
        <div className="articles-header">
          <h2>Derniers Articles</h2>
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
