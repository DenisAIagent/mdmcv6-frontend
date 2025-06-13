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
import { Close, Star, Quote, Business, Email, Language } from '@mui/icons-material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

// Import du service Airtable
import airtableReviewsService from '../../services/airtableReviews.service.js';

const Reviews = () => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
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

  const loadReviews = async () => {
    try {
      setLoading(true);
      console.log('🔍 Reviews: Chargement via Airtable...');
      
      const data = await airtableReviewsService.getApprovedReviews();
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
      console.log('📝 Reviews: Soumission via Airtable...', { name: formData.name });
      
      const result = await airtableReviewsService.submitReview(formData);
      
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

  const renderReviewCard = (review) => (
    <Card 
      sx={{ 
        height: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
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
      <CardContent sx={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
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
          <Quote sx={{ 
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
          <Swiper
            modules={[Pagination, Autoplay, EffectFade]}
            spaceBetween={30}
            slidesPerView={1}
            pagination={{ 
              clickable: true,
              bulletClass: 'swiper-pagination-bullet custom-bullet',
              bulletActiveClass: 'swiper-pagination-bullet-active custom-bullet-active'
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              768: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            className="reviews-swiper"
          >
            {reviews.map((review) => (
              <SwiperSlide key={review.id}>
                <Fade in timeout={600}>
                  <Box>
                    {renderReviewCard(review)}
                  </Box>
                </Fade>
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {/* Review Form Dialog */}
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

      {/* Styles pour Swiper */}
      <style jsx global>{`
        .reviews-swiper .custom-bullet {
          background: rgba(102, 126, 234, 0.3) !important;
          opacity: 1 !important;
        }
        .reviews-swiper .custom-bullet-active {
          background: #667eea !important;
        }
      `}</style>
    </Box>
  );
};

export default Reviews;