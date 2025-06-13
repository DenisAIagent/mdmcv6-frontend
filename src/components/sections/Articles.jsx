import React, { useState, useEffect } from 'react';
import '../../assets/styles/articles.css';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BLOG_BASE_URL = 'https://blog.mdmcmusicads.com';

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Articles: Récupération directe WordPress...');
      
      const apiUrl = `${BLOG_BASE_URL}/wp-json/wp/v2/posts?per_page=3&_embed`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`WordPress API error: ${response.status}`);
      }
      
      const posts = await response.json();
      console.log('✅ Articles: Récupérés directement', { count: posts.length });
      
      const formattedArticles = posts.map(post => formatWordPressPost(post));
      setArticles(formattedArticles);
      
    } catch (err) {
      console.error('❌ Articles: Erreur WordPress API', err);
      setError(err.message);
      // Fallback articles
      setArticles(getFallbackArticles());
      console.log('🔄 Articles: Fallback activé');
    } finally {
      setLoading(false);
    }
  };

  const formatWordPressPost = (post) => {
    // Extraction d'image intelligente
    let imageUrl = extractWordPressImage(post);
    
    // Correction des URLs internes
    const fixedImageUrl = imageUrl ? imageUrl.replace(
      'https://blog-wp-production.up.railway.app', 
      BLOG_BASE_URL
    ) : null;
    
    return {
      id: post.id,
      title: post.title.rendered,
      excerpt: post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
      link: post.link.replace('https://blog-wp-production.up.railway.app', BLOG_BASE_URL),
      image: fixedImageUrl,
      date: new Date(post.date).toLocaleDateString('fr-FR'),
      author: post._embedded?.author?.[0]?.name || 'MDMC Team'
    };
  };

  const extractWordPressImage = (post) => {
    // 1. Image mise en avant
    if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
      console.log('✅ Image WordPress trouvée:', post._embedded['wp:featuredmedia'][0].source_url);
      return post._embedded['wp:featuredmedia'][0].source_url;
    }
    
    // 2. Première image du contenu
    const contentMatch = post.content?.rendered?.match(/<img[^>]+src="([^">]+)"/);
    if (contentMatch) {
      console.log('✅ Image contenu trouvée:', contentMatch[1]);
      return contentMatch[1];
    }
    
    // 3. Placeholder basé sur l'ID
    const placeholderUrl = `https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=250&fit=crop&q=80&sig=${post.id}`;
    console.log('🔄 Image placeholder:', placeholderUrl);
    return placeholderUrl;
  };

  const getFallbackArticles = () => {
    return [
      {
        id: 1,
        title: "Stratégies Marketing Digital 2025",
        excerpt: "Découvrez les tendances qui révolutionnent le marketing digital cette année. De l'IA aux nouvelles plateformes sociales...",
        link: "https://blog.mdmcmusicads.com",
        image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=250&fit=crop&q=80",
        date: new Date().toLocaleDateString('fr-FR'),
        author: "MDMC Team"
      },
      {
        id: 2,
        title: "ROI et Performance : Mesurer l'Impact",
        excerpt: "Comment optimiser vos campagnes pour un retour sur investissement maximal. Métriques clés et outils essentiels...",
        link: "https://blog.mdmcmusicads.com",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop&q=80",
        date: new Date().toLocaleDateString('fr-FR'),
        author: "MDMC Team"
      },
      {
        id: 3,
        title: "Innovation Créative et Technologie",
        excerpt: "L'alliance parfaite entre créativité et innovation technologique pour des campagnes inoubliables...",
        link: "https://blog.mdmcmusicads.com",
        image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=250&fit=crop&q=80",
        date: new Date().toLocaleDateString('fr-FR'),
        author: "MDMC Team"
      }
    ];
  };

  if (loading) {
    return (
      <section className="articles-section">
        <div className="articles-container">
          <h2>Derniers articles</h2>
          <div className="articles-loading">
            <div className="loading-spinner"></div>
            <p>Chargement des articles...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error && articles.length === 0) {
    return (
      <section className="articles-section">
        <div className="articles-container">
          <h2>Articles temporairement indisponibles</h2>
          <div className="articles-error">
            <p>Problème de connexion: {error}</p>
            <p>Consultez directement notre blog :</p>
            <a 
              href="https://blog.mdmcmusicads.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="blog-link-button"
            >
              VISITER LE BLOG MDMC
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="articles-section">
      <div className="articles-container">
        <div className="articles-header">
          <h2>Derniers articles</h2>
          <p>Découvrez nos insights et stratégies pour booster votre business</p>
        </div>
        
        <div className="articles-grid">
          {articles.map((article) => (
            <article key={article.id} className="article-card">
              <div className="article-image">
                <img 
                  src={article.image} 
                  alt={article.title}
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=250&fit=crop&q=80';
                  }}
                />
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
            Voir tous les articles
          </a>
        </div>
      </div>
    </section>
  );
};

export default Articles;console.log('TEST DEPLOY ACTIF Fri Jun 13 20:45:43 WEST 2025');
