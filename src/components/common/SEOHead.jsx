import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

// Configuration SEO globale
const SEO_CONFIG = {
  siteName: 'MDMC Music Ads',
  siteUrl: 'https://www.mdmcmusicads.com',
  defaultTitle: 'MDMC - Marketing Musical Expert',
  defaultDescription: 'Agence marketing spécialisée dans l\'industrie musicale. YouTube Ads, Meta Ads, TikTok Ads pour artistes et labels.',
  defaultImage: '/assets/images/og-image.jpg',
  twitterHandle: '@mdmcmusicads',
  languages: ['fr', 'en', 'es', 'pt'],
  defaultLang: 'fr'
};

// Composant SEO principal
const SEOHead = ({ 
  title,
  description,
  canonical,
  image,
  type = 'website',
  article = null,
  noindex = false,
  hreflang = {},
  schema = null
}) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.split('-')[0] || 'fr';
  
  // Construction des URLs hreflang
  const hreflangUrls = {
    fr: `${SEO_CONFIG.siteUrl}/`,
    en: `${SEO_CONFIG.siteUrl}/en/`,
    es: `${SEO_CONFIG.siteUrl}/es/`,
    pt: `${SEO_CONFIG.siteUrl}/pt/`,
    ...hreflang
  };

  // Titre final
  const finalTitle = title 
    ? `${title} | ${SEO_CONFIG.siteName}`
    : SEO_CONFIG.defaultTitle;

  // Description finale
  const finalDescription = description || SEO_CONFIG.defaultDescription;

  // Image finale
  const finalImage = image?.startsWith('http') 
    ? image 
    : `${SEO_CONFIG.siteUrl}${image || SEO_CONFIG.defaultImage}`;

  // URL canonique
  const canonicalUrl = canonical?.startsWith('http')
    ? canonical
    : `${SEO_CONFIG.siteUrl}${canonical || '/'}`;

  return (
    <Helmet>
      {/* Langue de la page */}
      <html lang={currentLang} />
      
      {/* Méta de base */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content={noindex ? 'noindex,nofollow' : 'index,follow'} />
      
      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Hreflang */}
      {Object.entries(hreflangUrls).map(([lang, url]) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={url} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={hreflangUrls.fr} />
      
      {/* Open Graph */}
      <meta property="og:site_name" content={SEO_CONFIG.siteName} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content={currentLang === 'fr' ? 'fr_FR' : `${currentLang}_${currentLang.toUpperCase()}`} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={SEO_CONFIG.twitterHandle} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
      
      {/* Article spécifique */}
      {article && (
        <>
          <meta property="article:author" content={article.author} />
          <meta property="article:published_time" content={article.publishedTime} />
          <meta property="article:modified_time" content={article.modifiedTime} />
          <meta property="article:section" content={article.section} />
          {article.tags?.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Schema.org JSON-LD */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema, null, 2)}
        </script>
      )}
    </Helmet>
  );
};

// Hook pour générer les schemas
export const useSchemaGenerator = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.split('-')[0] || 'fr';

  const generateOrganizationSchema = () => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MDMC Music Ads",
    "alternateName": "MDMC",
    "url": SEO_CONFIG.siteUrl,
    "logo": `${SEO_CONFIG.siteUrl}/assets/images/logo.png`,
    "description": "Agence marketing spécialisée dans l'industrie musicale",
    "foundingDate": "2018",
    "sameAs": [
      "https://www.instagram.com/mdmcmusicads",
      "https://www.youtube.com/@mdmcmusicads",
      "https://www.linkedin.com/company/mdmc-music-ads"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+33-X-XX-XX-XX-XX",
      "contactType": "customer service",
      "availableLanguage": ["French", "English", "Spanish", "Portuguese"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "FR",
      "addressLocality": "Paris"
    },
    "areaServed": "Worldwide",
    "serviceType": "Digital Marketing for Music Industry"
  });

  const generateWebsiteSchema = () => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SEO_CONFIG.siteName,
    "url": SEO_CONFIG.siteUrl,
    "description": SEO_CONFIG.defaultDescription,
    "inLanguage": currentLang,
    "publisher": {
      "@type": "Organization",
      "name": "MDMC Music Ads"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${SEO_CONFIG.siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  });

  const generateServiceSchema = (service) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.name,
    "description": service.description,
    "provider": {
      "@type": "Organization",
      "name": "MDMC Music Ads"
    },
    "serviceType": "Digital Marketing",
    "category": "Music Industry Marketing",
    "areaServed": "Worldwide",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Marketing Services",
      "itemListElement": service.offerings?.map(offering => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": offering.name,
          "description": offering.description
        }
      }))
    }
  });

  const generateBreadcrumbSchema = (breadcrumbs) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  });

  const generateFAQSchema = (faqs) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  });

  const generateArticleSchema = (article) => ({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "image": article.image,
    "author": {
      "@type": "Person",
      "name": article.author || "MDMC Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "MDMC Music Ads",
      "logo": {
        "@type": "ImageObject",
        "url": `${SEO_CONFIG.siteUrl}/assets/images/logo.png`
      }
    },
    "datePublished": article.publishedDate,
    "dateModified": article.modifiedDate || article.publishedDate,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": article.url
    }
  });

  return {
    generateOrganizationSchema,
    generateWebsiteSchema,
    generateServiceSchema,
    generateBreadcrumbSchema,
    generateFAQSchema,
    generateArticleSchema
  };
};

// HOC pour pages avec SEO
export const withSEO = (Component, seoConfig = {}) => {
  return function SEOWrappedComponent(props) {
    const schemaGenerator = useSchemaGenerator();
    
    // Schema par défaut pour toutes les pages
    const defaultSchemas = [
      schemaGenerator.generateOrganizationSchema(),
      schemaGenerator.generateWebsiteSchema()
    ];

    const finalSchema = seoConfig.schema 
      ? [...defaultSchemas, ...seoConfig.schema] 
      : defaultSchemas;

    return (
      <>
        <SEOHead 
          {...seoConfig}
          schema={finalSchema}
          {...props.seo}
        />
        <Component {...props} />
      </>
    );
  };
};

// Composant pour la page d'accueil
export const HomePageSEO = () => {
  const schemaGenerator = useSchemaGenerator();
  const { t } = useTranslation();

  const homeSchema = [
    schemaGenerator.generateOrganizationSchema(),
    schemaGenerator.generateWebsiteSchema(),
    schemaGenerator.generateServiceSchema({
      name: t('seo.services.name', 'Services Marketing Musical'),
      description: t('seo.services.description', 'Services complets de marketing digital pour l\'industrie musicale'),
      offerings: [
        { name: 'YouTube Ads', description: 'Campagnes publicitaires YouTube optimisées' },
        { name: 'Meta Ads', description: 'Publicités Facebook et Instagram' },
        { name: 'TikTok Ads', description: 'Marketing musical sur TikTok' }
      ]
    })
  ];

  return (
    <SEOHead
      title={t('seo.home.title', 'Marketing Musical Expert - Campagnes Publicitaires')}
      description={t('seo.home.description', 'Propulsez votre musique avec des campagnes publicitaires qui convertissent. YouTube Ads, Meta Ads, TikTok Ads pour artistes et labels.')}
      canonical="/"
      schema={homeSchema}
    />
  );
};

export default SEOHead;
