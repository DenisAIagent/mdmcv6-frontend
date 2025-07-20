// frontend/src/pages/admin/smartlinks/SmartLinkCreatePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Stack,
  Avatar,
  Tooltip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Preview as PreviewIcon,
  ColorLens as ColorIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  ExpandMore as ExpandMoreIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import apiService from '../../../services/api.service';

const SmartLinkCreatePage = () => {
  const navigate = useNavigate();
  
  // États du formulaire
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    // Métadonnées de base
    title: '',
    artist: '',
    subtitle: '',
    artwork: '',
    releaseDate: '',
    genre: '',
    isrc: '',
    upc: '',
    
    // Plateformes
    platforms: [],
    
    // Configuration analytics
    analytics: {
      ga4: { enabled: true, measurementId: '' },
      gtm: { enabled: true, containerId: '' },
      metaPixel: { enabled: true, pixelId: '' },
      tiktokPixel: { enabled: false, pixelId: '' },
      googleAds: { enabled: false, conversionId: '' }
    },
    
    // Configuration SEO
    seo: {
      title: '',
      description: '',
      keywords: [],
      ogImage: '',
      ogType: 'music.song'
    },
    
    // Configuration design
    design: {
      template: 'music',
      colorScheme: {
        primary: '#1DB954',
        secondary: '#191414',
        background: '#FFFFFF',
        text: '#000000'
      },
      backgroundImage: '',
      backgroundBlur: 10,
      darkMode: false
    },
    
    // Gestion
    status: 'draft',
    isPublic: true
  });

  // État pour la recherche automatique

  // État pour la prévisualisation
  const [previewOpen, setPreviewOpen] = useState(false);
  const [extractedColors, setExtractedColors] = useState(null);

  // Fonction pour obtenir les logos des plateformes
  const getPlatformLogo = (platform) => {
    const logos = {
      spotify: 'https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png',
      apple_music: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Apple_Music_icon.svg/64px-Apple_Music_icon.svg.png',
      youtube: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/64px-YouTube_full-color_icon_%282017%29.svg.png',
      youtube_music: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Youtube_Music_icon.svg/64px-Youtube_Music_icon.svg.png',
      deezer: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Deezer_logo.svg/64px-Deezer_logo.svg.png',
      tidal: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Tidal_icon.svg/64px-Tidal_icon.svg.png',
      soundcloud: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Antu_soundcloud.svg/64px-Antu_soundcloud.svg.png',
      bandcamp: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Bandcamp-button-circle-whiteblue-512.png/64px-Bandcamp-button-circle-whiteblue-512.png',
      amazon_music: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Amazon_Music_logo.svg/64px-Amazon_Music_logo.svg.png',
      audiomack: 'https://via.placeholder.com/32x32/FF6600/FFFFFF?text=AM'
    };
    return logos[platform] || 'https://via.placeholder.com/32x32';
  };

  // Étapes du formulaire
  const steps = [
    {
      label: 'Recherche et métadonnées',
      description: 'Trouvez votre morceau et complétez les informations'
    },
    {
      label: 'Plateformes',
      description: 'Ajoutez les liens vers les plateformes de streaming'
    },
    {
      label: 'Design et personnalisation',
      description: 'Personnalisez l\'apparence de votre SmartLink'
    },
    {
      label: 'Analytics et SEO',
      description: 'Configurez le tracking et l\'optimisation'
    },
    {
      label: 'Prévisualisation et publication',
      description: 'Vérifiez et publiez votre SmartLink'
    }
  ];

  // Plateformes supportées
  const supportedPlatforms = [
    { id: 'spotify', name: 'Spotify', color: '#1DB954' },
    { id: 'apple_music', name: 'Apple Music', color: '#FA243C' },
    { id: 'youtube_music', name: 'YouTube Music', color: '#FF0000' },
    { id: 'youtube', name: 'YouTube', color: '#FF0000' },
    { id: 'deezer', name: 'Deezer', color: '#FF6600' },
    { id: 'tidal', name: 'Tidal', color: '#000000' },
    { id: 'soundcloud', name: 'SoundCloud', color: '#FF3300' },
    { id: 'bandcamp', name: 'Bandcamp', color: '#408294' },
    { id: 'amazon_music', name: 'Amazon Music', color: '#FF9900' }
  ];

  // Composant pour les logos de plateformes
  const PlatformLogo = ({ platform, size = 24 }) => {
    const logoUrl = getPlatformLogo(platform);
    const [imageError, setImageError] = useState(false);
    
    if (imageError) {
      // Fallback avec emoji
      const fallbackIcons = {
        spotify: '🎵',
        apple_music: '🍎',
        youtube: '📺',
        youtube_music: '🎥',
        deezer: '🎧',
        tidal: '🌊',
        soundcloud: '☁️',
        bandcamp: '🎪',
        amazon_music: '📦',
        audiomack: '🎵'
      };
      
      return (
        <span style={{ fontSize: size * 0.8 }}>
          {fallbackIcons[platform] || '🎵'}
        </span>
      );
    }
    
    return (
      <img
        src={logoUrl}
        alt={platform}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          borderRadius: '4px'
        }}
        onError={() => setImageError(true)}
      />
    );
  };

  // Fonction de recherche automatique via API Odesli
  const searchTrack = async (query) => {
    if (!query || query.length < 3) return;
    
    try {
      setSearchLoading(true);
      console.log('🔍 Recherche:', query);
      
      // Appel à l'API Odesli via notre backend
      const response = await apiService.smartlinks.fetchPlatformLinks(query);
      
      if (response.success && response.data) {
        console.log('✅ Résultats API:', response.data);
        
        // Transformer les liens de plateformes en format attendu
        const platforms = [];
        if (response.data.links) {
          Object.entries(response.data.links).forEach(([platform, data]) => {
            platforms.push({
              platform: platform.toLowerCase(),
              url: data.url || data,
              isAvailable: true,
              priority: 0
            });
          });
        }
        
        // Convertir les résultats en format attendu par le frontend
        const result = {
          id: Date.now().toString(),
          title: response.data.title || '',
          artist: response.data.artistName || '',
          artwork: response.data.thumbnailUrl || '',
          releaseDate: response.data.releaseDate || null,
          genre: response.data.genre || '',
          isrc: response.data.isrc || '',
          platforms: platforms
        };
        
        console.log('📋 Résultat formaté:', result);
        setSearchResults([result]);
        
        // Si un seul résultat, le sélectionner automatiquement
        if (result.title && result.artist) {
          console.log('🎯 Sélection automatique du résultat unique');
          selectSearchResult(result);
        } else {
          console.log('🔍 Ouverture dialogue recherche');
          setSearchDialogOpen(true);
        }
      } else {
        console.warn('⚠️ Aucun résultat trouvé');
        setSearchResults([]);
        toast.error('Aucun résultat trouvé pour cette recherche');
      }
      
      setSearchLoading(false);
      
    } catch (error) {
      console.error('❌ Erreur recherche:', error);
      setSearchResults([]);
      setSearchLoading(false);
      toast.error('Erreur lors de la recherche : ' + error.message);
    }
  };

  // Sélectionner un résultat de recherche
  const selectSearchResult = (result) => {
    console.log('🎯 Sélection du résultat:', result);
    
    const newFormData = {
      ...formData,
      title: result.title,
      artist: result.artist,
      artwork: result.artwork,
      releaseDate: result.releaseDate,
      genre: result.genre,
      isrc: result.isrc,
      platforms: result.platforms,
      
      // Configuration SEO automatique
      seo: {
        ...formData.seo,
        title: `${result.title} - ${result.artist}`,
        description: `Écoutez "${result.title}" de ${result.artist} sur toutes les plateformes de streaming`,
        ogImage: result.artwork,
        keywords: [result.title, result.artist, 'streaming', 'music', 'musique'].filter(Boolean)
      },
      
      // Configuration analytics par défaut (IDs par défaut MDMC)
      analytics: {
        ga4: { 
          enabled: true, 
          measurementId: 'G-P11JTJ21NZ' // ID GA4 de MDMC
        },
        gtm: { 
          enabled: true, 
          containerId: 'GTM-MDMC001' // ID GTM par défaut
        },
        metaPixel: { 
          enabled: true, 
          pixelId: '1234567890' // ID Meta Pixel par défaut
        },
        tiktokPixel: { 
          enabled: true, 
          pixelId: 'TT001' // ID TikTok par défaut
        },
        googleAds: { 
          enabled: true, 
          conversionId: 'AW-123456789' // ID Google Ads par défaut
        }
      }
    };
    
    console.log('📝 Nouveau formData:', newFormData);
    setFormData(newFormData);
    
    // Extraire les couleurs de l'artwork
    if (result.artwork) {
      extractColorsFromArtwork(result.artwork);
    }
    
    // Fermer le dialogue de recherche
    setSearchDialogOpen(false);
    
    // Passer à l'étape suivante
    if (activeStep === 0) {
      setActiveStep(1);
    }
  };

  // Extraire les couleurs de l'artwork
  const extractColorsFromArtwork = async (imageUrl) => {
    try {
      console.log('🎨 Extraction couleurs:', imageUrl);
      const response = await apiService.smartlinks.extractColors(imageUrl);
      
      if (response.success && response.data) {
        console.log('✅ Couleurs extraites:', response.data);
        setExtractedColors(response.data);
        
        // Appliquer les couleurs au design
        setFormData(prev => ({
          ...prev,
          design: {
            ...prev.design,
            colorScheme: {
              primary: response.data.primary || '#1DB954',
              secondary: response.data.secondary || '#191414',
              background: response.data.background || '#FFFFFF',
              text: response.data.text || '#000000',
              accent: response.data.accent || '#FFA500'
            }
          }
        }));
      }
    } catch (error) {
      console.error('❌ Erreur extraction couleurs:', error);
    }
  };

  // Gérer les changements de champs du formulaire
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Gérer les changements de plateformes
  const handlePlatformChange = (index, field, value) => {
    const newPlatforms = [...formData.platforms];
    newPlatforms[index] = {
      ...newPlatforms[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      platforms: newPlatforms
    }));
  };

  // Ajouter une plateforme
  const addPlatform = () => {
    setFormData(prev => ({
      ...prev,
      platforms: [
        ...prev.platforms,
        {
          platform: 'spotify',
          url: '',
          isAvailable: true,
          priority: prev.platforms.length
        }
      ]
    }));
  };

  // Supprimer une plateforme
  const removePlatform = (index) => {
    const newPlatforms = formData.platforms.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      platforms: newPlatforms
    }));
  };

  // Créer le SmartLink
  const createSmartLink = async () => {
    try {
      setLoading(true);
      console.log('🔗 Création SmartLink:', formData);
      
      const response = await apiService.smartlinks.create(formData);
      
      if (response.success) {
        console.log('✅ SmartLink créé:', response.data);
        toast.success('SmartLink créé avec succès !');
        navigate('/admin/smartlinks');
      } else {
        console.error('❌ Erreur création:', response.error);
        toast.error('Erreur lors de la création : ' + response.error);
      }
    } catch (error) {
      console.error('❌ Erreur création:', error);
      toast.error('Erreur lors de la création : ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const errors = [];
    
    if (!formData.title) errors.push('Le titre est requis');
    if (!formData.artist) errors.push('L\'artiste est requis');
    if (!formData.artwork) errors.push('L\'artwork est requis');
    if (formData.platforms.length === 0) errors.push('Au moins une plateforme est requise');
    
    // Validation des URLs de plateformes
    formData.platforms.forEach((platform, index) => {
      if (!platform.url) {
        errors.push(`URL manquante pour ${platform.platform}`);
      } else if (!platform.url.startsWith('http')) {
        errors.push(`URL invalide pour ${platform.platform}`);
      }
    });
    
    // Validation des analytics
    if (formData.analytics.ga4?.enabled && !formData.analytics.ga4?.measurementId) {
      errors.push('ID GA4 requis');
    }
    if (formData.analytics.gtm?.enabled && !formData.analytics.gtm?.containerId) {
      errors.push('ID GTM requis');
    }
    if (formData.analytics.metaPixel?.enabled && !formData.analytics.metaPixel?.pixelId) {
      errors.push('ID Meta Pixel requis');
    }
    
    return errors;
  };

  // Gérer la soumission du formulaire
  const handleSubmit = () => {
    const errors = validateForm();
    if (errors.length > 0) {
      console.error('❌ Erreurs de validation:', errors);
      toast.error('Erreurs de validation : ' + errors.join(', '));
      return;
    }
    
    createSmartLink();
  };

  // Fonctions utilitaires pour l'interface
  const getStepIcon = (step) => {
    switch(step) {
      case 0: return <SearchIcon />;
      case 1: return <LinkIcon />;
      case 2: return <ColorIcon />;
      case 3: return <AnalyticsIcon />;
      case 4: return <PreviewIcon />;
      default: return <InfoIcon />;
    }
  };

  const getStepContent = (step) => {
    switch(step) {
      case 0: return renderSearchStep();
      case 1: return renderPlatformsStep();
      case 2: return renderDesignStep();
      case 3: return renderAnalyticsStep();
      case 4: return renderPreviewStep();
      default: return null;
    }
  };

  // Rendu des étapes
  const renderSearchStep = () => {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recherche et métadonnées
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Entrez l'URL d'une plateforme de streaming pour rechercher automatiquement votre morceau
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            label="URL de la chanson (Spotify, Apple Music, YouTube...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="https://open.spotify.com/track/..."
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
          <Button
            variant="contained"
            onClick={() => searchTrack(searchQuery)}
            disabled={searchLoading || !searchQuery}
            startIcon={searchLoading ? <CircularProgress size={20} /> : <SearchIcon />}
          >
            {searchLoading ? 'Recherche...' : 'Rechercher'}
          </Button>
        </Box>
        
        {/* Résultats de la recherche */}
        {searchResults.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Résultats de la recherche
            </Typography>
            {searchResults.map((result, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <CardMedia
                      component="img"
                      height="80"
                      image={result.artwork}
                      alt={result.title}
                      sx={{ width: 80, borderRadius: 1 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6">{result.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {result.artist}
                      </Typography>
                      <Typography variant="caption">
                        {result.platforms.length} plateformes • {result.isrc || 'ISRC non disponible'}
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      onClick={() => selectSearchResult(result)}
                      startIcon={<CheckIcon />}
                    >
                      Sélectionner
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
        
        {/* Formulaire manuel */}
        <Divider sx={{ my: 3 }} />
        <Typography variant="subtitle1" gutterBottom>
          Ou saisir manuellement
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Titre"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Artiste"
              value={formData.artist}
              onChange={(e) => handleInputChange('artist', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="URL de l'artwork"
              value={formData.artwork}
              onChange={(e) => handleInputChange('artwork', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="ISRC"
              value={formData.isrc}
              onChange={(e) => handleInputChange('isrc', e.target.value)}
            />
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderPlatformsStep = () => {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Plateformes de streaming
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Configurez les liens vers les différentes plateformes de streaming
        </Typography>
        
        {formData.platforms.map((platform, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Avatar
                  src={getPlatformLogo(platform.platform)}
                  alt={platform.platform}
                  sx={{ width: 40, height: 40 }}
                />
                <Box sx={{ flex: 1 }}>
                  <FormControl sx={{ mb: 1, minWidth: 120 }}>
                    <InputLabel>Plateforme</InputLabel>
                    <Select
                      value={platform.platform}
                      onChange={(e) => handlePlatformChange(index, 'platform', e.target.value)}
                    >
                      {supportedPlatforms.map(p => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label="URL"
                    value={platform.url}
                    onChange={(e) => handlePlatformChange(index, 'url', e.target.value)}
                    placeholder="https://..."
                  />
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={platform.isAvailable}
                      onChange={(e) => handlePlatformChange(index, 'isAvailable', e.target.checked)}
                    />
                  }
                  label="Actif"
                />
                <IconButton
                  onClick={() => removePlatform(index)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
        
        <Button
          variant="outlined"
          onClick={addPlatform}
          startIcon={<AddIcon />}
          sx={{ mt: 2 }}
        >
          Ajouter une plateforme
        </Button>
      </Box>
    );
  };

  const renderDesignStep = () => {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Design et personnalisation
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Personnalisez l'apparence de votre SmartLink
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Couleurs
            </Typography>
            
            {extractedColors && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Couleurs extraites automatiquement de l'artwork
              </Alert>
            )}
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="Couleur primaire"
                value={formData.design.colorScheme.primary}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  design: {
                    ...prev.design,
                    colorScheme: {
                      ...prev.design.colorScheme,
                      primary: e.target.value
                    }
                  }
                }))}
                InputProps={{
                  startAdornment: (
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: formData.design.colorScheme.primary,
                        borderRadius: '50%',
                        mr: 1
                      }}
                    />
                  )
                }}
              />
              <TextField
                label="Couleur secondaire"
                value={formData.design.colorScheme.secondary}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  design: {
                    ...prev.design,
                    colorScheme: {
                      ...prev.design.colorScheme,
                      secondary: e.target.value
                    }
                  }
                }))}
                InputProps={{
                  startAdornment: (
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: formData.design.colorScheme.secondary,
                        borderRadius: '50%',
                        mr: 1
                      }}
                    />
                  )
                }}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Aperçu
            </Typography>
            <Paper sx={{ p: 2, backgroundColor: formData.design.colorScheme.background }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  src={formData.artwork}
                  alt={formData.title}
                  sx={{ width: 60, height: 60, mr: 2 }}
                />
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ color: formData.design.colorScheme.text }}
                  >
                    {formData.title || 'Titre'}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: formData.design.colorScheme.text }}
                  >
                    {formData.artist || 'Artiste'}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {formData.platforms.slice(0, 3).map((platform, index) => (
                  <Chip
                    key={index}
                    label={platform.platform}
                    sx={{
                      backgroundColor: formData.design.colorScheme.primary,
                      color: '#fff'
                    }}
                  />
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderAnalyticsStep = () => {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Analytics et tracking
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Configurez les tags de tracking pour analyser les performances
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">
                  Google Analytics 4
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.analytics.ga4?.enabled}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        analytics: {
                          ...prev.analytics,
                          ga4: {
                            ...prev.analytics.ga4,
                            enabled: e.target.checked
                          }
                        }
                      }))}
                    />
                  }
                  label=""
                  sx={{ ml: 'auto' }}
                />
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  fullWidth
                  label="Measurement ID"
                  value={formData.analytics.ga4?.measurementId || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    analytics: {
                      ...prev.analytics,
                      ga4: {
                        ...prev.analytics.ga4,
                        measurementId: e.target.value
                      }
                    }
                  }))}
                  placeholder="G-XXXXXXXXXX"
                  disabled={!formData.analytics.ga4?.enabled}
                />
              </AccordionDetails>
            </Accordion>
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">
                  Google Tag Manager
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.analytics.gtm?.enabled}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        analytics: {
                          ...prev.analytics,
                          gtm: {
                            ...prev.analytics.gtm,
                            enabled: e.target.checked
                          }
                        }
                      }))}
                    />
                  }
                  label=""
                  sx={{ ml: 'auto' }}
                />
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  fullWidth
                  label="Container ID"
                  value={formData.analytics.gtm?.containerId || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    analytics: {
                      ...prev.analytics,
                      gtm: {
                        ...prev.analytics.gtm,
                        containerId: e.target.value
                      }
                    }
                  }))}
                  placeholder="GTM-XXXXXXX"
                  disabled={!formData.analytics.gtm?.enabled}
                />
              </AccordionDetails>
            </Accordion>
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">
                  Meta Pixel (Facebook)
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.analytics.metaPixel?.enabled}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        analytics: {
                          ...prev.analytics,
                          metaPixel: {
                            ...prev.analytics.metaPixel,
                            enabled: e.target.checked
                          }
                        }
                      }))}
                    />
                  }
                  label=""
                  sx={{ ml: 'auto' }}
                />
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  fullWidth
                  label="Pixel ID"
                  value={formData.analytics.metaPixel?.pixelId || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    analytics: {
                      ...prev.analytics,
                      metaPixel: {
                        ...prev.analytics.metaPixel,
                        pixelId: e.target.value
                      }
                    }
                  }))}
                  placeholder="1234567890"
                  disabled={!formData.analytics.metaPixel?.enabled}
                />
              </AccordionDetails>
            </Accordion>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">
                  TikTok Pixel
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.analytics.tiktokPixel?.enabled}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        analytics: {
                          ...prev.analytics,
                          tiktokPixel: {
                            ...prev.analytics.tiktokPixel,
                            enabled: e.target.checked
                          }
                        }
                      }))}
                    />
                  }
                  label=""
                  sx={{ ml: 'auto' }}
                />
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  fullWidth
                  label="Pixel ID"
                  value={formData.analytics.tiktokPixel?.pixelId || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    analytics: {
                      ...prev.analytics,
                      tiktokPixel: {
                        ...prev.analytics.tiktokPixel,
                        pixelId: e.target.value
                      }
                    }
                  }))}
                  placeholder="TT001"
                  disabled={!formData.analytics.tiktokPixel?.enabled}
                />
              </AccordionDetails>
            </Accordion>
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">
                  Google Ads
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.analytics.googleAds?.enabled}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        analytics: {
                          ...prev.analytics,
                          googleAds: {
                            ...prev.analytics.googleAds,
                            enabled: e.target.checked
                          }
                        }
                      }))}
                    />
                  }
                  label=""
                  sx={{ ml: 'auto' }}
                />
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  fullWidth
                  label="Conversion ID"
                  value={formData.analytics.googleAds?.conversionId || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    analytics: {
                      ...prev.analytics,
                      googleAds: {
                        ...prev.analytics.googleAds,
                        conversionId: e.target.value
                      }
                    }
                  }))}
                  placeholder="AW-123456789"
                  disabled={!formData.analytics.googleAds?.enabled}
                />
              </AccordionDetails>
            </Accordion>
            
            <Paper sx={{ p: 2, mt: 2, backgroundColor: '#f5f5f5' }}>
              <Typography variant="subtitle2" gutterBottom>
                <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Informations
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Les tags de tracking sont automatiquement intégrés dans votre SmartLink. 
                Vous pouvez les modifier à tout moment après la création.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderPreviewStep = () => {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Prévisualisation et publication
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Vérifiez les informations avant de créer votre SmartLink
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Informations du morceau
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Avatar
                    src={formData.artwork}
                    alt={formData.title}
                    sx={{ width: 80, height: 80 }}
                  />
                  <Box>
                    <Typography variant="h6">{formData.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formData.artist}
                    </Typography>
                    <Typography variant="caption">
                      ISRC: {formData.isrc || 'Non disponible'}
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom>
                  Plateformes ({formData.platforms.length})
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {formData.platforms.map((platform, index) => (
                    <Chip
                      key={index}
                      avatar={<Avatar src={getPlatformLogo(platform.platform)} />}
                      label={platform.platform}
                      color={platform.isAvailable ? 'primary' : 'default'}
                      size="small"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Configuration Analytics
                </Typography>
                
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckIcon color={formData.analytics.ga4?.enabled ? 'success' : 'disabled'} />
                    <Typography variant="body2">
                      Google Analytics 4: {formData.analytics.ga4?.measurementId || 'Non configuré'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckIcon color={formData.analytics.gtm?.enabled ? 'success' : 'disabled'} />
                    <Typography variant="body2">
                      Google Tag Manager: {formData.analytics.gtm?.containerId || 'Non configuré'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckIcon color={formData.analytics.metaPixel?.enabled ? 'success' : 'disabled'} />
                    <Typography variant="body2">
                      Meta Pixel: {formData.analytics.metaPixel?.pixelId || 'Non configuré'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckIcon color={formData.analytics.tiktokPixel?.enabled ? 'success' : 'disabled'} />
                    <Typography variant="body2">
                      TikTok Pixel: {formData.analytics.tiktokPixel?.pixelId || 'Non configuré'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckIcon color={formData.analytics.googleAds?.enabled ? 'success' : 'disabled'} />
                    <Typography variant="body2">
                      Google Ads: {formData.analytics.googleAds?.conversionId || 'Non configuré'}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
            
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  SEO et métadonnées
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Titre:</strong> {formData.seo.title}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Description:</strong> {formData.seo.description}
                </Typography>
                <Typography variant="body2">
                  <strong>Mots-clés:</strong> {formData.seo.keywords?.join(', ')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => setPreviewOpen(true)}
            startIcon={<PreviewIcon />}
          >
            Prévisualiser
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
          >
            {loading ? 'Création...' : 'Créer le SmartLink'}
          </Button>
        </Box>
      </Box>
    );
  };

  // Début du rendu principal
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/admin/smartlinks')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Créer un SmartLink
          </Typography>
        </Box>
      </Paper>

      <Paper>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={index}>
              <StepLabel
                StepIconComponent={() => (
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: index <= activeStep ? 'primary.main' : 'grey.300',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}
                  >
                    {getStepIcon(index)}
                  </Box>
                )}
              >
                <Typography variant="h6">{step.label}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </StepLabel>
              <StepContent>
                {getStepContent(index)}
                
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button
                    disabled={activeStep === 0}
                    onClick={() => setActiveStep(activeStep - 1)}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => setActiveStep(activeStep + 1)}
                    disabled={activeStep === steps.length - 1}
                  >
                    Suivant
                  </Button>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Dialogue de recherche */}
      <Dialog
        open={searchDialogOpen}
        onClose={() => setSearchDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Résultats de la recherche
        </DialogTitle>
        <DialogContent>
          {searchResults.map((result, index) => (
            <Card key={index} sx={{ mb: 2, cursor: 'pointer' }} onClick={() => selectSearchResult(result)}>
              <CardContent>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <CardMedia
                    component="img"
                    height="60"
                    image={result.artwork}
                    alt={result.title}
                    sx={{ width: 60, borderRadius: 1 }}
                  />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {result.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {result.artist}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {result.platforms.length} plateformes
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSearchDialogOpen(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de prévisualisation */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Prévisualisation du SmartLink
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">
              Cette fonctionnalité sera disponible après la création
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SmartLinkCreatePage;
