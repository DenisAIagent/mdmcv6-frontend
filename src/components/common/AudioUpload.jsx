/**
 * 🎵 Composant d'upload audio pour preview SmartLink
 * Upload MP3 30 secondes max pour le bouton play
 */

import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Alert,
  IconButton,
  Card,
  CardContent
} from '@mui/material';
import {
  CloudUpload,
  PlayArrow,
  Pause,
  Delete,
  VolumeUp
} from '@mui/icons-material';

const AudioUpload = ({ value, onChange, error, helperText }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [audioInfo, setAudioInfo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);

  // Validation du fichier audio
  const validateAudioFile = (file) => {
    const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav'];
    const maxSize = 10 * 1024 * 1024; // 10MB max
    const maxDuration = 35; // 35 secondes max pour être sûr

    if (!validTypes.includes(file.type)) {
      throw new Error('Format non supporté. Utilisez MP3 ou WAV.');
    }

    if (file.size > maxSize) {
      throw new Error('Fichier trop volumineux. Maximum 10MB.');
    }

    return true;
  };

  // Obtenir les infos du fichier audio
  const getAudioInfo = (file) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);
      
      audio.onloadedmetadata = () => {
        const info = {
          name: file.name,
          size: file.size,
          duration: audio.duration,
          url: url
        };
        
        if (audio.duration > 35) {
          reject(new Error('L\'audio ne doit pas dépasser 30 secondes.'));
        } else {
          resolve(info);
        }
      };
      
      audio.onerror = () => {
        reject(new Error('Impossible de lire le fichier audio.'));
      };
      
      audio.src = url;
    });
  };

  // Gestion de la sélection de fichier
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Validation
      validateAudioFile(file);

      // Simulation de progression d'upload
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Obtenir les infos audio
      const info = await getAudioInfo(file);
      setAudioInfo(info);

      // Simuler l'upload vers le serveur
      // TODO: Remplacer par un vrai upload vers le backend
      const audioUrl = info.url; // En production: URL du serveur
      
      onChange(audioUrl);
      
    } catch (error) {
      console.error('Erreur upload audio:', error);
      // TODO: Afficher l'erreur à l'utilisateur
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Lecture/pause de l'audio
  const togglePlayback = () => {
    if (!audioRef.current || !audioInfo) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Supprimer l'audio
  const handleRemove = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    
    if (audioInfo?.url) {
      URL.revokeObjectURL(audioInfo.url);
    }
    
    setAudioInfo(null);
    onChange(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format de la durée
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        🎵 Extrait Audio (Preview)
      </Typography>
      
      {/* Zone d'upload */}
      {!audioInfo && !isUploading && (
        <Box>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/mp3,audio/mpeg,audio/wav"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          
          <Button
            variant="outlined"
            startIcon={<CloudUpload />}
            onClick={() => fileInputRef.current?.click()}
            fullWidth
            sx={{ 
              py: 3,
              borderStyle: 'dashed',
              borderWidth: 2,
              '&:hover': {
                borderStyle: 'dashed',
                borderWidth: 2,
              }
            }}
          >
            <Box textAlign="center">
              <Typography variant="body1">
                Cliquez pour ajouter un extrait audio
              </Typography>
              <Typography variant="caption" color="text.secondary">
                MP3 ou WAV • Max 30 secondes • Max 10MB
              </Typography>
            </Box>
          </Button>
        </Box>
      )}

      {/* Progression d'upload */}
      {isUploading && (
        <Box sx={{ py: 2 }}>
          <Typography variant="body2" gutterBottom>
            Upload en cours...
          </Typography>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}

      {/* Lecteur audio */}
      {audioInfo && (
        <Card variant="outlined">
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <IconButton 
                onClick={togglePlayback}
                color="primary"
                size="large"
              >
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>
              
              <Box flex={1}>
                <Typography variant="body2" fontWeight="medium">
                  {audioInfo.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDuration(audioInfo.duration)} • {(audioInfo.size / 1024 / 1024).toFixed(1)} MB
                </Typography>
              </Box>
              
              <IconButton onClick={handleRemove} color="error">
                <Delete />
              </IconButton>
            </Box>
            
            {/* Élément audio caché */}
            <audio
              ref={audioRef}
              src={audioInfo.url}
              onEnded={() => setIsPlaying(false)}
              style={{ display: 'none' }}
            />
          </CardContent>
        </Card>
      )}

      {/* Message d'aide */}
      {helperText && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {helperText}
        </Typography>
      )}

      {/* Erreur */}
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default AudioUpload;