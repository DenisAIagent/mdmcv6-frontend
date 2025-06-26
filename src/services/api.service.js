// 🎯 AJOUT dans api.service.js - Dans la classe ApiService, ajoutez cette méthode :

async submitSimulatorResults(simulatorData) {
  try {
    console.log('🎯 Simulator: Tentative envoi API...', simulatorData);
    
    // Tentative d'envoi vers votre backend
    return await this.request('/simulator/results', {
      method: 'POST',
      body: JSON.stringify(simulatorData)
    });
    
  } catch (error) {
    console.warn('⚠️ Simulator: API indisponible, mode fallback activé');
    
    // FALLBACK : Sauvegarde locale + notification console
    const backupData = {
      ...simulatorData,
      timestamp: new Date().toISOString(),
      id: Date.now()
    };
    
    // Sauvegarde dans localStorage
    const existingData = JSON.parse(localStorage.getItem('simulator_results') || '[]');
    existingData.push(backupData);
    localStorage.setItem('simulator_results', JSON.stringify(existingData));
    
    // Log pour récupération manuelle
    console.log('💾 DONNÉES SIMULATOR SAUVEGARDÉES:', backupData);
    console.log('📋 Pour récupérer toutes les données:', 'JSON.parse(localStorage.getItem("simulator_results"))');
    
    // Simulation de succès pour l'utilisateur
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulation délai
    
    return { 
      success: true, 
      message: 'Résultats enregistrés avec succès !',
      fallback: true 
    };
  }
}

// 🔧 BONUS : Méthodes utilitaires pour récupérer les données

// Récupération des données stockées
async getStoredSimulatorResults() {
  const data = JSON.parse(localStorage.getItem('simulator_results') || '[]');
  console.log('📊 Résultats simulator stockés:', data);
  return data;
}

// Export CSV des données
exportSimulatorResults() {
  const data = JSON.parse(localStorage.getItem('simulator_results') || '[]');
  
  if (data.length === 0) {
    console.warn('Aucune donnée à exporter');
    return;
  }
  
  const csvContent = this.convertToCSV(data);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `simulator-results-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  
  console.log(`📤 Export CSV généré: ${data.length} entrées`);
}

// Conversion en CSV
convertToCSV(data) {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(item => 
    Object.values(item).map(value => {
      // Échapper les guillemets et virgules
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',')
  );
  
  return [headers, ...rows].join('\n');
}

// Nettoyage des données après traitement
clearStoredSimulatorResults() {
  localStorage.removeItem('simulator_results');
  console.log('🧹 Données simulator nettoyées');
}
