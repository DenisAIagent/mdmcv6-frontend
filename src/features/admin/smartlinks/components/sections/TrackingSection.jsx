import React, { useState } from 'react';
import { Box, Typography, TextField, Grid, Accordion, AccordionSummary, AccordionDetails, FormControlLabel, Switch } from '@mui/material';
import { Controller } from 'react-hook-form';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import Tooltip from '@mui/material/Tooltip';

const TrackingSection = ({ control }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Outils de tracking
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="gaId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Google Analytics 4"
                variant="outlined"
                fullWidth
                placeholder="G-XXXXXXXXXX"
                helperText="ID de mesure GA4"
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Entrez votre ID de mesure Google Analytics 4 pour suivre les visites et les interactions sur votre SmartLink">
                      <InfoIcon color="action" fontSize="small" sx={{ ml: 1 }} />
                    </Tooltip>
                  ),
                }}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Controller
            name="gtmId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Google Tag Manager"
                variant="outlined"
                fullWidth
                placeholder="GTM-XXXXXXX"
                helperText="ID de conteneur GTM"
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Entrez votre ID de conteneur Google Tag Manager pour gérer tous vos tags marketing et analytics">
                      <InfoIcon color="action" fontSize="small" sx={{ ml: 1 }} />
                    </Tooltip>
                  ),
                }}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Controller
            name="adsId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Google Ads"
                variant="outlined"
                fullWidth
                placeholder="AW-XXXXXXXXXX"
                helperText="ID de conversion Google Ads"
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Entrez votre ID de conversion Google Ads pour suivre les conversions de vos campagnes publicitaires">
                      <InfoIcon color="action" fontSize="small" sx={{ ml: 1 }} />
                    </Tooltip>
                  ),
                }}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Controller
            name="metaPixelId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Meta Pixel"
                variant="outlined"
                fullWidth
                placeholder="XXXXXXXXXX"
                helperText="ID du pixel Facebook/Instagram"
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Entrez votre ID de pixel Meta pour suivre les conversions de vos campagnes Facebook et Instagram">
                      <InfoIcon color="action" fontSize="small" sx={{ ml: 1 }} />
                    </Tooltip>
                  ),
                }}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Controller
            name="tiktokPixelId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="TikTok Pixel"
                variant="outlined"
                fullWidth
                placeholder="XXXXXXXXXX"
                helperText="ID du pixel TikTok"
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Entrez votre ID de pixel TikTok pour suivre les conversions de vos campagnes TikTok">
                      <InfoIcon color="action" fontSize="small" sx={{ ml: 1 }} />
                    </Tooltip>
                  ),
                }}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={showAdvanced}
                onChange={(e) => setShowAdvanced(e.target.checked)}
                color="primary"
              />
            }
            label="Options avancées"
          />
        </Grid>
        
        {showAdvanced && (
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Configuration avancée des événements</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Controller
                      name="gaEventCategory"
                      control={control}
                      defaultValue="SmartLink"
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Catégorie d'événement GA"
                          variant="outlined"
                          fullWidth
                          size="small"
                          helperText="Catégorie d'événement pour Google Analytics"
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="gaEventAction"
                      control={control}
                      defaultValue="click"
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Action d'événement GA"
                          variant="outlined"
                          fullWidth
                          size="small"
                          helperText="Action d'événement pour Google Analytics"
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="fbEventName"
                      control={control}
                      defaultValue="ViewContent"
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Nom d'événement Meta"
                          variant="outlined"
                          fullWidth
                          size="small"
                          helperText="Nom d'événement pour Meta Pixel"
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Controller
                      name="customTrackingCode"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Code de tracking personnalisé"
                          variant="outlined"
                          fullWidth
                          multiline
                          rows={4}
                          helperText="Code JavaScript personnalisé pour le tracking (sera exécuté lors du chargement de la page)"
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default TrackingSection;
