import apiService from "./api.service";

const musicPlatformService = {
  async fetchLinksFromSourceUrl(sourceUrl) {
    // === VÉRIFICATIONS DE DEBUG ===
    console.log("DEBUG: apiService:", apiService);
    console.log("DEBUG: apiService.smartlinks:", apiService?.smartlinks);
    console.log("DEBUG: fetchPlatformLinks exists:", typeof apiService?.smartlinks?.fetchPlatformLinks);
    
    if (!apiService?.smartlinks?.fetchPlatformLinks) {
      console.error("ERREUR: fetchPlatformLinks n'existe pas dans apiService.smartlinks");
      throw new Error("Service smartlinks non configuré correctement");
    }
    // === FIN VÉRIFICATIONS DE DEBUG ===

    console.log(`Frontend: Demande de récupération des liens pour : ${sourceUrl}`);
    try {
      // Préparation de l'URL pour l'API
      let cleanSourceUrl = sourceUrl.trim();
      
      // Nettoyage des paramètres d'URL pour Spotify
      if (cleanSourceUrl.includes('?') && cleanSourceUrl.includes('spotify.com')) {
        cleanSourceUrl = cleanSourceUrl.split('?')[0];
        console.log("Frontend: URL Spotify nettoyée des paramètres:", cleanSourceUrl);
      }
      
      // Correction: Utilisation de apiService.smartlinks.fetchPlatformLinks au lieu de apiService.fetchPlatformLinks
      const response = await apiService.smartlinks.fetchPlatformLinks(cleanSourceUrl);
      
      console.log("Frontend: Réponse reçue du backend pour fetch-platform-links:", JSON.stringify(response, null, 2));

      if (response && response.success && response.data) {
        // Vérification détaillée de la structure de la réponse
        console.log("Frontend: Structure de response.data:", Object.keys(response.data));
        console.log("Frontend: Type de response.data:", typeof response.data);
        
        // Vérification spécifique pour les liens
        const links = response.data.links || {};
        console.log("Frontend: Type de links:", typeof links);
        console.log("Frontend: links est-il un tableau?", Array.isArray(links));
        console.log("Frontend: Contenu brut de links:", JSON.stringify(links, null, 2));
        console.log("Frontend: Clés de links:", Object.keys(links));
        
        // Vérification plus stricte de la présence de liens valides
        const hasLinks = typeof links === 'object' && !Array.isArray(links) && Object.keys(links).length > 0;
        console.log("Frontend: hasLinks:", hasLinks);
        
        if (hasLinks) {
          // Nettoyage des liens pour supprimer les caractères indésirables
          const cleanedLinks = {};
          for (const [platform, url] of Object.entries(links)) {
            // Vérifier si l'URL est une chaîne et nettoyer les points-virgules
            const cleanUrl = typeof url === 'string' ? url.replace(/;$/, '') : url;
            cleanedLinks[platform] = cleanUrl;
          }
          
          console.log("Frontend: Liens nettoyés:", cleanedLinks);
          
          return {
            success: true,
            data: {
              title: response.data.title || "",
              artist: response.data.artistName || "",
              artwork: response.data.thumbnailUrl || "",
              linksByPlatform: cleanedLinks,
              isrc: sourceUrl.startsWith("ISRC:") ? sourceUrl.substring(5) : "" 
            }
          };
        } else {
          // Cas où links existe mais est vide ou n'a pas la structure attendue
          console.log("Frontend: Aucun lien trouvé dans la réponse ou structure incorrecte");
          return {
            success: false,
            error: "Aucun lien trouvé pour cette URL/ISRC.",
            data: null
          };
        }
      } else {
        // Gérer les cas où la réponse du backend n'est pas celle attendue ou indique un échec
        const errorMessage = response && response.message 
          ? response.message 
          : "Réponse invalide ou échec de la récupération des liens depuis le backend.";
        console.error("Frontend: Erreur ou réponse invalide du backend:", response);
        return {
          success: false,
          error: errorMessage,
          data: null
        };
      }
    } catch (error) {
      console.error("Frontend: Erreur lors de l'appel à /smartlinks/fetch-platform-links:", error);
      let errorMessage = "Erreur lors de la récupération des liens musicaux.";
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      return {
        success: false,
        error: errorMessage,
        data: null
      };
    }
  }
};

export default musicPlatformService;
