import React, { useState, useEffect, useCallback } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  InputAdornment,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AddIcon from "@mui/icons-material/Add";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PreviewIcon from "@mui/icons-material/Preview";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { toast } from "react-toastify";

import { smartLinkSchema } from "@/features/admin/smartlinks/schemas/smartLinkSchema.js";
import ImageUpload from "@/features/admin/components/ImageUpload.jsx";
import ArtistCreatePage from "@/pages/admin/artists/ArtistCreatePage.jsx";
import apiService from "@/services/api.service"; 
import musicPlatformService from "@/services/musicPlatform.service.js";
import SmartLinkTemplateSelector from "./SmartLinkTemplateSelector";
import QRCodeDisplay from "./QRCodeDisplay";
import SmartLinkPreview from "./SmartLinkPreview";

const SmartLinkForm = ({ smartLinkData = null, onFormSubmitSuccess }) => {
  const isEditMode = !!smartLinkData;
  const [artists, setArtists] = useState([]);
  const [loadingArtists, setLoadingArtists] = useState(true);
  const [artistLoadError, setArtistLoadError] = useState(null);
  const [isArtistModalOpen, setIsArtistModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [isFetchingLinks, setIsFetchingLinks] = useState(false);

  const [selectedTemplate, setSelectedTemplate] = useState(
    smartLinkData?.templateType || ""
  );
  const [currentSmartLinkUrl, setCurrentSmartLinkUrl] = useState(
    isEditMode && smartLinkData?.slug
      ? `${window.location.origin}/s/${smartLinkData.slug}`
      : ""
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    getValues,
    formState: { errors, isSubmitting: isSmartLinkSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(smartLinkSchema),
    defaultValues: {
      templateType: smartLinkData?.templateType || "",
      trackTitle: smartLinkData?.trackTitle || "",
      artistId: smartLinkData?.artistId?._id || smartLinkData?.artistId || "",
      coverImageUrl: smartLinkData?.coverImageUrl || "",
      releaseDate: smartLinkData?.releaseDate
        ? new Date(`${smartLinkData.releaseDate}T00:00:00Z`)
        : null,
      description: smartLinkData?.description || "",
      customSubtitle: smartLinkData?.customSubtitle || "Choose music service",
      useDescriptionAsSubtitle: smartLinkData?.useDescriptionAsSubtitle || false,
      platformLinks: smartLinkData?.platformLinks?.length
        ? smartLinkData.platformLinks
        : [{ platform: "", url: "" }],
      trackingIds: {
        ga4Id: smartLinkData?.trackingIds?.ga4Id || "",
        gtmId: smartLinkData?.trackingIds?.gtmId || "",
        metaPixelId: smartLinkData?.trackingIds?.metaPixelId || "",
        tiktokPixelId: smartLinkData?.trackingIds?.tiktokPixelId || "",
      },
      analytics: {
        ga4: {
          measurementId: smartLinkData?.analytics?.ga4?.measurementId || "",
          enabled: smartLinkData?.analytics?.ga4?.enabled ?? true
        },
        gtm: {
          containerId: smartLinkData?.analytics?.gtm?.containerId || "",
          enabled: smartLinkData?.analytics?.gtm?.enabled ?? true
        },
        metaPixel: {
          pixelId: smartLinkData?.analytics?.metaPixel?.pixelId || "",
          enabled: smartLinkData?.analytics?.metaPixel?.enabled ?? true
        },
        tiktokPixel: {
          pixelId: smartLinkData?.analytics?.tiktokPixel?.pixelId || "",
          enabled: smartLinkData?.analytics?.tiktokPixel?.enabled ?? false
        },
        customTracking: {
          trackingMode: smartLinkData?.analytics?.customTracking?.trackingMode || "global",
          clientName: smartLinkData?.analytics?.customTracking?.clientName || "",
          campaignName: smartLinkData?.analytics?.customTracking?.campaignName || "",
          ga4Override: {
            measurementId: smartLinkData?.analytics?.customTracking?.ga4Override?.measurementId || "",
            enabled: smartLinkData?.analytics?.customTracking?.ga4Override?.enabled ?? false
          },
          gtmOverride: {
            containerId: smartLinkData?.analytics?.customTracking?.gtmOverride?.containerId || "",
            enabled: smartLinkData?.analytics?.customTracking?.gtmOverride?.enabled ?? false
          },
          metaPixelOverride: {
            pixelId: smartLinkData?.analytics?.customTracking?.metaPixelOverride?.pixelId || "",
            enabled: smartLinkData?.analytics?.customTracking?.metaPixelOverride?.enabled ?? false
          },
          tiktokPixelOverride: {
            pixelId: smartLinkData?.analytics?.customTracking?.tiktokPixelOverride?.pixelId || "",
            enabled: smartLinkData?.analytics?.customTracking?.tiktokPixelOverride?.enabled ?? false
          }
        }
      },
      isPublished: smartLinkData?.isPublished || false,
      slug: smartLinkData?.slug || "",
      utmSource: smartLinkData?.utmSource || "",
      utmMedium: smartLinkData?.utmMedium || "",
      utmCampaign: smartLinkData?.utmCampaign || "",
      utmTerm: smartLinkData?.utmTerm || "",
      utmContent: smartLinkData?.utmContent || "",
      isrcUpc: smartLinkData?.isrcUpc || "",
      pageContent: smartLinkData?.pageContent || "",
      callToActionLabel: smartLinkData?.callToActionLabel || "",
      callToActionUrl: smartLinkData?.callToActionUrl || "",
    },
  });

  const { fields: platformLinkFields, append: appendPlatformLink, remove: removePlatformLink, replace: replacePlatformLinks } = useFieldArray({
    control,
    name: "platformLinks",
  });

  useEffect(() => {
    setValue("templateType", selectedTemplate, { shouldValidate: true, shouldDirty: true });
  }, [selectedTemplate, setValue]);

  const fetchArtistsCallback = useCallback(async () => {
    setLoadingArtists(true);
    setArtistLoadError(null);
    try {
      const response = await apiService.artists.getArtists(); 
      if (response && response.success && Array.isArray(response.data)) {
        setArtists(response.data);
      } else {
        const errorMsg =
          response?.error || "Format de données artistes incorrect reçu du serveur.";
        toast.error(`Artistes: ${errorMsg}`);
        setArtistLoadError(errorMsg);
        setArtists([]);
      }
    } catch (error) {
      console.error("Erreur non interceptée lors du chargement des artistes:", error);
      const errorMessage =
        error.message ||
        "Impossible de charger la liste des artistes en raison d_une erreur inattendue.";
      toast.error(`Artistes: ${errorMessage}`);
      setArtistLoadError(errorMessage);
      setArtists([]);
    } finally {
      setLoadingArtists(false);
    }
  }, []);

  useEffect(() => {
    fetchArtistsCallback();
  }, [fetchArtistsCallback]);

  const handleImageUploadSuccess = (imageUrl) => {
    setValue("coverImageUrl", imageUrl, { shouldValidate: true, shouldDirty: true });
    toast.info("L_image de couverture a été mise à jour dans le formulaire.");
  };

  const handleFetchLinksFromISRC = async () => {
    const sourceUrlValue = getValues("isrcUpc"); // Récupérer la valeur du champ
    console.log("Frontend: Value of sourceUrl from getValues(\'isrcUpc\'):", sourceUrlValue); // Log pour débogage

    if (!sourceUrlValue || String(sourceUrlValue).trim() === "") {
      toast.warn("Veuillez saisir un code ISRC/UPC ou une URL Spotify/Apple Music/Deezer avant de lancer la recherche.");
      return;
    }
    
    setIsFetchingLinks(true);
    toast.info(`Recherche des liens pour : ${sourceUrlValue}...`);
    
    try {
      // Utiliser sourceUrlValue pour l'appel
      console.log("Frontend: Avant appel à fetchLinksFromSourceUrl avec:", sourceUrlValue);
      const response = await musicPlatformService.fetchLinksFromSourceUrl(sourceUrlValue);
      console.log("Frontend: Réponse complète de fetchLinksFromSourceUrl:", JSON.stringify(response, null, 2));
      
      // Affichage temporaire des liens bruts pour diagnostic
      if (response && response.success && response.data) {
        const rawLinks = response.data.linksByPlatform;
        if (rawLinks && Object.keys(rawLinks).length > 0) {
          const linksMessage = Object.entries(rawLinks)
            .map(([platform, url]) => `${platform}: ${url}`)
            .join('\n');
          toast.info(`Liens trouvés (diagnostic):\n${linksMessage}`, { autoClose: false });
        }
      }
      
      if (response && response.success && response.data) {
        console.log("Frontend: Structure de response.data:", response.data);
        
        const { title, artist, artwork, linksByPlatform } = response.data;
        
        if (title && !getValues("trackTitle")) {
          setValue("trackTitle", title, { shouldValidate: true, shouldDirty: true });
          console.log("Frontend: Titre défini:", title);
        }

        // Vérification détaillée de linksByPlatform
        console.log("Frontend: linksByPlatform est-il défini?", !!linksByPlatform);
        console.log("Frontend: linksByPlatform est-il un objet?", typeof linksByPlatform === 'object');
        console.log("Frontend: Clés de linksByPlatform:", linksByPlatform ? Object.keys(linksByPlatform) : "N/A");
        
        const newPlatformLinks = [];
        
        // Traitement des liens de plateformes
        if (linksByPlatform && typeof linksByPlatform === 'object' && Object.keys(linksByPlatform).length > 0) {
          console.log("Frontend: Traitement des liens de plateformes...");
          
          // Conversion de l'objet linksByPlatform en tableau de liens pour le formulaire
          for (const [platform, url] of Object.entries(linksByPlatform)) {
            if (platform && url) {
              console.log(`Frontend: Ajout du lien pour ${platform}:`, url);
              newPlatformLinks.push({ 
                platform, 
                url: typeof url === 'string' ? url.replace(/;$/, '') : url 
              });
            }
          }
          
          console.log("Frontend: Nombre de nouveaux liens:", newPlatformLinks.length);
          console.log("Frontend: Détail des nouveaux liens:", JSON.stringify(newPlatformLinks, null, 2));
          
          if (newPlatformLinks.length > 0) {
            console.log("Frontend: Avant replacePlatformLinks avec:", JSON.stringify(newPlatformLinks, null, 2));
            replacePlatformLinks(newPlatformLinks);
            console.log("Frontend: Après replacePlatformLinks");
            toast.success(`${newPlatformLinks.length} liens de plateformes trouvés et ajoutés !`);
          } else {
            console.log("Frontend: Aucun lien valide trouvé dans linksByPlatform");
            toast.info("Aucun lien valide trouvé pour cet ISRC/UPC ou cette URL sur les plateformes principales.");
          }
        } else {
          console.log("Frontend: linksByPlatform vide ou invalide");
          toast.info("Aucun lien trouvé pour cet ISRC/UPC ou cette URL sur les plateformes principales.");
        }
      } else {
        console.log("Frontend: Réponse invalide ou échec:", response);
        toast.error(response?.error || "Impossible de récupérer les liens pour cet ISRC/UPC ou cette URL.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des liens:", error);
      toast.error("Une erreur est survenue lors de la recherche des liens.");
    } finally {
      setIsFetchingLinks(false);
    }
  };

  const onSubmitSmartLink = async (data) => {
    // 🎯 Traitement des données analytics selon Manus.im
    const processedAnalytics = data.analytics ? {
      ga4: {
        measurementId: data.analytics.ga4?.measurementId?.trim() || "",
        enabled: data.analytics.ga4?.enabled ?? true
      },
      gtm: {
        containerId: data.analytics.gtm?.containerId?.trim() || "",
        enabled: data.analytics.gtm?.enabled ?? true
      },
      metaPixel: {
        pixelId: data.analytics.metaPixel?.pixelId?.trim() || "",
        enabled: data.analytics.metaPixel?.enabled ?? true
      },
      tiktokPixel: {
        pixelId: data.analytics.tiktokPixel?.pixelId?.trim() || "",
        enabled: data.analytics.tiktokPixel?.enabled ?? false
      },
      customTracking: {
        trackingMode: data.analytics.customTracking?.trackingMode || "global",
        clientName: data.analytics.customTracking?.clientName?.trim() || "",
        campaignName: data.analytics.customTracking?.campaignName?.trim() || "",
        ga4Override: {
          measurementId: data.analytics.customTracking?.ga4Override?.measurementId?.trim() || "",
          enabled: data.analytics.customTracking?.ga4Override?.enabled ?? false
        },
        gtmOverride: {
          containerId: data.analytics.customTracking?.gtmOverride?.containerId?.trim() || "",
          enabled: data.analytics.customTracking?.gtmOverride?.enabled ?? false
        },
        metaPixelOverride: {
          pixelId: data.analytics.customTracking?.metaPixelOverride?.pixelId?.trim() || "",
          enabled: data.analytics.customTracking?.metaPixelOverride?.enabled ?? false
        },
        tiktokPixelOverride: {
          pixelId: data.analytics.customTracking?.tiktokPixelOverride?.pixelId?.trim() || "",
          enabled: data.analytics.customTracking?.tiktokPixelOverride?.enabled ?? false
        }
      }
    } : null;

    console.log("🎯 Analytics processés pour soumission:", processedAnalytics);

    const submissionData = {
      ...data,
      templateType: selectedTemplate,
      releaseDate: data.releaseDate
        ? new Date(data.releaseDate).toISOString().split("T")[0]
        : null,
      trackingIds: Object.fromEntries(
        Object.entries(data.trackingIds || {}).filter(
          ([_, value]) => value && String(value).trim() !== ""
        )
      ),
      analytics: processedAnalytics,
      platformLinks: data.platformLinks.filter(
        (link) => link.platform && link.platform.trim() !== "" && link.url && link.url.trim() !== ""
      ),
      utmSource: data.utmSource || "",
      utmMedium: data.utmMedium || "",
      utmCampaign: data.utmCampaign || "",
      utmTerm: data.utmTerm || "",
      utmContent: data.utmContent || "",
      isrcUpc: data.templateType === "music" ? data.isrcUpc : undefined,
      pageContent: data.templateType === "landing_page" ? data.pageContent : undefined,
      callToActionLabel: data.templateType === "landing_page" ? data.callToActionLabel : undefined,
      callToActionUrl: data.templateType === "landing_page" ? data.callToActionUrl : undefined,
    };

    try {
      let responseData;
      if (isEditMode) {
        responseData = await apiService.smartlinks.update(
          smartLinkData._id,
          submissionData
        );
        toast.success("SmartLink mis à jour avec succès !");
      } else {
        responseData = await apiService.smartlinks.create(submissionData);
        toast.success("SmartLink créé avec succès !");
      }

      if (responseData && responseData.success && responseData.data) {
        if (onFormSubmitSuccess) onFormSubmitSuccess(responseData.data);
        
        if (responseData.data.slug) {
            setCurrentSmartLinkUrl(`${window.location.origin}/s/${responseData.data.slug}`);
        } else {
            setCurrentSmartLinkUrl("");
        }

        if (!isEditMode) {
          const currentArtistId = watch("artistId");
          const currentTemplateType = getValues("templateType");
          reset({
            templateType: currentTemplateType,
            trackTitle: "",
            artistId: currentArtistId,
            coverImageUrl: "",
            releaseDate: null,
            description: "",
            customSubtitle: "Choose music service",
            useDescriptionAsSubtitle: false,
            platformLinks: [{ platform: "", url: "" }],
            trackingIds: { ga4Id: "", gtmId: "", metaPixelId: "", tiktokPixelId: "" },
            analytics: {
              ga4: { measurementId: "", enabled: true },
              gtm: { containerId: "", enabled: true },
              metaPixel: { pixelId: "", enabled: true },
              tiktokPixel: { pixelId: "", enabled: false },
              customTracking: {
                trackingMode: "global",
                clientName: "",
                campaignName: "",
                ga4Override: { measurementId: "", enabled: false },
                gtmOverride: { containerId: "", enabled: false },
                metaPixelOverride: { pixelId: "", enabled: false },
                tiktokPixelOverride: { pixelId: "", enabled: false }
              }
            },
            isPublished: false,
            slug: "",
            utmSource: "",
            utmMedium: "",
            utmCampaign: "",
            utmTerm: "",
            utmContent: "",
            isrcUpc: "",
            pageContent: "", 
            callToActionLabel: "",
            callToActionUrl: "",
          });
        } else {
          const updatedDefaults = {
            ...responseData.data,
            templateType: responseData.data.templateType || selectedTemplate,
            isrcUpc: responseData.data.isrcUpc || "",
            pageContent: responseData.data.pageContent || "",
            callToActionLabel: responseData.data.callToActionLabel || "",
            callToActionUrl: responseData.data.callToActionUrl || "",
          };
          if (responseData.data.releaseDate) {
            updatedDefaults.releaseDate = new Date(
              `${responseData.data.releaseDate}T00:00:00Z`
            );
          }
          if (!updatedDefaults.platformLinks || updatedDefaults.platformLinks.length === 0) {
            updatedDefaults.platformLinks = [{ platform: "", url: "" }];
          }
          reset(updatedDefaults);
          setSelectedTemplate(updatedDefaults.templateType);
        }
      } else {
        toast.error(
          responseData?.error ||
            "Échec de l_enregistrement du SmartLink. Veuillez vérifier les informations."
        );
      }
    } catch (error) {
      console.error("Erreur non interceptée lors de la soumission du formulaire SmartLink:", error);
      toast.error(
        error.message ||
          "Une erreur serveur est survenue lors de l_enregistrement du SmartLink."
      );
    }
  };

  const handleOpenArtistModal = () => setIsArtistModalOpen(true);
  const handleCloseArtistModal = () => setIsArtistModalOpen(false);

  const handleArtistCreatedInModal = (newlyCreatedArtist) => {
    fetchArtistsCallback();
    handleCloseArtistModal();
    if (newlyCreatedArtist && newlyCreatedArtist._id) {
      setValue("artistId", newlyCreatedArtist._id, { shouldValidate: true, shouldDirty: true });
      toast.info(`Artiste "${newlyCreatedArtist.name}" créé et sélectionné.`);
    }
  };

  const handleOpenPreviewModal = () => {
    const currentData = getValues();
    setPreviewData(currentData);
    setIsPreviewModalOpen(true);
  };
  const handleClosePreviewModal = () => setIsPreviewModalOpen(false);

  const watchedTemplateType = watch("templateType");
  const watchedSlug = watch("slug");

  useEffect(() => {
    if (isEditMode && watchedSlug) {
      setCurrentSmartLinkUrl(`${window.location.origin}/s/${watchedSlug}`);
    } else if (!isEditMode) {
      // Pour la création, l_URL n_est connue qu_après soumission
    }
  }, [watchedSlug, isEditMode]);

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
      <Grid container spacing={3} sx={{mb: 2}}>
        <Grid item xs={12} md={isEditMode && currentSmartLinkUrl ? 8 : 12}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: "medium" }}>
                {isEditMode ? "Modifier le SmartLink" : "Créer un nouveau SmartLink"}
            </Typography>
        </Grid>
        {isEditMode && currentSmartLinkUrl && (
            <Grid item xs={12} md={4} sx={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-start" }}>
                <QRCodeDisplay smartLinkUrl={currentSmartLinkUrl} />
            </Grid>
        )}
      </Grid>

      <form onSubmit={handleSubmit(onSubmitSmartLink)} noValidate>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Controller
              name="templateType"
              control={control}
              render={({ field }) => (
                <SmartLinkTemplateSelector
                  selectedTemplate={field.value}
                  onTemplateChange={(value) => {
                    field.onChange(value);
                    setSelectedTemplate(value); 
                  }}
                  error={!!errors.templateType}
                  helperText={errors.templateType?.message}
                  disabled={isEditMode} 
                />
              )}
            />
          </Grid>

          {(watchedTemplateType === "music" || watchedTemplateType === "landing_page") && (
            <Grid item xs={12} md={6}>
              <TextField {...register("trackTitle")} label={watchedTemplateType === "music" ? "Titre de la musique/single/album" : "Titre de la page"} required fullWidth variant="outlined" error={!!errors.trackTitle} helperText={errors.trackTitle?.message}/>
            </Grid>
          )}
          
          {watchedTemplateType === "music" && (
             <Grid item xs={12} md={6}>
                <TextField 
                    {...register("isrcUpc")} 
                    label="ISRC / UPC ou URL Spotify/Apple Music/Deezer"
                    fullWidth 
                    variant="outlined" 
                    error={!!errors.isrcUpc} 
                    helperText={errors.isrcUpc?.message || "Saisir un ISRC/UPC ou une URL de plateforme pour l_auto-complétion"}
                    InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title="Rechercher automatiquement les liens des plateformes à partir de l_ISRC/UPC ou d_une URL">
                              <IconButton
                                onClick={handleFetchLinksFromISRC}
                                disabled={isFetchingLinks}
                                edge="end"
                                color="primary"
                              >
                                {isFetchingLinks ? <CircularProgress size={24} /> : <AutoAwesomeIcon />}
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        ),
                    }}
                />
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.artistId} variant="outlined">
              <InputLabel id="artist-select-label">Artiste *</InputLabel>
              <Controller
                name="artistId"
                control={control}
                render={({ field }) => (
                  <Select
                    labelId="artist-select-label"
                    label="Artiste *"
                    {...field}
                    disabled={loadingArtists}
                    startAdornment={loadingArtists ? <CircularProgress size={20} sx={{ mr: 1}} /> : null}
                  >
                    <MenuItem value="" disabled>
                      <em>{loadingArtists ? "Chargement..." : "Sélectionner un artiste"}</em>
                    </MenuItem>
                    {artists.map((artist) => (
                      <MenuItem key={artist._id} value={artist._id}>
                        {artist.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.artistId && (
                <FormHelperText>{errors.artistId.message}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: "flex", alignItems: "center" }}>
            <Button
              variant="outlined"
              onClick={handleOpenArtistModal}
              startIcon={<AddIcon />}
              sx={{ height: "56px" }} 
            >
              Nouvel Artiste
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "medium", mt: 2 }}>
              Image de couverture
            </Typography>
            <Controller
              name="coverImageUrl"
              control={control}
              render={({ field }) => (
                <ImageUpload
                  initialImage={field.value}
                  onUploadSuccess={handleImageUploadSuccess}
                  folderPath="smartlinks/covers"
                />
              )}
            />
            {errors.coverImageUrl && (
              <FormHelperText error sx={{ mt: 1 }}>
                {errors.coverImageUrl.message}
              </FormHelperText>
            )}
          </Grid>

          {watchedTemplateType === "music" && (
            <Grid item xs={12} md={6}>
              <Controller
                name="releaseDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    type="date"
                    label="Date de sortie"
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""}
                    onChange={(e) => {
                      const dateValue = e.target.value ? new Date(e.target.value) : null;
                      field.onChange(dateValue);
                    }}
                    error={!!errors.releaseDate}
                    helperText={errors.releaseDate?.message}
                  />
                )}
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <TextField {...register("description")} label="Description (optionnel)" fullWidth multiline rows={3} variant="outlined" error={!!errors.description} helperText={errors.description?.message}/>
          </Grid>

          {/* Section Sous-titre personnalisé */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Sous-titre de la page
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="useDescriptionAsSubtitle"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value}
                      onChange={field.onChange}
                      color="primary"
                    />
                  }
                  label="Utiliser la description comme sous-titre"
                />
              )}
            />
            <FormHelperText>
              Si activé, la description sera affichée sous le titre. Sinon, utilisez le texte personnalisé ci-dessous.
            </FormHelperText>
          </Grid>

          {!watch("useDescriptionAsSubtitle") && (
            <Grid item xs={12}>
              <TextField
                {...register("customSubtitle")}
                label="Sous-titre personnalisé (max 40 caractères)"
                fullWidth
                variant="outlined"
                error={!!errors.customSubtitle}
                helperText={errors.customSubtitle?.message || "Ex: 'Découvrez le nouveau single', 'Écouter maintenant'"}
                inputProps={{ maxLength: 40 }}
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "medium", mt: 2 }}>
              Liens des plateformes
            </Typography>
            {platformLinkFields.map((item, index) => (
              <Grid container spacing={2} key={item.id} sx={{ mb: 2, alignItems: "center" }}>
                <Grid item xs={12} sm={5}>
                  <TextField {...register(`platformLinks.${index}.platform`)} label="Nom de la plateforme (ex: Spotify)" fullWidth variant="outlined" error={!!errors.platformLinks?.[index]?.platform} helperText={errors.platformLinks?.[index]?.platform?.message}/>
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField {...register(`platformLinks.${index}.url`)} label="URL du lien" fullWidth variant="outlined" error={!!errors.platformLinks?.[index]?.url} helperText={errors.platformLinks?.[index]?.url?.message}/>
                </Grid>
                <Grid item xs={12} sm={2} sx={{ display: "flex", justifyContent: { xs: "flex-start", sm: "center" } }}>
                  <IconButton onClick={() => removePlatformLink(index)} color="error" aria-label="Supprimer le lien">
                    <RemoveCircleOutlineIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Button
              type="button"
              variant="outlined"
              onClick={() => appendPlatformLink({ platform: "", url: "" })}
              startIcon={<AddCircleOutlineIcon />}
            >
              Ajouter un lien de plateforme
            </Button>
          </Grid>

          {watchedTemplateType === "landing_page" && (
            <>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "medium", mt: 2 }}>
                  Contenu de la Landing Page
                </Typography>
                <TextField {...register("pageContent")} label="Contenu principal de la page" fullWidth multiline rows={5} variant="outlined" error={!!errors.pageContent} helperText={errors.pageContent?.message}/>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField {...register("callToActionLabel")} label="Texte du bouton d_action (ex: Acheter maintenant)" fullWidth variant="outlined" error={!!errors.callToActionLabel} helperText={errors.callToActionLabel?.message}/>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField {...register("callToActionUrl")} label="URL du bouton d_action" fullWidth variant="outlined" error={!!errors.callToActionUrl} helperText={errors.callToActionUrl?.message}/>
              </Grid>
            </>
          )}

          {/* 🎯 SECTION ANALYTICS MANUS.IM - MODES DE TRACKING */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", mt: 3, mb: 2, color: "primary.main" }}>
              🎯 Analytics & Tracking (Système Manus.im)
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
              Configuration avancée des analytics avec détection 100% Tag Assistant
            </Typography>
          </Grid>

          {/* Mode de tracking */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="tracking-mode-label">Mode de tracking</InputLabel>
              <Controller
                name="analytics.customTracking.trackingMode"
                control={control}
                defaultValue="global"
                render={({ field }) => (
                  <Select
                    labelId="tracking-mode-label"
                    label="Mode de tracking"
                    {...field}
                  >
                    <MenuItem value="global">
                      Global - Codes MDMC par défaut
                    </MenuItem>
                    <MenuItem value="custom">
                      Custom - Codes personnalisés client
                    </MenuItem>
                    <MenuItem value="hybrid">
                      Hybrid - Global + Custom simultanément
                    </MenuItem>
                  </Select>
                )}
              />
              <FormHelperText>
                Global: utilise les codes MDMC | Custom: codes client uniquement | Hybrid: les deux
              </FormHelperText>
            </FormControl>
          </Grid>

          {/* Nom du client et campagne */}
          <Grid item xs={12} md={4}>
            <TextField
              {...register("analytics.customTracking.clientName")}
              label="Nom du client"
              fullWidth
              variant="outlined"
              helperText="Ex: Jiro, Universal Music, etc."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              {...register("analytics.customTracking.campaignName")}
              label="Nom de la campagne"
              fullWidth
              variant="outlined"
              helperText="Ex: Album Launch, Summer Campaign"
            />
          </Grid>

          {/* Analytics globaux MDMC */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "medium", mt: 2 }}>
              📊 Analytics Globaux MDMC
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  {...register("analytics.ga4.measurementId")}
                  label="GA4 ID Global"
                  fullWidth
                  variant="outlined"
                  placeholder="G-XXXXXXXXXX"
                  helperText="Code GA4 principal MDMC"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  {...register("analytics.gtm.containerId")}
                  label="GTM ID Global"
                  fullWidth
                  variant="outlined"
                  placeholder="GTM-XXXXXXX"
                  helperText="Code GTM principal MDMC"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  {...register("analytics.metaPixel.pixelId")}
                  label="Meta Pixel Global"
                  fullWidth
                  variant="outlined"
                  placeholder="123456789"
                  helperText="Pixel Facebook/Meta MDMC"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  {...register("analytics.tiktokPixel.pixelId")}
                  label="TikTok Pixel Global"
                  fullWidth
                  variant="outlined"
                  placeholder="TIKTOK123"
                  helperText="Pixel TikTok MDMC"
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Analytics personnalisés client */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "medium", mt: 2 }}>
              🎨 Analytics Personnalisés Client
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
              Ces codes remplacent (mode custom) ou s'ajoutent (mode hybrid) aux codes globaux
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Controller
                      name="analytics.customTracking.ga4Override.enabled"
                      control={control}
                      defaultValue={false}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                          color="primary"
                        />
                      )}
                    />
                  }
                  label="GA4 Custom"
                />
                <TextField
                  {...register("analytics.customTracking.ga4Override.measurementId")}
                  label="GA4 ID Client"
                  fullWidth
                  variant="outlined"
                  placeholder="G-CLIENT-XXX"
                  size="small"
                  sx={{ mt: 1 }}
                  helperText="Code GA4 spécifique client"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Controller
                      name="analytics.customTracking.gtmOverride.enabled"
                      control={control}
                      defaultValue={false}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                          color="primary"
                        />
                      )}
                    />
                  }
                  label="GTM Custom"
                />
                <TextField
                  {...register("analytics.customTracking.gtmOverride.containerId")}
                  label="GTM ID Client"
                  fullWidth
                  variant="outlined"
                  placeholder="GTM-CLIENT-X"
                  size="small"
                  sx={{ mt: 1 }}
                  helperText="Code GTM spécifique client"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Controller
                      name="analytics.customTracking.metaPixelOverride.enabled"
                      control={control}
                      defaultValue={false}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                          color="primary"
                        />
                      )}
                    />
                  }
                  label="Meta Custom"
                />
                <TextField
                  {...register("analytics.customTracking.metaPixelOverride.pixelId")}
                  label="Meta Pixel Client"
                  fullWidth
                  variant="outlined"
                  placeholder="987654321"
                  size="small"
                  sx={{ mt: 1 }}
                  helperText="Pixel Meta spécifique client"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Controller
                      name="analytics.customTracking.tiktokPixelOverride.enabled"
                      control={control}
                      defaultValue={false}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                          color="primary"
                        />
                      )}
                    />
                  }
                  label="TikTok Custom"
                />
                <TextField
                  {...register("analytics.customTracking.tiktokPixelOverride.pixelId")}
                  label="TikTok Pixel Client"
                  fullWidth
                  variant="outlined"
                  placeholder="TIKTOK-CLIENT"
                  size="small"
                  sx={{ mt: 1 }}
                  helperText="Pixel TikTok spécifique client"
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Section compatibilité ancienne */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "medium", mt: 2, color: "warning.main" }}>
              ⚠️ Compatibilité Ancienne Système (Déprécié)
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
              Ces champs sont conservés pour la compatibilité. Utilisez plutôt la configuration ci-dessus.
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}><TextField {...register("trackingIds.ga4Id")} label="GA4 ID (Legacy)" fullWidth variant="outlined" size="small" disabled error={!!errors.trackingIds?.ga4Id} helperText={errors.trackingIds?.ga4Id?.message}/></Grid>
              <Grid item xs={12} sm={6} md={3}><TextField {...register("trackingIds.gtmId")} label="GTM ID (Legacy)" fullWidth variant="outlined" size="small" disabled error={!!errors.trackingIds?.gtmId} helperText={errors.trackingIds?.gtmId?.message}/></Grid>
              <Grid item xs={12} sm={6} md={3}><TextField {...register("trackingIds.metaPixelId")} label="Meta Pixel (Legacy)" fullWidth variant="outlined" size="small" disabled error={!!errors.trackingIds?.metaPixelId} helperText={errors.trackingIds?.metaPixelId?.message}/></Grid>
              <Grid item xs={12} sm={6} md={3}><TextField {...register("trackingIds.tiktokPixelId")} label="TikTok Pixel (Legacy)" fullWidth variant="outlined" size="small" disabled error={!!errors.trackingIds?.tiktokPixelId} helperText={errors.trackingIds?.tiktokPixelId?.message}/></Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "medium", mt: 2 }}>
              Paramètres UTM (optionnel)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}><TextField {...register("utmSource")} label="UTM Source" fullWidth variant="outlined" error={!!errors.utmSource} helperText={errors.utmSource?.message}/></Grid>
              <Grid item xs={12} sm={6} md={4}><TextField {...register("utmMedium")} label="UTM Medium" fullWidth variant="outlined" error={!!errors.utmMedium} helperText={errors.utmMedium?.message}/></Grid>
              <Grid item xs={12} sm={6} md={4}><TextField {...register("utmCampaign")} label="UTM Campaign" fullWidth variant="outlined" error={!!errors.utmCampaign} helperText={errors.utmCampaign?.message}/></Grid>
              <Grid item xs={12} sm={6} md={6}><TextField {...register("utmTerm")} label="UTM Term" fullWidth variant="outlined" error={!!errors.utmTerm} helperText={errors.utmTerm?.message}/></Grid>
              <Grid item xs={12} sm={6} md={6}><TextField {...register("utmContent")} label="UTM Content" fullWidth variant="outlined" error={!!errors.utmContent} helperText={errors.utmContent?.message}/></Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField {...register("slug")} label="Slug (URL personnalisée, ex: mon-nouveau-single)" fullWidth variant="outlined" error={!!errors.slug} helperText={errors.slug?.message || "Laisser vide pour une génération automatique basée sur le titre."}/>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel control={<Controller name="isPublished" control={control} render={({ field }) => <Switch {...field} checked={field.value} />}/>} label="Publier le SmartLink"/>
          </Grid>

          <Grid item xs={12} sx={{ mt: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Button
              type="button"
              variant="outlined"
              onClick={handleOpenPreviewModal}
              startIcon={<PreviewIcon />}
              disabled={isSmartLinkSubmitting}
            >
              Prévisualiser
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSmartLinkSubmitting || loadingArtists}
              startIcon={isSmartLinkSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isEditMode ? "Mettre à jour le SmartLink" : "Créer le SmartLink"}
            </Button>
          </Grid>
        </Grid>
      </form>

      <Dialog open={isArtistModalOpen} onClose={handleCloseArtistModal} maxWidth="md" fullWidth>
        <DialogTitle>Créer un nouvel artiste</DialogTitle>
        <DialogContent>
          <ArtistCreatePage onFormSubmitSuccess={handleArtistCreatedInModal} isModalMode={true} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseArtistModal}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isPreviewModalOpen} onClose={handleClosePreviewModal} maxWidth="lg" fullWidth>
        <DialogTitle>Prévisualisation du SmartLink</DialogTitle>
        <DialogContent>
          {previewData && <SmartLinkPreview smartLinkData={previewData} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreviewModal}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default SmartLinkForm;

