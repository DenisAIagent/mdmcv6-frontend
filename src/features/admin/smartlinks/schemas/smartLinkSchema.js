import { z } from 'zod';

// Schéma pour un lien de plateforme individuel
const platformLinkSchema = z.object({
  platform: z.string().trim().min(1, { message: "La plateforme est requise." }),
  url: z.string().trim().url({ message: "URL invalide." })
});

// Schéma pour les IDs de suivi (legacy - compatibilité)
const trackingIdsSchema = z.object({
  ga4Id: z.string().trim().optional().or(z.literal('')), // Google Analytics 4
  gtmId: z.string().trim().optional().or(z.literal('')), // Google Tag Manager
  metaPixelId: z.string().trim().optional().or(z.literal('')), // Meta (Facebook) Pixel
  tiktokPixelId: z.string().trim().optional().or(z.literal('')), // TikTok Pixel
  googleAdsId: z.string().trim().optional().or(z.literal('')) // Google Ads Tag ID
}).optional();

// 🎯 SCHEMA ANALYTICS MANUS.IM - NOUVELLE STRUCTURE
const analyticsConfigSchema = z.object({
  // Analytics globaux MDMC
  ga4: z.object({
    measurementId: z.string().trim().optional().or(z.literal('')),
    enabled: z.boolean().optional().default(true)
  }).optional(),
  gtm: z.object({
    containerId: z.string().trim().optional().or(z.literal('')),
    enabled: z.boolean().optional().default(true)
  }).optional(),
  metaPixel: z.object({
    pixelId: z.string().trim().optional().or(z.literal('')),
    enabled: z.boolean().optional().default(true)
  }).optional(),
  tiktokPixel: z.object({
    pixelId: z.string().trim().optional().or(z.literal('')),
    enabled: z.boolean().optional().default(false)
  }).optional(),
  
  // Configuration tracking personnalisé
  customTracking: z.object({
    trackingMode: z.enum(['global', 'custom', 'hybrid']).optional().default('global'),
    clientName: z.string().trim().max(100, { message: "Nom client trop long." }).optional().or(z.literal('')),
    campaignName: z.string().trim().max(100, { message: "Nom campagne trop long." }).optional().or(z.literal('')),
    
    // Overrides pour codes personnalisés
    ga4Override: z.object({
      measurementId: z.string().trim().optional().or(z.literal('')),
      enabled: z.boolean().optional().default(false)
    }).optional(),
    gtmOverride: z.object({
      containerId: z.string().trim().optional().or(z.literal('')),
      enabled: z.boolean().optional().default(false)
    }).optional(),
    metaPixelOverride: z.object({
      pixelId: z.string().trim().optional().or(z.literal('')),
      enabled: z.boolean().optional().default(false)
    }).optional(),
    tiktokPixelOverride: z.object({
      pixelId: z.string().trim().optional().or(z.literal('')),
      enabled: z.boolean().optional().default(false)
    }).optional()
  }).optional()
}).optional();

// Schéma principal pour le formulaire SmartLink
export const smartLinkSchema = z.object({
  templateType: z.string()
    .min(1, { message: "Le type de SmartLink est requis." })
    .refine(value => ['music', 'landing_page'].includes(value), { // S'assurer que la valeur est l'une des options valides
      message: "Type de SmartLink invalide."
    }),
  trackTitle: z.string()
    .trim()
    .min(1, { message: "Le titre est requis." })
    .max(150, { message: "Le titre ne peut pas dépasser 150 caractères." }),
  artistId: z.string()
    .trim()
    .min(1, { message: "L'artiste est requis." }), 
  coverImageUrl: z.string()
    .trim()
    .url({ message: "URL d'image de couverture invalide." })
    .min(1, { message: "L'URL de l'image de couverture est requise." }),
  previewAudioUrl: z.string()
    .trim()
    .url({ message: "URL audio de preview invalide." })
    .optional()
    .or(z.literal('')),
  releaseDate: z.date({ invalid_type_error: "Date de sortie invalide." })
    .optional()
    .nullable(), 
  description: z.string()
    .trim()
    .max(500, { message: "La description ne peut pas dépasser 500 caractères." })
    .optional()
    .or(z.literal('')),
  customSubtitle: z.string()
    .trim()
    .max(40, { message: "Le sous-titre ne peut pas dépasser 40 caractères." })
    .optional()
    .or(z.literal('')),
  useDescriptionAsSubtitle: z.boolean().optional().default(false), 
  platformLinks: z.array(platformLinkSchema)
    .min(1, { message: "Au moins un lien de plateforme est requis." }), 
  trackingIds: trackingIdsSchema,
  analytics: analyticsConfigSchema,
  isPublished: z.boolean().optional().default(false),
  slug: z.string().trim().optional().or(z.literal('')), // Ajout du slug ici, car il est dans le formulaire
  utmSource: z.string().trim().max(100, { message: "utm_source trop long." }).optional().or(z.literal('')), 
  utmMedium: z.string().trim().max(100, { message: "utm_medium trop long." }).optional().or(z.literal('')), 
  utmCampaign: z.string().trim().max(100, { message: "utm_campaign trop long." }).optional().or(z.literal('')), 
  utmTerm: z.string().trim().max(100, { message: "utm_term trop long." }).optional().or(z.literal('')), 
  utmContent: z.string().trim().max(100, { message: "utm_content trop long." }).optional().or(z.literal(''))
}).superRefine((data, ctx) => {
  if (data.templateType === 'music') {
    const musicSchema = z.object({
        isrcUpc: z.string().trim().max(50, { message: "ISRC/UPC ne peut pas dépasser 50 caractères."}).optional().or(z.literal(''))
    });
    const result = musicSchema.safeParse(data); 
    if (!result.success) {
        result.error.errors.forEach((err) => {
            ctx.addIssue({ ...err, path: ['isrcUpc', ...err.path.slice(1)] });
        });
    }
  } else if (data.templateType === 'landing_page') {
    const landingPageSchema = z.object({
       pageContent: z.string().trim().max(5000, { message: "Le contenu de la page ne peut pas dépasser 5000 caractères."}).optional().or(z.literal('')), // Contenu de la page pour landing_page
       callToActionLabel: z.string().trim().max(50, { message: "Le label du bouton d'action ne peut pas dépasser 50 caractères."}).optional().or(z.literal('')), // Label du bouton d'action
       callToActionUrl: z.string().trim().url({ message: "URL du bouton d'action invalide."}).optional().or(z.literal('')), // URL du bouton d'action
    });
    const result = landingPageSchema.safeParse(data);
    if (!result.success) {
        result.error.errors.forEach((err) => {
             // Ajuster le chemin pour qu'il corresponde au nom du champ dans le formulaire principal
            const fieldName = err.path[0];
            ctx.addIssue({ ...err, path: [fieldName, ...err.path.slice(1)] });
        });
    }
  }
});


// Type TypeScript dérivé (si besoin)
// export type SmartLinkFormData = z.infer<typeof smartLinkSchema>;