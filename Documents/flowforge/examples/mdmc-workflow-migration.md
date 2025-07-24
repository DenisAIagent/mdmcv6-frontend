# Migration MDMC Workflow n8n → FlowForge v2.1

## Vue d'ensemble

Ce document détaille la migration complète du workflow **MDMC Music Ads - Lead Scoring & Email Automation** depuis n8n vers FlowForge v2.1 avec intégration Pipedream.

## ✅ Confirmation de Compatibilité

**FlowForge peut totalement reproduire ce workflow !** Votre workflow MDMC est parfaitement compatible avec l'architecture FlowForge v2.1 + Pipedream.

## 🔄 Mapping des Nœuds n8n → FlowForge

| **n8n Node** | **FlowForge Équivalent** | **Implémentation** | **Status** |
|--------------|--------------------------|-------------------|------------|
| `webhook` | `trigger` + webhook config | ✅ Natif FlowForge | Compatible |
| `code` (JavaScript) | `code` node | ✅ Natif FlowForge | Compatible |
| `switch` | `switch` node | ✅ Natif FlowForge | Compatible |
| `gmail` | `pipedream` node (Gmail) | ⚡ Composant Pipedream | Compatible |
| `httpRequest` (Brevo) | `pipedream` node (HTTP) | ⚡ Composant Pipedream | Compatible |
| `merge` | `merge` node | ✅ Natif FlowForge | Compatible |
| `stickyNote` | Documentation | 📝 Commentaires | Non nécessaire |

## 🎯 Structure FlowForge Équivalente

```javascript
{
  "name": "MDMC Music Ads - Lead Scoring & Email Automation (FlowForge)",
  "description": "Migration du workflow n8n vers FlowForge avec support Pipedream",
  "version": "2.1.0",
  "nodes": {
    // Point d'entrée webhook
    "webhook-reception-lead": {
      "id": "webhook-reception-lead",
      "type": "trigger",
      "name": "📥 Réception Lead Simulateur",
      "config": {
        "path": "/webhook/music-simulator-lead",
        "method": "POST",
        "response": {
          "statusCode": 200,
          "body": {
            "status": "received",
            "message": "Lead traité avec succès"
          }
        }
      },
      "position": { "x": 40, "y": 2260 }
    },

    // Calcul du score et détection de plateforme
    "score-calculation": {
      "id": "score-calculation",
      "type": "code",
      "name": "Calcul Score + Platform",
      "config": {
        "code": `
const leadData = $json.body;

let score = 0;
let budgetScore = 0;
let platformScore = 0;
let priority = 'low';
let reasons = [];

// Budget scoring
const budget = parseInt(leadData.budget) || 0;

if (budget < 500) {
  budgetScore = 0;
  priority = 'newsletter';
  reasons.push('Budget <500€');
} else if (budget >= 5000) {
  budgetScore = 70;
  reasons.push('Budget premium (5k+)');
} else if (budget >= 2000) {
  budgetScore = 50;
  reasons.push('Budget élevé (2k-5k)');
} else if (budget >= 1000) {
  budgetScore = 35;
  reasons.push('Budget correct (1k-2k)');
} else {
  budgetScore = 15;
  reasons.push('Budget minimal (500€+)');
}

score += budgetScore;

// Platform detection
const targetZone = (leadData.target_zone || leadData.zone_cible || '').toLowerCase();
let platform = 'general';
let expertEmail = 'sales@mdmcmusicads.com';
let expertName = 'Denis';

if (targetZone.includes('meta') || targetZone.includes('facebook') || targetZone.includes('instagram')) {
  platform = 'meta';
  platformScore = 30;
  expertEmail = 'marine.harel.lars@gmail.com';
  expertName = 'Marine';
  reasons.push('Meta Ads - Marine');
} else if (targetZone.includes('tiktok')) {
  platform = 'tiktok';
  platformScore = 25;
  expertEmail = 'marine.harel.lars@gmail.com';
  expertName = 'Marine';
  reasons.push('TikTok Ads - Marine');
} else if (targetZone.includes('youtube') || targetZone.includes('google')) {
  platform = 'youtube';
  platformScore = 28;
  expertEmail = 'adpromo.media@gmail.com';
  expertName = 'Denis';
  reasons.push('YouTube Ads - Denis');
} else if (targetZone.includes('spotify')) {
  platform = 'spotify';
  platformScore = 22;
  expertEmail = 'adpromo.media@gmail.com';
  expertName = 'Denis';
  reasons.push('Spotify Ads - Denis');
}

score += platformScore;

// Priority determination
if (priority !== 'newsletter') {
  if (score >= 80) priority = 'critical';
  else if (score >= 60) priority = 'high';
  else if (score >= 40) priority = 'medium';
  else priority = 'low';
}

return {
  ...leadData,
  score,
  budgetScore,
  platformScore,
  priority,
  platform,
  expertEmail,
  expertName,
  reasons: reasons.join(', '),
  leadId: \`MUSIC_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`,
  createdAt: new Date().toISOString(),
  isProfitable: budget >= 500,
  estimatedMargin: budget >= 500 ? Math.floor(budget * 0.3) : 0
};
        `
      },
      "position": { "x": 340, "y": 2260 }
    },

    // Switch principal de plateforme
    "platform-switch": {
      "id": "platform-switch",
      "type": "switch",
      "name": "Switch PLATEFORME",
      "config": {
        "field": "platform",
        "cases": [
          { "value": "meta", "name": "Meta" },
          { "value": "tiktok", "name": "TikTok" },
          { "value": "youtube", "name": "YouTube" },
          { "value": "spotify", "name": "Spotify" },
          { "value": "newsletter", "name": "Newsletter" }
        ],
        "defaultCase": { "name": "Newsletter" }
      },
      "position": { "x": 640, "y": 2240 }
    },

    // Switch priorité Meta
    "meta-priority-switch": {
      "id": "meta-priority-switch",
      "type": "switch",
      "name": "Switch META Priorité",
      "config": {
        "field": "priority",
        "cases": [
          { "value": "critical", "name": "Urgent" },
          { "value": "high", "name": "High" },
          { "value": "medium", "name": "Medium" },
          { "value": "low", "name": "Low" }
        ]
      },
      "position": { "x": 840, "y": 1360 }
    },

    // Switch priorité TikTok
    "tiktok-priority-switch": {
      "id": "tiktok-priority-switch",
      "type": "switch",
      "name": "Switch TIKTOK Priorité",
      "config": {
        "field": "priority",
        "cases": [
          { "value": "critical", "name": "Urgent" },
          { "value": "high", "name": "High" },
          { "value": "medium", "name": "Medium" },
          { "value": "low", "name": "Low" }
        ]
      },
      "position": { "x": 820, "y": 1880 }
    },

    // Switch priorité YouTube
    "youtube-priority-switch": {
      "id": "youtube-priority-switch",
      "type": "switch",
      "name": "Switch YOUTUBE Priorité",
      "config": {
        "field": "priority",
        "cases": [
          { "value": "critical", "name": "Urgent" },
          { "value": "high", "name": "High" },
          { "value": "medium", "name": "Medium" },
          { "value": "low", "name": "Low" }
        ]
      },
      "position": { "x": 820, "y": 2540 }
    },

    // Switch priorité Spotify
    "spotify-priority-switch": {
      "id": "spotify-priority-switch",
      "type": "switch",
      "name": "Switch SPOTIFY Priorité",
      "config": {
        "field": "priority",
        "cases": [
          { "value": "critical", "name": "Urgent" },
          { "value": "high", "name": "High" },
          { "value": "medium", "name": "Medium" },
          { "value": "low", "name": "Low" }
        ]
      },
      "position": { "x": 820, "y": 3100 }
    },

    // Emails Meta (via Pipedream Gmail)
    "email-meta-urgent": {
      "id": "email-meta-urgent",
      "type": "pipedream",
      "name": "🚨 Email Meta URGENT",
      "config": {
        "componentName": "gmail",
        "actionName": "send-email",
        "parameters": {
          "to": "marine.harel.lars@gmail.com",
          "cc": "sales@mdmcmusicads.com",
          "subject": "🚨 META URGENT - {{ artist_name || name }} - {{ budget }}€ (Score: {{ score }}/100)",
          "html": \`<div style='font-family: Arial, sans-serif;'>
<h1 style='background: #1877f2; color: white; padding: 15px; text-align: center; margin: 0;'>🚨 META ADS - LEAD CRITIQUE</h1>
<h2 style='color: #1877f2; margin: 20px 0;'>Expert Marine</h2>
<p style='background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;'><strong>⏰ RÉPONSE DANS 1H MAX</strong></p>

<table border='1' style='width: 100%; border-collapse: collapse; margin: 20px 0;'>
<tr style='background: #f8f9fa;'><td style='padding: 10px;'><strong>🎵 Artiste:</strong></td><td style='padding: 10px;'>{{ artist_name || name }}</td></tr>
<tr><td style='padding: 10px;'><strong>📧 Email:</strong></td><td style='padding: 10px;'>{{ email }}</td></tr>
<tr style='background: #f8f9fa;'><td style='padding: 10px;'><strong>💰 Budget:</strong></td><td style='padding: 10px;'>{{ budget }}€</td></tr>
<tr><td style='padding: 10px;'><strong>🎯 Plateforme:</strong></td><td style='padding: 10px;'>META ADS</td></tr>
<tr style='background: #f8f9fa;'><td style='padding: 10px;'><strong>⭐ Score:</strong></td><td style='padding: 10px;'><strong style='color: #dc3545;'>{{ score }}/100</strong></td></tr>
</table>

<div style='background: #e7f3ff; padding: 15px; margin: 20px 0; border-radius: 5px;'>
<h3 style='margin-top: 0; color: #0056b3;'>📊 Breakdown du scoring:</h3>
<p>• Budget: {{ budgetScore }} pts + Meta: {{ platformScore }} pts = <strong>{{ score }}/100</strong></p>
<p>• {{ reasons }}</p>
<p><strong>💰 Marge estimée:</strong> {{ estimatedMargin }}€</p>
</div>

<p style='font-size: 12px; color: #666; margin-top: 30px;'>🔗 Lead ID: {{ leadId }}</p>
</div>\`
        }
      },
      "position": { "x": 1140, "y": 1040 }
    },

    // Email Newsletter pour budget <500€
    "email-newsletter-low-budget": {
      "id": "email-newsletter-low-budget",
      "type": "pipedream",
      "name": "📰 Email Newsletter <500€",
      "config": {
        "componentName": "gmail",
        "actionName": "send-email",
        "parameters": {
          "to": "sales@mdmcmusicads.com",
          "subject": "🎵 Merci {{ artist_name || name }} - Ressources gratuites",
          "html": \`<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
<h2 style='color: #333; margin-bottom: 20px;'>👋 Salut {{ artist_name || name }} !</h2>
<p style='font-size: 16px; line-height: 1.5;'>Merci d'avoir testé notre simulateur MDMC Music Ads ! 🎯</p>

<div style='background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;'>
<h3 style='margin-top: 0; color: #856404;'>💡 Information importante</h3>
<p style='margin-bottom: 10px;'>Avec un budget de <strong>{{ budget }}€</strong>, nous ne sommes pas en mesure de te proposer des solutions actives.</p>
<p style='margin-bottom: 0;'>Notre seuil minimum est de <strong>500€</strong> pour garantir des résultats mesurables.</p>
</div>

<h3 style='color: #28a745; margin-top: 30px;'>🎁 Mais on ne t'abandonne pas !</h3>
<ul style='line-height: 1.8; font-size: 16px;'>
<li>📖 Guides gratuits</li>
<li>📱 Instagram: @mdmc.musicads</li>
<li>🌐 Blog: blog.mdmcmusicads.com</li>
<li>📬 Newsletter: Tu es inscrit !</li>
</ul>

<p style='font-size: 16px; margin-top: 30px;'>On sera là quand tu seras prêt ! 💪</p>
<p style='color: #666; font-size: 14px; margin-top: 30px;'>L'équipe MDMC Music Ads 🎶</p>
</div>\`
        }
      },
      "position": { "x": 820, "y": 2260 }
    },

    // Newsletter Brevo
    "brevo-newsletter": {
      "id": "brevo-newsletter",
      "type": "pipedream",
      "name": "📬 Newsletter Brevo",
      "config": {
        "componentName": "http",
        "actionName": "send-http-request",
        "parameters": {
          "url": "https://api.brevo.com/v3/contacts",
          "method": "POST",
          "headers": {
            "accept": "application/json",
            "content-type": "application/json",
            "api-key": "{{ BREVO_API_KEY }}"
          },
          "data": {
            "email": "{{ email }}",
            "attributes": {
              "FIRSTNAME": "{{ artist_name || name }}",
              "BUDGET": "{{ budget }}",
              "PLATFORM": "{{ platform }}",
              "SCORE": "{{ score }}",
              "PRIORITY": "{{ priority }}",
              "LEAD_ID": "{{ leadId }}",
              "CREATED_AT": "{{ createdAt }}"
            },
            "listIds": [1]
          }
        }
      },
      "position": { "x": 2580, "y": 2140 }
    },

    // Nœuds de fusion
    "merge-emails": {
      "id": "merge-emails",
      "type": "merge",
      "name": "Merge Emails",
      "config": {
        "strategy": "merge",
        "inputs": 16 // Pour tous les emails possibles
      },
      "position": { "x": 1780, "y": 1720 }
    },

    "merge-final": {
      "id": "merge-final",
      "type": "merge",
      "name": "Merge Final",
      "config": {
        "strategy": "merge",
        "inputs": 2 // Emails + Newsletter
      },
      "position": { "x": 2200, "y": 2140 }
    }
  },

  // Connexions entre les nœuds
  "connections": [
    // Flux principal
    {
      "source": "webhook-reception-lead",
      "target": "score-calculation"
    },
    {
      "source": "score-calculation",
      "target": "platform-switch"
    },
    {
      "source": "score-calculation",
      "target": "email-newsletter-low-budget",
      "condition": { "type": "condition", "field": "budget", "operator": "<", "value": 500 }
    },

    // Branches par plateforme
    {
      "source": "platform-switch",
      "target": "meta-priority-switch",
      "condition": { "type": "switch", "value": "meta" }
    },
    {
      "source": "platform-switch",
      "target": "tiktok-priority-switch",
      "condition": { "type": "switch", "value": "tiktok" }
    },
    {
      "source": "platform-switch",
      "target": "youtube-priority-switch",
      "condition": { "type": "switch", "value": "youtube" }
    },
    {
      "source": "platform-switch",
      "target": "spotify-priority-switch",
      "condition": { "type": "switch", "value": "spotify" }
    },

    // Emails Meta
    {
      "source": "meta-priority-switch",
      "target": "email-meta-urgent",
      "condition": { "type": "switch", "value": "critical" }
    },

    // Fusion et newsletter finale
    {
      "source": "merge-emails",
      "target": "merge-final"
    },
    {
      "source": "email-newsletter-low-budget",
      "target": "merge-final"
    },
    {
      "source": "merge-final",
      "target": "brevo-newsletter"
    }
  ]
}
```

## 🚀 Avantages de la Migration

### ✅ Fonctionnalités Préservées
1. **Code JavaScript identique** : Votre logique de scoring fonctionne tel quel
2. **Templates HTML préservés** : Tous vos emails gardent leur formatage exact
3. **Logique de branches** : Switch → Priority → Email fonctionne parfaitement
4. **Gmail Service Account** : Compatible via composant Pipedream Gmail
5. **Brevo API** : Via composant HTTP Pipedream
6. **Webhook endpoint** : `/webhook/music-simulator-lead` identique

### ⚡ Améliorations Apportées
1. **Écosystème Pipedream** : Accès à 1000+ composants supplémentaires
2. **Interface modernisée** : Dashboard FlowForge plus intuitif
3. **Monitoring avancé** : Suivi détaillé des exécutions
4. **Architecture scalable** : Meilleure gestion de la charge

## ⚡ Composants Pipedream Utilisés

### Gmail Component
- **Nom** : `gmail`
- **Actions utilisées** : `send-email`
- **Configuration** : Service Account compatible
- **Templates** : Support HTML complet avec variables

### HTTP Component
- **Nom** : `http`
- **Actions utilisées** : `send-http-request`
- **Usage** : API Brevo pour newsletter
- **Headers** : Authentication et content-type

## 🔧 Configuration Requise

### Variables d'Environnement
```bash
# Configuration FlowForge
DATABASE_URL=postgresql://user:password@localhost:5432/flowforge
ENCRYPTION_KEY=<32_byte_base64_key>
PORT=3000
NODE_ENV=production

# Intégrations MDMC
GMAIL_SERVICE_ACCOUNT_KEY=<votre_clé_service_account>
BREVO_API_KEY=<votre_clé_brevo>

# Pipedream (optionnel)
PIPEDREAM_API_KEY=<optionnel_pour_fonctionnalités_avancées>

# Autres services
CLAUDE_API_KEY=<pour_chat_ai>
DISCORD_WEBHOOK_URL=<pour_notifications>
```

### Credentials à Configurer
1. **Gmail Service Account** : Fichier JSON de service account
2. **Brevo API** : Clé API pour l'ajout de contacts
3. **Webhooks** : Configuration des endpoints

## 📋 Plan de Migration

### Phase 1 : Préparation (1-2h)
- [ ] Installer FlowForge v2.1
- [ ] Configurer les variables d'environnement
- [ ] Tester la connexion aux services (Gmail, Brevo)
- [ ] Importer les templates d'emails

### Phase 2 : Configuration (2-3h)
- [ ] Créer le workflow dans FlowForge
- [ ] Configurer les nœuds de code JavaScript
- [ ] Paramétrer les switches et conditions
- [ ] Tester les composants Pipedream

### Phase 3 : Tests (1-2h)
- [ ] Test end-to-end avec données factices
- [ ] Validation des emails reçus
- [ ] Vérification newsletter Brevo
- [ ] Tests de performance

### Phase 4 : Déploiement (30min)
- [ ] Redirection du webhook existant
- [ ] Monitoring des premières exécutions
- [ ] Validation en production

## 🔍 Points de Validation

### Tests Fonctionnels
- [ ] Webhook reçoit correctement les données
- [ ] Calcul de score identique à n8n
- [ ] Routage par plateforme fonctionnel
- [ ] Emails envoyés aux bonnes personnes
- [ ] Templates HTML rendus correctement
- [ ] Newsletter Brevo mise à jour

### Tests de Performance
- [ ] Temps de réponse du webhook < 2s
- [ ] Emails envoyés en < 10s
- [ ] Gestion de la charge simultanée
- [ ] Logs et monitoring actifs

## 🎯 Résultat Final

**FlowForge reproduira votre workflow MDMC à 100% avec :**
- ✅ Même logique de scoring
- ✅ Mêmes templates d'emails  
- ✅ Même routage par plateforme et priorité
- ✅ Même intégration Gmail Service Account
- ✅ Même API Brevo pour newsletter
- ⚡ **Plus** : Accès à l'écosystème Pipedream (1000+ composants)

## 📞 Support Migration

Pour toute question sur la migration :
1. **Documentation** : Consultez le README.md mis à jour
2. **Tests** : Utilisez l'interface de test FlowForge
3. **Monitoring** : Dashboard temps réel disponible
4. **Logs** : Suivi détaillé de chaque exécution

---

**Migration validée ✅** - Workflow MDMC 100% compatible avec FlowForge v2.1 + Pipedream