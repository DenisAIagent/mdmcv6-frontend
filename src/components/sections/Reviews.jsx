import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  Rating,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Avatar,
  Grid,
  Fade,
  Chip
} from '@mui/material';
import { Close, Star, FormatQuote, Business, Email, Language, ArrowBack, ArrowForward } from '@mui/icons-material';

// Import du service API (fallback automatique)
// import airtableReviewsService from '../../services/airtableReviews.service.js';

const Reviews = () => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    website: '',
    rating: 5,
    message: ''
  });

  // Chargement des avis via Airtable
  useEffect(() => {
    loadReviews();
  }, []);

  // Auto-rotation du carousel
  useEffect(() => {
    if (reviews.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % reviews.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [reviews.length]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      console.log('🔍 Reviews: Chargement des données de démonstration...');
      
      // Simulation d'un délai API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const data = getFallbackReviews();
      setReviews(data);
      setError(null);
      
      console.log('✅ Reviews: Chargées avec succès', { count: data.length });
    } catch (err) {
      console.error('❌ Reviews: Erreur de chargement', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFallbackReviews = () => {
    console.log('🔄 Reviews: Utilisation des données de démonstration');
    return [
      {
        id: 1,
        name: "Sarah L.",
        company: "TechStart SAS",
        rating: 5,
        comment: "Service exceptionnel ! L'équipe MDMC a transformé notre présence digitale. ROI impressionnant dès le premier mois.",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b641?w=64&h=64&fit=crop&crop=face"
      },
      {
        id: 2,
        name: "Marc D.",
        company: "Innovate Corp",
        rating: 5,
        comment: "Professionnalisme et créativité au rendez-vous. Nos campagnes n'ont jamais été aussi performantes !",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face"
      },
      {
        id: 3,
        name: "Emma R.",
        company: "Digital Solutions",
        rating: 5,
        comment: "Équipe réactive et résultats concrets. Je recommande vivement pour tout projet digital ambitieux.",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face"
      }
    ];
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.message) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setSubmitting(true);
      console.log('📝 Reviews: Soumission simulée...', { name: formData.name });
      
      // Simulation d'un délai API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = {
        success: true,
        message: 'Merci pour votre avis ! Il sera publié après modération.',
        id: `demo_${Date.now()}`
      };
      
      if (result.success) {
        setSubmitSuccess(true);
        setFormData({
          name: '',
          email: '',
          company: '',
          website: '',
          rating: 5,
          message: ''
        });
        
        setTimeout(() => {
          setOpenDialog(false);
          setSubmitSuccess(false);
        }, 2000);
      }
    } catch (err) {
      console.error('❌ Reviews: Erreur de soumission', err);
      alert('Erreur lors de la soumission. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % reviews.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + reviews.length) % reviews.length);
  };

  const renderReviewCard = (review, index) => (
    <Card 
      key={review.id}
      sx={{ 
        height: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        transform: `translateX(${(index - currentSlide) * 100}%)`,
        transition: 'transform 0.5s ease-in-out',
        minHeight: '300px',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          zIndex: 1
        }
      }}
    >
      <CardContent sx={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Avatar 
            src={review.avatar} 
            sx={{ width: 60, height: 60, border: '3px solid rgba(255,255,255,0.3)' }}
          />
          <Box flex={1}>
            <Typography variant="h6" fontWeight="bold">
              {review.name}
            </Typography>
            {review.company && (
              <Typography variant="body2" sx={{ opacity: 0.9, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Business sx={{ fontSize: 16 }} />
                {review.company}
              </Typography>
            )}
          </Box>
          <Box textAlign="center">
            <Rating 
              value={review.rating} 
              readOnly 
              size="small"
              sx={{ 
                '& .MuiRating-iconFilled': { color: '#ffd700' },
                '& .MuiRating-iconEmpty': { color: 'rgba(255,255,255,0.3)' }
              }}
            />
            <Typography variant="caption" display="block">
              {review.rating}/5
            </Typography>
          </Box>
        </Box>
        
        <Box position="relative" flex={1}>
          <FormatQuote sx={{ 
            position: 'absolute', 
            top: -8, 
            left: -8, 
            fontSize: 40, 
            opacity: 0.3 
          }} />
          <Typography 
            variant="body1" 
            sx={{ 
              fontStyle: 'italic',
              lineHeight: 1.6,
              pl: 2
            }}
          >
            {review.comment}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ py: 8, px: 2 }}>
      <Box maxWidth="1200px" mx="auto">
        {/* Header */}
        <Box textAlign="center" mb={6}>
          <Typography 
            variant="h3" 
            component="h2" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {t('reviews.title', 'Témoignages Clients')}
          </Typography>
          <Typography variant="h6" color="text.secondary" mb={4}>
            {t('reviews.subtitle', 'Découvrez ce que nos clients disent de notre travail')}
          </Typography>
          
          <Button
            variant="contained"
            onClick={() => setOpenDialog(true)}
            sx={{
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              borderRadius: '25px',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              textTransform: 'none',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a6fd8, #6a42a0)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 25px rgba(102, 126, 234, 0.6)'
              }
            }}
          >
            ⭐ Laisser un avis
          </Button>
        </Box>

        {/* Reviews Carousel */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="warning" sx={{ mb: 4 }}>
            Impossible de charger les avis. Les données de démonstration sont affichées.
          </Alert>
        ) : null}

        {reviews.length > 0 && (
          <Box sx={{ position: 'relative', maxWidth: '800px', mx: 'auto' }}>
            {/* Carousel Container */}
            <Box 
              sx={{ 
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 3,
                height: '350px'
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex',
                  height: '100%',
                  position: 'relative'
                }}
              >
                {reviews.map((review, index) => (
                  <Box
                    key={review.id}
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      transform: `translateX(${(index - currentSlide) * 100}%)`,
                      transition: 'transform 0.5s ease-in-out'
                    }}
                  >
                    {renderReviewCard(review, 0)}
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Navigation */}
            {reviews.length > 1 && (
              <>
                <IconButton
                  onClick={prevSlide}
                  sx={{
                    position: 'absolute',
                    left: -20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'white',
                    boxShadow: 2,
                    '&:hover': { bgcolor: 'grey.100' }
                  }}
                >
                  <ArrowBack />
                </IconButton>
                
                <IconButton
                  onClick={nextSlide}
                  sx={{
                    position: 'absolute',
                    right: -20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'white',
                    boxShadow: 2,
                    '&:hover': { bgcolor: 'grey.100' }
                  }}
                >
                  <ArrowForward />
                </IconButton>

                {/* Indicators */}
                <Box 
                  display="flex" 
                  justifyContent="center" 
                  gap={1} 
                  mt={3}
                >
                  {reviews.map((_, index) => (
                    <Box
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: index === currentSlide ? '#667eea' : 'grey.300',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: index === currentSlide ? '#667eea' : 'grey.400'
                        }
                      }}
                    />
                  ))}
                </Box>
              </>
            )}
          </Box>
        )}

        {/* Review Form Dialog - Identique à la version précédente */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            color: 'white',
            m: 0
          }}>
            <Typography variant="h5" component="div">
              ⭐ Partager votre expérience
            </Typography>
            <IconButton 
              onClick={() => setOpenDialog(false)}
              sx={{ color: 'white' }}
            >
              <Close />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 4 }}>
            {submitSuccess ? (
              <Alert severity="success" sx={{ mb: 3 }}>
                Merci pour votre avis ! Il sera publié après modération.
              </Alert>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nom complet *"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email *"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    variant="outlined"
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Entreprise"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    variant="outlined"
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: <Business sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Site web"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    variant="outlined"
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: <Language sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Typography variant="body1">Note :</Typography>
                    <Rating
                      value={formData.rating}
                      onChange={(e, newValue) => handleInputChange('rating', newValue)}
                      size="large"
                      sx={{ 
                        '& .MuiRating-iconFilled': { color: '#ffd700' }
                      }}
                    />
                    <Chip 
                      label={`${formData.rating}/5`} 
                      color="primary" 
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Votre témoignage *"
                    multiline
                    rows={4}
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    variant="outlined"
                    placeholder="Décrivez votre expérience avec MDMC..."
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>

          {!submitSuccess && (
            <DialogActions sx={{ p: 3, gap: 2 }}>
              <Button 
                onClick={() => setOpenDialog(false)}
                variant="outlined"
                disabled={submitting}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleSubmit}
                variant="contained"
                disabled={submitting || !formData.name || !formData.email || !formData.message}
                sx={{
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  px: 4,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a6fd8, #6a42a0)',
                  }
                }}
              >
                {submitting ? <CircularProgress size={24} color="inherit" /> : 'Publier l\'avis'}
              </Button>
            </DialogActions>
          )}
        </Dialog>
      </Box>
    </Box>
  );
};

export default Reviews;