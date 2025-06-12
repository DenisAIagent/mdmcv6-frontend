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
  Paper,
  Grid,
  Container,
  useTheme,
  useMediaQuery
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import apiService from '../../services/api.service';

const Reviews = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [approvedReviews, setApprovedReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 0,
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.reviews.getReviews({ status: 'approved' });
        if (response.success && response.data) {
          setApprovedReviews(response.data);
        } else {
          // Fallback reviews si l'API n'est pas disponible
          setApprovedReviews([
            {
              _id: 'sidilarsen1',
              name: 'David',
              title: 'Chanteur de Sidilarsen',
              rating: 5,
              message: "Avant MDMC, notre chaîne YouTube stagnait. Depuis, on a franchi un vrai cap : millions de vues, abonnés x4, impact direct sur notre carrière. Collaboration ultra efficace.",
              createdAt: new Date().toISOString(),
              avatar: null
            },
            {
              _id: 'mox1',
              name: 'Isabelle Fontan',
              title: 'MOX Musique',
              rating: 5,
              message: "Denis est un professionnel fiable, sérieux, réactif et surtout efficace. Il m'a conseillé au mieux sur de nombreuses campagnes, avec des résultats très satisfaisants. L'expert Google Ads qu'il vous faut !",
              createdAt: '2023-02-03T00:00:00.000Z',
              avatar: null
            },
            {
              _id: 'trydye1',
              name: 'Fred Tavernier',
              title: 'Try & Dye Records',
              rating: 5,
              message: "Cela fait plusieurs années que nous collaborons avec Denis sur les campagnes clips de nos artistes (dont OUTED). Communication fluide, résultats au rendez-vous, Denis s'adapte à nos besoins et nos budgets avec réactivité.",
              createdAt: '2023-02-03T00:00:00.000Z',
              avatar: null
            },
            {
              _id: 'mlh1',
              name: "Manon L'Huillier",
              title: 'MLH Promotion',
              rating: 5,
              message: "Un travail efficace à chaque collaboration. Denis a su être à l'écoute de nos attentes et proposer des stratégies adaptées aux deadlines et aux budgets imposés.",
              createdAt: '2019-07-09T00:00:00.000Z',
              avatar: null
            }
          ]);
        }
      } catch (err) {
        setError(t('reviews.error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [t]);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % approvedReviews.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + approvedReviews.length) % approvedReviews.length);
  };

  const handleOpenModal = () => {
    setModalOpen(true);
    setFormError(null);
    setFormSuccess(false);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setFormData({ name: '', email: '', rating: 0, message: '' });
    setFormError(null);
    setFormSuccess(false);
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleRatingChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      rating: newValue
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setFormError(t('reviews.form.name_required'));
      return false;
    }
    if (!formData.email.trim()) {
      setFormError(t('reviews.form.email_required'));
      return false;
    }
    if (!formData.rating) {
      setFormError(t('reviews.form.rating_required'));
      return false;
    }
    if (!formData.message.trim()) {
      setFormError(t('reviews.form.message_required'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      const response = await apiService.reviews.createReview(formData);
      if (response.success) {
        setFormSuccess(true);
        setFormData({ name: '', email: '', rating: 0, message: '' });
      } else {
        setFormError(response.message || t('reviews.form.error'));
      }
    } catch (err) {
      setFormError(t('reviews.form.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        py: 8,
        backgroundColor: 'background.paper',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          component="h2"
          align="center"
          gutterBottom
          sx={{
            fontSize: { xs: '2rem', md: '3rem' },
            fontWeight: 700,
            mb: 2,
            color: 'text.primary'
          }}
        >
          {t('reviews.title')}
        </Typography>
        <Typography
          variant="h5"
          align="center"
          color="text.secondary"
          sx={{ mb: 6, maxWidth: '800px', mx: 'auto' }}
        >
          {t('reviews.subtitle')}
        </Typography>

        <Box sx={{ position: 'relative', maxWidth: '1000px', mx: 'auto' }}>
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, md: 6 },
              borderRadius: 2,
              backgroundColor: 'background.paper',
              position: 'relative',
              minHeight: '300px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            {approvedReviews.length > 0 && (
              <Box sx={{ textAlign: 'center' }}>
                <Rating
                  value={approvedReviews[activeIndex].rating}
                  readOnly
                  size="large"
                  sx={{ mb: 2 }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontSize: { xs: '1.1rem', md: '1.3rem' },
                    fontWeight: 500,
                    color: 'text.primary'
                  }}
                >
                  "{approvedReviews[activeIndex].message}"
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: 'primary.main',
                    mb: 0.5
                  }}
                >
                  {approvedReviews[activeIndex].name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  {approvedReviews[activeIndex].title}
                </Typography>
              </Box>
            )}

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 2,
                mt: 4
              }}
            >
              <IconButton
                onClick={handlePrev}
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark'
                  }
                }}
              >
                <ArrowBackIosNewIcon />
              </IconButton>
              <IconButton
                onClick={handleNext}
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark'
                  }
                }}
              >
                <ArrowForwardIosIcon />
              </IconButton>
            </Box>
          </Paper>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleOpenModal}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem'
              }}
            >
              {t('reviews.leave_review')}
            </Button>
          </Box>
        </Box>
      </Container>

      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 2
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{t('reviews.leave_review')}</Typography>
            <IconButton onClick={handleCloseModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3} sx={{ mt: 0 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('reviews.form.name')}
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('reviews.form.email')}
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Typography component="legend" gutterBottom>
                  {t('reviews.form.rating')}
                </Typography>
                <Rating
                  value={formData.rating}
                  onChange={handleRatingChange}
                  size="large"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('reviews.form.message')}
                  multiline
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange('message')}
                  required
                />
              </Grid>
            </Grid>
            {formError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {formError}
              </Alert>
            )}
            {formSuccess && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {t('reviews.form.success')}
              </Alert>
            )}
            <DialogActions sx={{ mt: 2, px: 0 }}>
              <Button
                onClick={handleCloseModal}
                sx={{ mr: 1 }}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                sx={{
                  px: 4,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none'
                }}
              >
                {isSubmitting ? t('common.submitting') : t('common.submit')}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Reviews;
