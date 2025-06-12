import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  FormControlLabel,
  Switch,
  CircularProgress,
  IconButton,
  FormLabel,
  Tooltip,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { smartLinkSchema } from '@/features/admin/smartlinks/schemas/smartLinkSchema.js';
import ImageUpload from '@/features/admin/components/ImageUpload.jsx';
import apiService from '@/services/api.service';

const SmartLinkForm = ({ smartLinkData = null, onFormSubmitSuccess }) => {
  const isEditMode = !!smartLinkData;
  const [artists, setArtists] = useState([]);
  const [loadingArtists, setLoadingArtists] = useState(true);
  const [formError, setFormError] = useState(null);
  const navigate = useNavigate();
  const [trackUrl, setTrackUrl] = useState('');
  const [fetchingPlatforms, setFetchingPlatforms] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(smartLinkSchema),
    defaultValues: {
      trackTitle: smartLinkData?.trackTitle || '',
      artistId: smartLinkData?.artistId?._id || smartLinkData?.artistId || '',
      coverImageUrl: smartLinkData?.coverImageUrl || '',
      releaseDate: smartLinkData?.releaseDate
        ? new Date(`${smartLinkData.releaseDate}T00:00:00`)
        : null,
      description: smartLinkData?.description || '',
      platformLinks: smartLinkData?.platformLinks?.length
        ? smartLinkData.platformLinks
        : [{ platform: '', url: '' }],
      trackingIds: {
        ga4Id: smartLinkData?.trackingIds?.ga4Id || '',
        gtmId: smartLinkData?.trackingIds?.gtmId || '',
        metaPixelId: smartLinkData?.trackingIds?.metaPixelId || '',
        tiktokPixelId: smartLinkData?.trackingIds?.tiktokPixelId || '',
      },
      isPublished: smartLinkData?.isPublished || false,
      slug: smartLinkData?.slug || '',
    },
  });

  const { fields: platformLinkFields, append: appendPlatformLink, remove: removePlatformLink } = useFieldArray({
    control,
    name: "platformLinks"
  });

  useEffect(() => {
    const fetchArtists = async () => {
      setLoadingArtists(true);
      setFormError(null);
      try {
        const response = await apiService.artists.getAllArtists();
        setArtists(response.data || response || []);
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Erreur chargement artistes';
        toast.error(errorMessage);
        setFormError(errorMessage);
        setArtists([]);
      } finally {
        setLoadingArtists(false);
      }
    };
    fetchArtists();
  }, []);

  const handleImageUploadSuccess = (imageUrl) => {
    setValue('coverImageUrl', imageUrl, { shouldValidate: true, shouldDirty: true });
    toast.info("Image de couverture mise à jour.");
  };

  const handleFetchPlatformLinks = async () => {
    if (!trackUrl) {
      toast.error('Merci de renseigner une URL ou un ISRC.');
      return;
    }
    setFetchingPlatforms(true);
    try {
      const response = await apiService.smartlinks.fetchPlatformLinks(trackUrl);
      if (response.platformLinks?.length) {
        setValue('platformLinks', response.platformLinks, { shouldValidate: true, shouldDirty: true });
        toast.success('Liens préremplis !');
      } else {
        toast.warn('Aucun lien trouvé pour cette URL/ISRC.');
      }
    } catch (error) {
      toast.error(error.message || 'Erreur récupération liens.');
    } finally {
      setFetchingPlatforms(false);
    }
  };

  const onSubmit = async (data) => {
    setFormError(null);
    const submissionData = {
      ...data,
      releaseDate: data.releaseDate ? new Date(data.releaseDate).toISOString().split('T')[0] : null,
      trackingIds: Object.fromEntries(
        Object.entries(data.trackingIds).filter(([_, value]) => value && value.trim() !== '')
      ),
      platformLinks: data.platformLinks.filter(link => link.platform && link.url),
    };

    try {
      let responseData;
      if (isEditMode) {
        responseData = await apiService.smartlinks.update(smartLinkData._id, submissionData);
        toast.success('SmartLink mis à jour avec succès !');
      } else {
        responseData = await apiService.smartlinks.create(submissionData);
        toast.success('SmartLink créé avec succès !');
      }

      onFormSubmitSuccess?.(responseData.data || responseData);
      reset(isEditMode ? submissionData : {
        ...submissionData,
        trackTitle: '',
        coverImageUrl: '',
        releaseDate: null,
        description: '',
        platformLinks: [{ platform: '', url: '' }],
        trackingIds: { ga4Id: '', gtmId: '', metaPixelId: '', tiktokPixelId: '' },
        isPublished: false,
        slug: '',
      });
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Erreur de soumission';
      toast.error(msg);
      setFormError(msg);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>
        {isEditMode ? 'Modifier le SmartLink' : 'Créer un nouveau SmartLink'}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
        <TextField
          label="Track URL ou ISRC"
          value={trackUrl}
          onChange={e => setTrackUrl(e.target.value)}
          fullWidth
        />
        <Button onClick={handleFetchPlatformLinks} disabled={fetchingPlatforms || !trackUrl}>
          {fetchingPlatforms ? <CircularProgress size={22} /> : 'Auto-remplir'}
        </Button>
      </Box>

      {formError && <Typography color="error">{formError}</Typography>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              {...register('trackTitle')}
              label="Titre de la musique"
              fullWidth
              error={!!errors.trackTitle}
              helperText={errors.trackTitle?.message}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              {...register('slug')}
              label="Slug (URL personnalisée)"
              fullWidth
              error={!!errors.slug}
              helperText={errors.slug?.message || 'Ex: mon-nouveau-single'}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              {...register('utmContent')}
              label="utm_content"
              fullWidth
              error={!!errors.utmContent}
              helperText={errors.utmContent?.message || "Différencier des variantes d'une même campagne (optionnel)"}
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : isEditMode ? 'Mettre à jour' : 'Créer'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default SmartLinkForm;
