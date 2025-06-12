import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, TextField, Card, CardMedia, Autocomplete, CircularProgress } from '@mui/material';
import { Controller } from 'react-hook-form';
import apiService from '../../../../../services/api.service';

const MetadataSection = ({ metadata, control, setValue }) => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);

  // Charger la liste des artistes au montage du composant
  useEffect(() => {
    const fetchArtists = async () => {
      setLoading(true);
      try {
        const response = await apiService.artists.getAllArtists();
        if (response && response.success && response.data) {
          setArtists(response.data);
          console.log("Liste des artistes chargée:", response.data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des artistes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  // Mettre à jour l'artistId lorsqu'un artiste est sélectionné
  useEffect(() => {
    if (selectedArtist) {
      setValue('artistId', selectedArtist._id);
      console.log("ArtistId mis à jour:", selectedArtist._id);
    }
  }, [selectedArtist, setValue]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Métadonnées du morceau
      </Typography>
      
      <Grid container spacing={3}>
        {/* Pochette de l'album */}
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardMedia
              component="img"
              image={metadata.artwork || 'https://via.placeholder.com/300x300?text=Pochette+non+disponible'}
              alt={metadata.title}
              sx={{ height: 300, objectFit: 'cover' }}
            />
          </Card>
        </Grid>
        
        {/* Informations du morceau */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="trackTitle"
                control={control}
                rules={{ required: "Le titre est requis" }}
                defaultValue={metadata.title || ""}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Titre du morceau"
                    variant="outlined"
                    fullWidth
                    required
                    error={!!error}
                    helperText={error ? error.message : ""}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="artistId"
                control={control}
                rules={{ required: "La sélection d'un artiste est requise" }}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    options={artists}
                    loading={loading}
                    getOptionLabel={(option) => option.name || ""}
                    isOptionEqualToValue={(option, value) => option._id === value._id}
                    onChange={(_, newValue) => {
                      setSelectedArtist(newValue);
                      field.onChange(newValue ? newValue._id : null);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Sélectionner un artiste"
                        variant="outlined"
                        required
                        error={!!error}
                        helperText={error ? error.message : "Sélectionnez un artiste existant"}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loading ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="isrc"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="ISRC"
                    variant="outlined"
                    fullWidth
                    error={!!error}
                    helperText={error ? error.message : ""}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="label"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Label"
                    variant="outlined"
                    fullWidth
                    error={!!error}
                    helperText={error ? error.message : ""}
                    value={field.value || metadata.label || ""}
                    onChange={(e) => {
                      field.onChange(e);
                      setValue('label', e.target.value);
                    }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="distributor"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Distributeur"
                    variant="outlined"
                    fullWidth
                    error={!!error}
                    helperText={error ? error.message : ""}
                    value={field.value || metadata.distributor || ""}
                    onChange={(e) => {
                      field.onChange(e);
                      setValue('distributor', e.target.value);
                    }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="releaseDate"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Date de sortie"
                    variant="outlined"
                    fullWidth
                    error={!!error}
                    helperText={error ? error.message : ""}
                    value={field.value || metadata.releaseDate || ""}
                    onChange={(e) => {
                      field.onChange(e);
                      setValue('releaseDate', e.target.value);
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MetadataSection;
