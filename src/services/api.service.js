// SERVICE MUSIC PLATFORM - Section existante
  musicPlatform = {
    fetchLinksFromSourceUrl: async (sourceUrl) => {
      console.log('🎵 MusicPlatform: Récupération liens...', sourceUrl);
      return await this.request('/music-platform/fetch-links', {
        method: 'POST',
        body: JSON.stringify({ sourceUrl })
      });
    }
  };

  // SERVICE SIMULATOR - Nouvelle section
  async submitSimulatorResults(simulatorData) {
    try {
      console.log('🎯 Simulator: Tentative envoi...', simulatorData);
      return await this.request('/simulator/results', {
        method: 'POST',
        body: JSON.stringify(simulatorData)
      });
    } catch (error) {
      console.warn('⚠️ Simulator: Fallback local activé');
      
      const backup = {
        ...simulatorData,
        saved: new Date().toISOString(),
        id: Date.now()
      };
      
      const stored = JSON.parse(localStorage.getItem('simulator_leads') || '[]');
      stored.push(backup);
      localStorage.setItem('simulator_leads', JSON.stringify(stored));
      
      console.log('💾 Lead sauvegardé:', backup);
      
      return { success: true, message: 'Résultats sauvegardés !', fallback: true };
    }
  }

  getSimulatorLeads() {
    return JSON.parse(localStorage.getItem('simulator_leads') || '[]');
  }

  exportSimulatorLeads() {
    const leads = this.getSimulatorLeads();
    if (!leads.length) return console.warn('Aucun lead');
    
    const csv = 'Artiste,Email,Plateforme,Budget,Date\n' + 
      leads.map(l => `"${l.artistName}","${l.email}","${l.platform}",${l.budget},"${l.saved}"`).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulator-leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

}
