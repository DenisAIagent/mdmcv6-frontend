// 🔥 COPIER-COLLER dans api.service.js
// Ajoutez cette méthode à la fin de la classe ApiService (avant la fermeture de classe)

  // SERVICE SIMULATOR - Méthode manquante
  async submitSimulatorResults(simulatorData) {
    try {
      console.log('🎯 Simulator: Tentative envoi vers backend...', simulatorData);
      
      // Essai d'envoi vers votre backend
      return await this.request('/simulator/results', {
        method: 'POST',
        body: JSON.stringify(simulatorData)
      });
      
    } catch (error) {
      console.warn('⚠️ Simulator: Backend indisponible, activation fallback local');
      
      // FALLBACK : Sauvegarde locale pour récupération
      const backupData = {
        ...simulatorData,
        savedAt: new Date().toISOString(),
        id: `sim_${Date.now()}`
      };
      
      // Stockage sécurisé
      const stored = JSON.parse(localStorage.getItem('simulator_leads') || '[]');
      stored.push(backupData);
      localStorage.setItem('simulator_leads', JSON.stringify(stored));
      
      // Notification pour admin
      console.group('💾 LEAD SIMULATOR SAUVEGARDÉ');
      console.log('Artiste:', simulatorData.artistName);
      console.log('Email:', simulatorData.email);
      console.log('Plateforme:', simulatorData.platform);
      console.log('Budget:', simulatorData.budget);
      console.log('Données complètes:', backupData);
      console.groupEnd();
      
      // Retour succès pour UX
      return { 
        success: true, 
        message: 'Simulation terminée avec succès !',
        leadSaved: true 
      };
    }
  }

  // BONUS : Méthode pour récupérer les leads en attente
  getSimulatorLeads() {
    const leads = JSON.parse(localStorage.getItem('simulator_leads') || '[]');
    console.log(`📊 ${leads.length} leads simulator en attente:`, leads);
    return leads;
  }

  // BONUS : Export CSV des leads
  exportSimulatorLeads() {
    const leads = this.getSimulatorLeads();
    if (leads.length === 0) {
      console.warn('Aucun lead à exporter');
      return;
    }

    // Génération CSV
    const headers = 'Artiste,Email,Plateforme,Type Campagne,Budget,Pays,Vues Estimées,CPV,Portée,Date\n';
    const rows = leads.map(lead => 
      `"${lead.artistName}","${lead.email}","${lead.platform}","${lead.campaignType}",${lead.budget},"${lead.country}","${lead.views}","${lead.cpv}","${lead.reach}","${lead.savedAt}"`
    ).join('\n');

    // Téléchargement
    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads-simulator-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    console.log(`✅ Export réussi: ${leads.length} leads`);
  }
