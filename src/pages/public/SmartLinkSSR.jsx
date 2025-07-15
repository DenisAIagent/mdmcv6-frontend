/**
 * 🎯 SmartLinkSSR - Architecture unifiée pour analytics fonctionnels
 * 
 * Cette page est conçue pour fonctionner avec l'injection SSR des analytics
 * tout en gardant la réactivité React pour l'interface utilisateur.
 * 
 * PRINCIPE : Les analytics sont injectés côté serveur et persistent,
 * React ne fait que l'affichage sans toucher aux scripts analytics.
 */

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import apiService from "../../services/api.service";
import "./SmartLinkPageClean.css";

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

const SmartLinkSSR = () => {
  console.log("🎯 SmartLinkSSR - Architecture unifiée pour analytics!");
  
  const { artistSlug, trackSlug } = useParams();
  const [smartLinkData, setSmartLinkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 🎨 États pour l'interface
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef(null);

  // 🎯 Récupération des données SSR si disponibles
  useEffect(() => {
    // Vérifier si les données sont déjà disponibles via SSR
    if (window.SMARTLINK_SSR_DATA) {
      console.log("🎯 Données SSR détectées:", window.SMARTLINK_SSR_DATA);
      // Les analytics sont déjà injectés, pas besoin de les recharger
    }
    
    // Signaler que les analytics sont actifs
    console.log("🎯 Analytics SSR Status:", {
      ga4Present: !!window.gtag,
      gtmPresent: !!window.dataLayer,
      metaPixelPresent: !!window.fbq,
      tiktokPixelPresent: !!window.ttq
    });
  }, []);

  // 🎨 Gestion de la classe body pour retirer la couleur de fond
  useEffect(() => {
    document.body.classList.add('smartlink-page');
    return () => {
      document.body.classList.remove('smartlink-page');
    };
  }, []);

  // 🔗 Chargement des données SmartLink
  useEffect(() => {
    const fetchSmartLink = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("🔗 Chargement SmartLink:", { artistSlug, trackSlug });
        
        const response = await apiService.smartlinks.getBySlugs(artistSlug, trackSlug);
        
        if (response && response.success && response.data) {
          console.log("✅ SmartLink chargé:", response.data);
          setSmartLinkData(response.data);
          
          // 🎨 Configuration du background
          const artworkUrl = response.data.smartLink?.coverImageUrl;
          if (artworkUrl && artworkUrl.startsWith('http')) {
            console.log("🎨 Chargement artwork:", artworkUrl);
            
            const img = new Image();
            img.onload = () => {
              setBackgroundImage(artworkUrl);
              setBackgroundLoaded(true);
            };
            img.onerror = () => {
              console.warn("❌ Erreur chargement artwork:", artworkUrl);
              setBackgroundLoaded(true);
            };
            img.src = artworkUrl;
          } else {
            setBackgroundLoaded(true);
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
  }, [artistSlug, trackSlug]);

  // 🎵 Gestion de la lecture audio
  const handlePlayAudio = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const audioUrl = smartLinkData?.smartLink?.previewAudioUrl;
    if (!audioUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onpause = () => setIsPlaying(false);
      audioRef.current.onplay = () => setIsPlaying(true);
    }

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        if (audioRef.current.src !== audioUrl) {
          audioRef.current.src = audioUrl;
        }
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('❌ Erreur lecture audio:', error);
      setIsPlaying(false);
    }
  };

  // 🔗 Gestion des clics sur les plateformes
  const handlePlatformClick = (platform, url) => {
    console.log(`🔗 Clicked on ${platform.platform}:`, url);
    
    // 🎯 Tracking analytics si disponibles
    if (window.gtag) {
      window.gtag('event', 'platform_click', {
        event_category: 'smartlink',
        event_label: platform.platform,
        smartlink_artist: artistSlug,
        smartlink_track: trackSlug,
        custom_parameter: 'smartlink_interaction'
      });
      console.log("🎯 GA4 tracking: platform_click", platform.platform);
    }
    
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'smartlink_platform_click',
        platform: platform.platform,
        artist: artistSlug,
        track: trackSlug
      });
      console.log("🎯 GTM tracking: smartlink_platform_click", platform.platform);
    }
    
    if (window.fbq) {
      window.fbq('track', 'Lead', {
        content_name: `${artistSlug} - ${trackSlug}`,
        content_category: 'Music',
        platform: platform.platform
      });
      console.log("🎯 Meta Pixel tracking: Lead", platform.platform);
    }
    
    if (window.ttq) {
      window.ttq.track('ClickButton', {
        content_name: `${artistSlug} - ${trackSlug}`,
        platform: platform.platform
      });
      console.log("🎯 TikTok Pixel tracking: ClickButton", platform.platform);
    }
    
    // 📊 Tracking base de données
    if (smartLinkData?.smartLink?._id) {
      trackPlatformClickToDatabase(smartLinkData.smartLink._id, platform.platform);
    }
    
    // Redirection vers la plateforme
    setTimeout(() => {
      window.open(url, '_blank');
    }, 150);
  };

  // 📊 Fonction pour tracker les clics dans la base de données
  const trackPlatformClickToDatabase = async (smartLinkId, platformName) => {
    try {
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
      } else {
        console.warn(`⚠️ Échec tracking ${platformName} (${response.status})`);
      }
    } catch (error) {
      console.error(`❌ Erreur tracking ${platformName}:`, error);
    }
  };

  // 🎨 Fonctions utilitaires pour les plateformes
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

  // 🎨 Rendu des états de chargement et d'erreur
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
  const platformLinks = smartLink.platformLinks || [];

  return (
    <HelmetProvider>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={`Listen to ${smartLink.trackTitle} by ${artist.name} on your favorite platform.`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={`Listen to ${smartLink.trackTitle} by ${artist.name} on your favorite platform.`} />
        <meta property="og:image" content={coverImage} />
        <meta property="og:type" content="music.song" />
        <meta property="og:url" content={`https://mdmcv6-frontend-production.up.railway.app/smartlinks/${artistSlug}/${trackSlug}`} />
      </Helmet>
      
      <div className="smartlink-clean">
        {/* 🎨 Background artwork */}
        <div 
          className={`background-artwork ${backgroundLoaded ? 'loaded' : ''}`}
          style={{
            backgroundImage: backgroundImage ? `url("${backgroundImage}")` : 'none'
          }}
        ></div>
        
        {/* 🎨 Carte centrale */}
        <div className="main-card">
          {/* Pochette de l'album avec bouton play intégré */}
          <div 
            className={`album-cover-container ${!smartLink.previewAudioUrl ? 'disabled' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              if (smartLink.previewAudioUrl) {
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
            {smartLink.previewAudioUrl && (
              <div 
                className="play-overlay-btn"
                onClick={(e) => {
                  e.stopPropagation();
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
            {platformLinks.filter(link => link.url && link.platform).map((platform, index) => {
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
        
        {/* 🎯 Indicateur de debug pour les analytics */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            background: '#000',
            color: '#fff',
            padding: '10px',
            fontSize: '12px',
            zIndex: 9999,
            maxWidth: '200px'
          }}>
            <div>🎯 Analytics Debug:</div>
            <div>GA4: {window.gtag ? '✅' : '❌'}</div>
            <div>GTM: {window.dataLayer ? '✅' : '❌'}</div>
            <div>Meta: {window.fbq ? '✅' : '❌'}</div>
            <div>TikTok: {window.ttq ? '✅' : '❌'}</div>
          </div>
        )}
      </div>
    </HelmetProvider>
  );
};

export default SmartLinkSSR;