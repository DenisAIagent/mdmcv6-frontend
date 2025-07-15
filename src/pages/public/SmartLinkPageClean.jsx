/**
 * 🎨 SmartLink Page - Design épuré avec carte centrale
 * Design moderne, style Apple Music/Spotify avec carte blanche centrée
 */

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import apiService from "../../services/api.service";
import { useTerritorialFilter } from "../../hooks/useGeolocation";
import { usePlatformOrder, usePlatformOrderAnalytics } from "../../hooks/usePlatformOrder";
import { useURLGeneration, useClickTracking, useUTMParams, useSocialMetadata } from "../../hooks/useURLGeneration";
import "./SmartLinkPageClean.css";

// 🎯 Fonction d'injection des analytics côté client
const injectAnalyticsScripts = async (trackingIds) => {
  if (!trackingIds) {
    console.warn("🎯 Pas de trackingIds fournis");
    return;
  }
  
  console.log("🎯 Injection analytics côté client:", trackingIds);
  
  // 🎯 Google Analytics 4
  if (trackingIds.ga4Id && trackingIds.ga4Id.trim()) {
    if (!window.gtag) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingIds.ga4Id}`;
      document.head.appendChild(script);
      
      await new Promise(resolve => {
        script.onload = () => {
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', trackingIds.ga4Id, {
            page_title: document.title,
            page_location: window.location.href,
            custom_parameter: 'smartlink_client_injection'
          });
          console.log("🎯 GA4 injecté côté client:", trackingIds.ga4Id);
          resolve();
        };
      });
    }
  }
  
  // 🎯 Google Tag Manager
  if (trackingIds.gtmId && trackingIds.gtmId.trim()) {
    if (!window.dataLayer) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js'
      });
      
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${trackingIds.gtmId}`;
      document.head.appendChild(script);
      
      console.log("🎯 GTM injecté côté client:", trackingIds.gtmId);
    }
  }
  
  // 🎯 Meta Pixel
  if (trackingIds.metaPixelId && trackingIds.metaPixelId.trim()) {
    if (!window.fbq) {
      !function(f,b,e,v,n,t,s) {
        if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)
      }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
      
      window.fbq('init', trackingIds.metaPixelId);
      window.fbq('track', 'PageView');
      console.log("🎯 Meta Pixel injecté côté client:", trackingIds.metaPixelId);
    }
  }
  
  // 🎯 TikTok Pixel
  if (trackingIds.tiktokPixelId && trackingIds.tiktokPixelId.trim()) {
    if (!window.ttq) {
      !function (w, d, t) {
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
        ttq.load(trackingIds.tiktokPixelId);
        ttq.page();
        console.log("🎯 TikTok Pixel injecté côté client:", trackingIds.tiktokPixelId);
      }(window, document, 'ttq');
    }
  }
};

// Import des icônes des plateformes
import {
  SiSpotify,
  SiApplemusic,
  SiYoutubemusic,
  SiAmazonmusic,
  SiTidal,
  SiSoundcloud,
  SiYoutube,
  SiPandora
} from 'react-icons/si';
import { MdMusicNote, MdLibraryMusic, MdQueueMusic } from 'react-icons/md';

const SmartLinkPageClean = () => {
  console.log("🎨 SmartLinkPageClean - Design épuré chargé!");
  
  const { artistSlug, trackSlug } = useParams();
  const [smartLinkData, setSmartLinkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 🎨 Solution A : React State pour background image
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef(null);

  // 🌍 Filtrage territorial des plateformes
  const platformLinks = smartLinkData?.smartLink?.platformLinks || [];
  const {
    filtered: territorialPlatforms,
    isLoading: geoLoading,
    location,
    total,
    kept
  } = useTerritorialFilter(platformLinks, {
    autoDetect: true,
    enableCache: true
  });

  // 🎛️ Ordre personnalisé avec A/B testing
  const {
    platforms: availablePlatforms,
    orderSource,
    abTestVariant
  } = usePlatformOrder(territorialPlatforms, {
    enableABTest: true,
    userCountry: location?.countryCode,
    autoApply: true
  });

  // 📊 Analytics pour l'ordre des plateformes
  const { trackPlatformClick } = usePlatformOrderAnalytics();

  // 🔗 Génération d'URLs propres et tracking
  const { urls, socialMetadata, trackClick } = useURLGeneration(smartLinkData, {
    format: 'artist',
    enableMultiChannel: true
  });

  // 📊 Tracking avancé des clics
  const { trackClick: trackSmartLinkClick } = useClickTracking(smartLinkData);

  // 🏷️ Paramètres UTM dans l'URL actuelle
  const { utmParams, hasUTM, source: utmSource } = useUTMParams();

  // 🌐 Métadonnées sociales
  const { updateMetaTags } = useSocialMetadata(smartLinkData);

  // 🎨 Gestion de la classe body pour retirer la couleur de fond
  useEffect(() => {
    document.body.classList.add('smartlink-page');
    return () => {
      document.body.classList.remove('smartlink-page');
    };
  }, []);

  useEffect(() => {
    console.log("🎯 SmartLinkPageClean mounted with params:", { artistSlug, trackSlug });
    
    const fetchSmartLink = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("🔗 Chargement SmartLink:", { artistSlug, trackSlug });
        
        const response = await apiService.smartlinks.getBySlugs(artistSlug, trackSlug);
        
        if (response && response.success && response.data) {
          console.log("✅ SmartLink chargé:", response.data);
          
          // 🎨 DEBUG - Logs obligatoires pour diagnostic
          console.log("🎨 DEBUG - SmartLink data:", response.data);
          console.log("🎨 DEBUG - Cover URL:", response.data.smartLink?.coverImageUrl);
          console.log("🎨 DEBUG - Cover URL type:", typeof response.data.smartLink?.coverImageUrl);
          
          setSmartLinkData(response.data);
          
          // 🎯 INJECTION CÔTÉ CLIENT des analytics pour HashRouter
          await injectAnalyticsScripts(response.data.smartLink?.trackingIds);
          
          // 🌐 Mettre à jour les métadonnées sociales
          setTimeout(() => {
            updateMetaTags();
          }, 100);
          
          // 🎨 BACKGROUND ARTWORK selon vos spécifications exactes
          const artworkUrl = response.data.smartLink?.coverImageUrl;
          console.log("🎨 Artwork URL found:", artworkUrl);
          
          // 🧪 Test 1 : URL Validity
          const validateImageUrl = (url) => {
            if (!url) return false;
            if (typeof url !== 'string') return false;
            if (!url.startsWith('http')) return false;
            return true;
          };
          
          // 🎨 Solution A : React State (RECOMMANDÉE)
          if (validateImageUrl(artworkUrl)) {
            console.log("🎨 DEBUG - Attempting to load:", artworkUrl);
            console.log("🎨 DEBUG - URL validation passed");
            
            const img = new Image();
            img.onload = () => {
              console.log("✅ DEBUG - Image loaded successfully");
              setBackgroundImage(artworkUrl);
              setBackgroundLoaded(true);
              console.log("🎨 DEBUG - React state updated with background image");
            };
            
            img.onerror = (error) => {
              console.error("❌ DEBUG - Image load failed:", artworkUrl, error);
              console.error("Image load failed, using fallback");
              setBackgroundLoaded(true); // Affiche le fallback
            };
            
            img.src = artworkUrl;
          } else {
            console.warn("❌ DEBUG - Invalid image URL:", artworkUrl);
            console.warn("🎨 No artwork URL found in SmartLink data");
            setBackgroundLoaded(true); // Affiche le fallback
          }
        } else {
          throw new Error(response?.error || "SmartLink non trouvé");
        }
      } catch (err) {
        console.error("❌ Erreur SmartLink:", err);
        setError(err.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    if (artistSlug && trackSlug) {
      fetchSmartLink();
    } else {
      setError("Paramètres manquants");
      setLoading(false);
    }

    // 🎨 Cleanup automatique avec React State (plus besoin de manipulation DOM)
  }, [artistSlug, trackSlug]);

  // 🎵 Gestion de la lecture audio
  // 📊 Fonction pour tracker les clics dans la base de données
  const trackPlatformClickToDatabase = async (smartLinkId, platformName) => {
    try {
      console.log(`📊 Envoi tracking clic: ${platformName} pour SmartLink ${smartLinkId}`);
      
      // Validation des paramètres
      if (!smartLinkId || !platformName) {
        console.warn('⚠️ Paramètres manquants pour le tracking:', { smartLinkId, platformName });
        return;
      }

      const response = await fetch(`https://mdmcv4-backend-production-b615.up.railway.app/api/v1/smartlinks/${smartLinkId}/log-platform-click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platformName: platformName
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Clic ${platformName} enregistré:`, result.data);
        console.log(`📊 Total clics: ${result.data.totalClicks}, Clics ${platformName}: ${result.data.platformClicks}`);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
        console.warn(`⚠️ Échec tracking ${platformName} (${response.status}):`, errorData.error);
        
        // Log détaillé pour debug
        if (response.status === 404) {
          console.warn(`🔍 SmartLink ID ${smartLinkId} introuvable - vérifiez que le SmartLink existe`);
        } else if (response.status === 401) {
          console.warn('🔐 Erreur d\'authentification - vérifiez la configuration API');
        }
      }
    } catch (error) {
      console.error(`❌ Erreur réseau tracking ${platformName}:`, error);
      // Ne pas interrompre l'expérience utilisateur pour une erreur de tracking
    }
  };

  const handlePlayAudio = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('🎵 Play button clicked!');
    console.log('🎵 Audio ref:', audioRef.current);
    console.log('🎵 Audio URL:', smartLinkData?.smartLink?.previewAudioUrl);
    console.log('🎵 Is playing:', isPlaying);
    
    const audioUrl = smartLinkData?.smartLink?.previewAudioUrl;
    
    if (!audioUrl) {
      console.log('❌ Pas d\'URL audio disponible');
      return;
    }

    // Initialiser l'audio element si pas encore fait
    if (!audioRef.current) {
      console.log('🎵 Initialisation audio element');
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onpause = () => setIsPlaying(false);
      audioRef.current.onplay = () => setIsPlaying(true);
    }

    try {
      if (isPlaying) {
        console.log('⏸️ Pausing audio');
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        console.log('▶️ Playing audio from:', audioUrl);
        
        // S'assurer que la source est correcte
        if (audioRef.current.src !== audioUrl) {
          audioRef.current.src = audioUrl;
        }
        
        await audioRef.current.play();
        setIsPlaying(true);
        console.log('✅ Audio started playing');
      }
    } catch (error) {
      console.error('❌ Erreur lecture audio:', error);
      setIsPlaying(false);
      
      // Essayer de créer un nouvel élément audio
      try {
        audioRef.current = new Audio(audioUrl);
        await audioRef.current.play();
        setIsPlaying(true);
        console.log('✅ Audio started playing (retry)');
      } catch (retryError) {
        console.error('❌ Erreur même en retry:', retryError);
      }
    }
  };

  const handlePlatformClick = (platform, url) => {
    console.log(`🔗 Clicked on ${platform.platform}:`, url);
    
    // 📊 Tracking de l'ordre des plateformes
    const platformPosition = availablePlatforms.findIndex(p => p.platform === platform.platform) + 1;
    trackPlatformClick(platform.platform, platformPosition);
    
    // 🎯 Tracking analytics injectés côté client
    if (window.gtag) {
      window.gtag('event', 'platform_click', {
        event_category: 'smartlink',
        event_label: platform.platform,
        smartlink_artist: artistSlug,
        smartlink_track: trackSlug,
        platform_position: platformPosition,
        custom_parameter: 'smartlink_client_tracking'
      });
      console.log("🎯 GA4 tracking: platform_click", platform.platform);
    }
    
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'smartlink_platform_click',
        platform: platform.platform,
        artist: artistSlug,
        track: trackSlug,
        position: platformPosition,
        order_source: orderSource,
        ab_test_variant: abTestVariant
      });
      console.log("🎯 GTM tracking: smartlink_platform_click", platform.platform);
    }
    
    if (window.fbq) {
      window.fbq('track', 'Lead', {
        content_name: `${artistSlug} - ${trackSlug}`,
        content_category: 'Music',
        platform: platform.platform,
        value: platformPosition
      });
      console.log("🎯 Meta Pixel tracking: Lead", platform.platform);
    }
    
    if (window.ttq) {
      window.ttq.track('ClickButton', {
        content_name: `${artistSlug} - ${trackSlug}`,
        platform: platform.platform,
        button_text: platform.platform
      });
      console.log("🎯 TikTok Pixel tracking: ClickButton", platform.platform);
    }
    
    // 🔗 Tracking avancé avec URLs et UTM
    const currentUrl = window.location.href;
    trackSmartLinkClick(currentUrl, platform.platform, {
      position: platformPosition,
      orderSource,
      abTestVariant,
      utmSource,
      hasUTM,
      destinationUrl: url
    });
    
    // 📊 Tracking avec service URLs
    trackClick(url, {
      platform: platform.platform,
      position: platformPosition,
      source: utmSource || 'direct'
    });
    
    // 📊 Enregistrer le clic dans la base de données
    if (smartLinkData?.smartLink?._id) {
      console.log("📊 Tracking platform click:", { 
        platform: platform.platform, 
        position: platformPosition,
        orderSource,
        abTestVariant,
        utmParams 
      });
      
      // Appel API pour tracker le clic
      trackPlatformClickToDatabase(smartLinkData.smartLink._id, platform.platform);
    }
    
    // Redirect to platform
    setTimeout(() => {
      window.open(url, '_blank');
    }, 150);
  };

  const getPlatformIcon = (platformName) => {
    const platform = platformName.toLowerCase().replace(/\s+/g, '');
    
    const iconMap = {
      'spotify': SiSpotify,
      'applemusic': SiApplemusic,
      'apple': SiApplemusic,
      'youtubemusic': SiYoutubemusic,
      'youtube': SiYoutube,
      'amazonmusic': SiAmazonmusic,
      'amazon': SiAmazonmusic,
      'deezer': MdMusicNote,
      'tidal': SiTidal,
      'soundcloud': SiSoundcloud,
      'pandora': SiPandora,
      'itunes': SiApplemusic,
      'napster': MdLibraryMusic,
      'audiomack': MdQueueMusic,
      'anghami': MdMusicNote,
      'qobuz': MdMusicNote
    };

    return iconMap[platform] || MdMusicNote;
  };

  const getPlatformCTA = (platformName) => {
    const platform = platformName.toLowerCase();
    if (platform.includes('itunes') || platform.includes('amazon')) return 'Download';
    return 'Play';
  };

  const getPlatformSubtext = (platformName) => {
    const subtexts = {
      'Spotify': 'Music for everyone',
      'Apple Music': 'Music everywhere',
      'YouTube Music': 'Music videos & more',
      'Amazon Music': 'Prime music',
      'Deezer': 'High quality music',
      'Tidal': 'High fidelity',
      'SoundCloud': 'Music & audio',
      'YouTube': 'Watch & listen',
      'Pandora': 'Radio & podcasts',
      'iTunes': 'Download music',
      'Napster': 'Music streaming',
      'Audiomack': 'Hip-hop & more'
    };
    return subtexts[platformName] || 'Music streaming';
  };

  if (loading) {
    return (
      <div className="smartlink-clean">
        <div className="background-artwork"></div>
        <div className="main-card">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="smartlink-clean">
        <div className="background-artwork"></div>
        <div className="main-card">
          <div className="error-container">
            <h2>😕 Not Found</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!smartLinkData?.smartLink || !smartLinkData?.artist) {
    return (
      <div className="smartlink-clean">
        <div className="background-artwork"></div>
        <div className="main-card">
          <div className="error-container">
            <h2>😕 Missing Data</h2>
            <p>Unable to load SmartLink data</p>
          </div>
        </div>
      </div>
    );
  }

  const { smartLink, artist } = smartLinkData;
  const title = `${smartLink.trackTitle} - ${artist.name}`;
  const coverImage = smartLink.coverImageUrl || "https://via.placeholder.com/120x120/f0f0f0/666?text=🎵";

  return (
    <HelmetProvider>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={`Listen to ${smartLink.trackTitle} by ${artist.name} on your favorite platform.`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={`Listen to ${smartLink.trackTitle} by ${artist.name} on your favorite platform.`} />
        <meta property="og:image" content={coverImage} />
        <meta property="og:type" content="music.song" />
      </Helmet>
      
      <div className="smartlink-clean">
        {/* 🎨 Background artwork avec React State (Solution A) */}
        <div 
          className={`background-artwork ${backgroundLoaded ? 'loaded' : ''}`}
          style={{
            backgroundImage: backgroundImage ? `url("${backgroundImage}")` : 'none'
          }}
        ></div>
        
        {/* 🎨 Carte centrale selon vos spécifications */}
        <div className="main-card">
          {/* Pochette de l'album avec bouton play intégré */}
          <div 
            className={`album-cover-container ${!smartLinkData?.smartLink?.previewAudioUrl ? 'disabled' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              console.log('🖱️ Container clicked!', e);
              console.log('🎵 Preview audio URL:', smartLinkData?.smartLink?.previewAudioUrl);
              if (smartLinkData?.smartLink?.previewAudioUrl) {
                handlePlayAudio();
              }
            }}
          >
            <img 
              src={coverImage}
              alt={`${smartLink.trackTitle} - ${artist.name}`} 
              className="album-cover"
            />
            {/* Afficher le bouton play seulement si on a une URL audio */}
            {smartLinkData?.smartLink?.previewAudioUrl && (
              <div 
                className="play-overlay-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('🖱️ Play button clicked directly!');
                  handlePlayAudio(e);
                }}
              >
                <div className={`play-triangle ${isPlaying ? 'playing' : ''}`}></div>
              </div>
            )}
          </div>
          
          {/* Titre de l'album centré */}
          <h1 className="album-title">{smartLink.trackTitle}</h1>
          
          {/* Nom de l'artiste */}
          <p className="artist-name">{artist.name}</p>
          
          {/* Sous-titre */}
          <div className="subtitle">
            {smartLink.useDescriptionAsSubtitle && smartLink.description 
              ? smartLink.description 
              : smartLink.customSubtitle || "Choose music service"
            }
          </div>
          
          {/* Liste verticale des plateformes */}
          <div className="platform-list">
            {availablePlatforms?.filter(link => link.url && link.platform).map((platform, index) => {
              const IconComponent = getPlatformIcon(platform.platform);
              return (
                <div 
                  key={`${platform.platform}-${index}`}
                  className="platform-row" 
                  onClick={() => handlePlatformClick(platform, platform.url)}
                >
                  {/* Logo + Nom à gauche */}
                  <div className="platform-left">
                    <IconComponent className="platform-logo" />
                    <div className="platform-info">
                      <span className="platform-name">{platform.platform}</span>
                      <span className="platform-subtext">{getPlatformSubtext(platform.platform)}</span>
                    </div>
                  </div>
                  
                  {/* Bouton à droite */}
                  <button className="platform-btn">
                    {getPlatformCTA(platform.platform)}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </HelmetProvider>
  );
};

export default SmartLinkPageClean;