import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Box, Container, Grid, Typography, Button, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { DataGrid } from '@mui/x-data-grid';
import { toast } from 'react-toastify';
import apiService from '@/services/api.service';

function SmartlinkListPage() {
  const navigate = useNavigate();
  const [smartlinks, setSmartlinks] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const fetchSmartlinks = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.smartlinks.getAll(); 
      
      // Add robust validation for API response
      if (!response || !response.data || !Array.isArray(response.data)) {
        console.warn('Invalid API response structure:', response);
        setSmartlinks([]);
        return;
      }
      
      const smartlinksWithId = response.data.map(sl => {
        // Add validation for each smartlink object
        if (!sl || typeof sl !== 'object') {
          console.warn('Invalid smartlink object:', sl);
          return null;
        }
        
        return {
          ...sl,
          id: sl._id || `temp-${Date.now()}-${Math.random()}`,
          artistName: sl.artistId?.name || 'Artiste inconnu',
          viewCount: sl.viewCount || 0,
          platformClickCount: sl.platformClickCount || 0,
        };
      }).filter(Boolean); // Remove null entries
      
      setSmartlinks(smartlinksWithId);
    } catch (err) {
      console.error("SmartlinkListPage - Failed to fetch SmartLinks:", err);
      
      // Gestion spécifique de l'erreur d'authentification
      if (err.message?.includes('401') || err.message?.includes('Non autorisé')) {
        const errorMsg = 'Authentification requise. Veuillez vous connecter en tant qu\'administrateur.';
        setError(errorMsg);
        toast.error(errorMsg);
        // Redirection vers login après un délai
        setTimeout(() => {
          window.location.href = '/#/admin/login';
        }, 2000);
      } else {
        const errorMsg = err.message || err.data?.error || 'Erreur serveur lors du chargement des SmartLinks.';
        setError(errorMsg);
        toast.error(errorMsg);
      }
      setSmartlinks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSmartlinks();
  }, [fetchSmartlinks]);

  const handleEditClick = (id) => {
    navigate(`/admin/smartlinks/edit/${id}`);
  };

  const handleCreateClick = () => {
    navigate('/admin/smartlinks/new');
  };

  const handleViewPublicLink = (artistSlug, trackSlug) => {
    if (!artistSlug || !trackSlug) {
      toast.error("Slugs manquants, impossible d'ouvrir le lien.");
      return;
    }
    const publicUrl = `/#/smartlinks/${artistSlug}/${trackSlug}`; 
    window.open(publicUrl, '_blank');
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le SmartLink "${title}" ? Cette action est irréversible.`)) {
      try {
        setLoading(true); 
        await apiService.smartlinks.deleteById(id);
        toast.success(`SmartLink "${title}" supprimé avec succès.`);
        fetchSmartlinks();
      } catch (err) {
        console.error("SmartlinkListPage - Failed to delete SmartLink:", err);
        const errorMsg = err.message || err.data?.error || 'Erreur lors de la suppression du SmartLink.';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAnalyticsClick = (id) => {
    navigate(`/admin/smartlinks/analytics/${id}`);
  };
  
  const columns = [
    {
      field: 'coverImageUrl', 
      headerName: 'Pochette', 
      width: 80,
      renderCell: (params) => params.value ? 
        (<img src={params.value} alt={params.row.trackTitle} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />) : 
        <Box sx={{width: 40, height: 40, backgroundColor: 'grey.200', borderRadius: 1}} />,
      sortable: false, 
      filterable: false,
    },
    { field: 'trackTitle', headerName: 'Titre', flex: 1, minWidth: 150 },
    { field: 'artistName', headerName: 'Artiste', flex: 0.8, minWidth: 120 },
    {
      field: 'isPublished', 
      headerName: 'Statut', 
      width: 120,
      renderCell: (params) => (
        <div style={{ 
          backgroundColor: params.value ? '#4caf50' : '#9e9e9e', 
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '0.75rem'
        }}>
          {params.value ? 'Publié' : 'Brouillon'}
        </div>
      ),
    },
    { field: 'viewCount', headerName: 'Vues', type: 'number', width: 100, align: 'center', headerAlign: 'center' },
    { field: 'platformClickCount', headerName: 'Clics', type: 'number', width: 100, align: 'center', headerAlign: 'center' },
    {
      field: 'createdAt', 
      headerName: 'Créé le', 
      width: 120,
      valueGetter: (params) => params.value && new Date(params.value),
      renderCell: (params) => params.value && new Date(params.value).toLocaleDateString('fr-FR'),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 280,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => handleViewPublicLink(params.row.artistId?.slug, params.row.slug)}
            disabled={!params.row.isPublished || !params.row.artistId?.slug || !params.row.slug}
            sx={{ minWidth: 'auto', px: 1 }}
          >
            Voir
          </Button>
          <Button 
            variant="outlined" 
            color="primary" 
            size="small" 
            onClick={() => handleEditClick(params.row.id)}
            sx={{ minWidth: 'auto', px: 1 }}
          >
            Éditer
          </Button>
          <Button 
            variant="outlined" 
            color="info" 
            size="small" 
            onClick={() => handleAnalyticsClick(params.row.id)}
            sx={{ minWidth: 'auto', px: 1 }}
          >
            Analytics
          </Button>
          <Button 
            variant="outlined" 
            color="error" 
            size="small" 
            onClick={() => handleDelete(params.row.id, params.row.trackTitle)}
            sx={{ minWidth: 'auto', px: 1 }}
          >
            Suppr.
          </Button>
        </Box>
      ),
    },
  ];

  if (loading && smartlinks.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', py: 5, minHeight: 400 }}>
        <div style={{ width: 40, height: 40, border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', animation: 'spin 2s linear infinite' }}></div>
        <Typography sx={{ mt: 2 }} variant="h6">Chargement des SmartLinks...</Typography>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex,nofollow,noarchive,nosnippet" />
        <meta name="googlebot" content="noindex,nofollow" />
        <title>Gestion SmartLinks - Admin MDMC</title>
      </Helmet>
      <Paper sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%', overflow: 'hidden', borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
      {error && !loading && (
        <div style={{ 
          backgroundColor: '#f44336', 
          color: 'white', 
          padding: '12px 16px', 
          marginBottom: '16px',
          borderRadius: '4px',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>{error}</span>
          <span style={{ cursor: 'pointer' }} onClick={() => setError(null)}>×</span>
        </div>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}> 
          Gestion des SmartLinks
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateClick}
          sx={{ 
            fontWeight: 'bold',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            '&:hover': {
              boxShadow: '0 6px 8px rgba(0,0,0,0.15)',
            }
          }}
        >
          Nouveau SmartLink
        </Button>
      </Box>
      
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={Array.isArray(smartlinks) ? smartlinks : []}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { 
              paginationModel: { 
                pageSize: 10,
                page: 0 
              } 
            },
            sorting: { sortModel: [{ field: 'createdAt', sort: 'desc' }] },
          }}
          paginationMode="client"
          density="standard"
          autoHeight={false}
          onError={(error) => {
            console.error('DataGrid error:', error);
            setError('Erreur d\'affichage des données');
          }}
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        />
      </Box>
    </Paper>
    </>
  );
}

export default SmartlinkListPage;
