// frontend/src/features/admin/components/ImageUpload.jsx

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// TODO: Importer la vraie fonction d'upload depuis ton service API
// import { uploadImage } from '../../../services/api'; // Ajuste le chemin si besoin

// Supprimer la fonction placeholder uploadImageApi si elle existe encore

const ImageUpload = ({ onUploadSuccess, initialImageUrl = null }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(initialImageUrl);

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    setError(null); // Reset error on new attempt

    // Gérer les fichiers rejetés par react-dropzone (type, taille)
    if (rejectedFiles && rejectedFiles.length > 0) {
      const rejectionError = rejectedFiles[0].errors[0];
      let userMessage = "Erreur de fichier.";
      // Donner des messages plus précis si possible
      if (rejectionError.code === 'file-invalid-type') {
          userMessage = "Type de fichier invalide. Images uniquement.";
      } else if (rejectionError.code === 'file-too-large') {
          userMessage = "Fichier trop volumineux (Max 5MB)."; // Assure-toi que la limite est définie dans useDropzone ou multer
      } else {
          userMessage = rejectionError.message; // Message par défaut de la librairie
      }
      setError(userMessage);
      if (onUploadSuccess) onUploadSuccess(null); // Notifier l'échec au parent
      return;
    }

    const file = acceptedFiles?.[0];
    if (!file) return;

    setUploading(true);
    // setUploadedImageUrl(null); // Optionnel: Effacer l'image précédente pendant l'upload

    const formData = new FormData();
    formData.append('image', file); // 'image' doit correspondre au nom attendu par multer backend

    try {
      // TODO: Remplacer par l'appel API réel vers ton backend qui utilise Cloudinary
      // const response = await uploadImage(formData);
      // ------- Simulation pour le moment -------
      console.log("Simulating API call to upload:", file.name);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simule délai réseau
      // Simule une réponse succès/échec aléatoire
      const simulateSuccess = Math.random() > 0.1; // 90% succès
      if (!simulateSuccess) throw new Error("Échec simulé de l'upload");
      const response = {
          success: true,
          // Utilise une image réelle de Cloudinary pour un aperçu plus réaliste
          data: { imageUrl: `https://res.cloudinary.com/demo/image/upload/w_200,h_150,c_fill,g_auto/${file.name}` },
          message: "Simulation d'upload réussie."
      };
      // ------- Fin de la simulation -------

      // Traitement de la réponse réelle
      if (response && response.success && response.data.imageUrl) {
        const newUrl = response.data.imageUrl;
        setUploadedImageUrl(newUrl);
        if (onUploadSuccess) {
          onUploadSuccess(newUrl); // Passe la nouvelle URL au formulaire parent
        }
        // TODO: Ajouter un toast.success("Image téléversée !") ici
      } else {
        // Si l'API répond success: false ou si data.imageUrl manque
        throw new Error(response?.message || "Erreur lors de l'upload de l'image.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Une erreur inconnue est survenue lors de l'upload.");
       if (onUploadSuccess) {
          onUploadSuccess(null); // Notifier le parent de l'échec
        }
       // TODO: Ajouter un toast.error(err.message || "Échec de l'upload.") ici
    } finally {
      setUploading(false);
    }
  }, [onUploadSuccess]);

  // Configuration de react-dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/gif': [],
      'image/webp': []
    }, // Syntaxe plus récente pour 'accept'
    maxSize: 5 * 1024 * 1024, // Limite de taille (ex: 5MB) - doit correspondre au backend
    multiple: false
  });

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Image (Artiste / Pochette)
      </Typography>
      <Box
        {...getRootProps()}
        sx={{
          border: `2px dashed ${isDragActive ? 'primary.main' : (error ? 'error.main' : 'grey.500')}`, // Bordure rouge en cas d'erreur
          borderRadius: 1,
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          transition: 'border-color 0.2s ease-in-out, background-color 0.2s ease-in-out', // Transition douce
          '&:hover': {
            borderColor: 'primary.main',
          },
        }}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography>Téléversement...</Typography>
          </Box>
        ) : uploadedImageUrl ? (
          // Affichage de l'aperçu si une image a été uploadée avec succès
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img
              src={uploadedImageUrl}
              alt="Aperçu"
              style={{ maxWidth: '100%', maxHeight: '150px', marginBottom: '10px', borderRadius: '4px', objectFit: 'cover' }} // objectFit: 'cover'
            />
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main', mt:1 }}>
                <CheckCircleOutlineIcon sx={{ mr: 1 }} fontSize="small"/>
                <Typography variant="body2">Image chargée. Cliquez/Déposez pour remplacer.</Typography>
            </Box>
          </Box>
        ) : (
          // État initial ou après une erreur sans image uploadée
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CloudUploadIcon sx={{ fontSize: 40, mb: 1, color: 'text.secondary' }} />
            {isDragActive ? (
              <Typography>Déposez l'image ici ...</Typography>
            ) : (
              <Typography>Glissez-déposez une image ici, ou cliquez pour sélectionner</Typography>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              (JPEG, PNG, GIF, WEBP - Max 5MB)
            </Typography>
          </Box>
        )}
      </Box>
      {/* Affichage de l'erreur sous la zone de drop */}
      {error && (
        <Alert severity="error" icon={<ErrorOutlineIcon fontSize="inherit" />} sx={{ mt: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default ImageUpload;
