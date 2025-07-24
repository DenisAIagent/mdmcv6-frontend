# FlowForge v2.1 - Plateforme d'Automatisation Avancée avec Pipedream

FlowForge est une plateforme complète de gestion de workflows d'automatisation alimentée par l'écosystème **Pipedream open source**, offrant l'accès à plus de **1000 composants d'intégration** avec interface chat intelligente, gestion multi-utilisateurs, webhooks directs et système de branches complexes.

## 🆕 Nouvelles Fonctionnalités v2.1

### ⚡ **Intégration Pipedream Open Source**
- **1000+ composants** d'automatisation pré-construits et testés
- **Exécution hybride** : Composants natifs FlowForge + Pipedream dans le même workflow
- **Registre automatique** : Chargement dynamique des composants depuis GitHub
- **Support multi-langages** : Node.js, Python, Go, Bash

### 🎯 **Webhooks Directs**
- **Endpoints personnalisés** (`/webhook/music-simulator-lead`)
- **Support multi-méthodes** (GET/POST/PUT) avec authentification optionnelle
- **Intégration native** avec les workflows
- **Gestion centralisée** via interface admin

### 🔀 **Workflows Complexes avec Branches**
- **Switch nodes** : Routage conditionnel sur valeurs multiples
- **Condition nodes** : Logique booléenne avancée
- **Merge nodes** : Reconsolidation des flux parallèles
- **Code nodes** : JavaScript sécurisé pour logique métier personnalisée
- **Pipedream nodes** : Exécution de composants Pipedream avec paramètres dynamiques

### 📧 **Templates d'Emails Avancés**
- **Templates HTML** avec variables dynamiques (`{{ artist_name }}`)
- **Bibliothèque pré-configurée** pour différents cas d'usage
- **Support multi-priorités** (urgent/high/medium/low)
- **Rendu en temps réel** avec substitution de variables

### 💬 **Interface Chat Intelligente (Existant)**
- **Conversation naturelle** avec l'IA pour créer des workflows
- **Questions de clarification** automatiques
- **Génération de workflows** directement depuis le chat
- **Historique personnalisé** par utilisateur

### 👥 **Gestion Multi-Utilisateurs (Existant)**
- **Authentification sécurisée** avec sessions JWT
- **Rôles et permissions** (Admin, User, Viewer)
- **Isolation complète** des données par utilisateur
- **Interface d'administration** complète

### 🔗 **Espace d'Intégrations (Existant)**
- **Configuration centralisée** des services externes
- **Chiffrement AES-256-GCM** des credentials
- **Tests de connexion** automatiques
- **Support étendu** : Claude, Google, Brevo, Discord, Slack, GitHub

## 🎵 Exemple Concret : Workflow MDMC Music Ads

FlowForge v2.1 peut maintenant reproduire des automatisations complexes comme le système de lead scoring MDMC :

```
Webhook (/webhook/music-simulator-lead)
  ↓
Calcul Score (Budget + Plateforme)
  ↓
Switch Plateforme (Meta/TikTok/YouTube/Spotify)
  ↓
Switch Priorité (Critical/High/Medium/Low)
  ↓
Emails Experts (Templates personnalisés)
  ↓
Merge + Newsletter Brevo
```

## 🏗️ Architecture Technique

```
flowforge/
├── src/
│   ├── index.js                 # API principale avec routes Pipedream
│   ├── auth.js                  # Gestion utilisateurs et sessions
│   ├── chat.js                  # Assistant IA conversationnel
│   ├── webhooks.js              # 🆕 Gestionnaire de webhooks directs
│   ├── workflow-engine.js       # 🆕 Moteur d'exécution avec support Pipedream
│   ├── pipedream-adapter.js     # 🆕 Adaptateur composants Pipedream
│   ├── email-templates.js       # 🆕 Gestionnaire de templates
│   ├── integrations.js          # 🆕 Gestion hybride native + Pipedream
│   ├── component-runner.js      # Exécuteur de workflows (legacy)
│   ├── scheduler.js             # Planificateur automatique
│   ├── config.js                # Configuration système + clé Pipedream
│   ├── crypto.js                # Chiffrement sécurisé
│   ├── db/
│   │   ├── schema.sql           # 🆕 Schéma étendu multi-utilisateurs
│   │   └── pool.js              # Connexion PostgreSQL
│   └── utils/
│       ├── logger.js            # Logging structuré
│       └── alert.js             # Système d'alertes
├── public/
│   ├── index.html               # 🆕 Interface avec sélecteur Pipedream
│   └── app.js                   # 🆕 Logique frontend complète
├── examples/
│   └── mdmc-workflow.json       # 🆕 Exemple workflow complet MDMC
├── package.json                 # 🆕 Dépendances + @pipedream/sdk
├── Dockerfile                   # Configuration Docker
├── docker-compose.yml           # Orchestration avec PostgreSQL
└── generate-key.js              # Utilitaire de génération de clés
```

## 🚀 Installation et Configuration

### Prérequis
- Node.js 18+
- PostgreSQL 12+
- Docker (optionnel)

### Installation Rapide

1. **Cloner et installer**
```bash
git clone https://github.com/DenisAIagent/flowforge.git
cd flowforge
npm install
```

2. **Générer une clé de chiffrement**
```bash
node generate-key.js
```

3. **Configurer l'environnement**
```bash
# Créer le fichier .env avec vos configurations
DATABASE_URL=postgresql://user:password@localhost:5432/flowforge
ENCRYPTION_KEY=<32_byte_base64_key>
CLAUDE_API_KEY=<your_claude_api_key>
PIPEDREAM_API_KEY=<your_pipedream_api_key>  # 🆕 Optionnel pour fonctionnalités avancées
PORT=3000
NODE_ENV=production
```

4. **Initialiser la base de données**
```bash
createdb flowforge
psql -d flowforge -f src/db/schema.sql
```

5. **Démarrer l'application**
```bash
npm start
```

### Configuration avec Docker

```bash
# Avec docker-compose (recommandé)
docker-compose up -d

# Ou construction manuelle
docker build -t flowforge .
docker run -p 3000:3000 flowforge
```

## 🎯 API REST Complète

### Authentification
```bash
POST /v1/auth/register      # Inscription
POST /v1/auth/login         # Connexion
GET  /v1/auth/validate      # Validation session
POST /v1/auth/logout        # Déconnexion
```

### 🆕 Webhooks
```bash
POST   /v1/webhooks         # Créer webhook
GET    /v1/webhooks         # Lister webhooks
DELETE /v1/webhooks/:id     # Supprimer webhook
ALL    /webhook/*           # Endpoints dynamiques
```

### ⚡ Composants Pipedream
```bash
GET    /v1/integrations/available       # Lister toutes intégrations (natives + Pipedream)
GET    /v1/pipedream/components/:name   # Détails d'un composant Pipedream
POST   /v1/pipedream/components/:name/execute  # Exécuter composant Pipedream
```

### 🆕 Templates Email
```bash
POST   /v1/email-templates           # Créer template
GET    /v1/email-templates           # Lister templates
GET    /v1/email-templates/:id       # Détails template
PATCH  /v1/email-templates/:id       # Modifier template
DELETE /v1/email-templates/:id       # Supprimer template
POST   /v1/email-templates/init-defaults  # Init templates MDMC
```

### Chat IA
```bash
POST /v1/chat/start                    # Nouvelle conversation
GET  /v1/chat/:sessionId/messages      # Historique messages
POST /v1/chat/:sessionId/message       # Envoyer message
GET  /v1/chat/conversations            # Lister conversations
```

### Workflows
```bash
GET    /v1/workflows                   # Lister workflows
GET    /v1/workflows/:id               # Détails workflow
PATCH  /v1/workflows/:id               # Modifier workflow
DELETE /v1/workflows/:id               # Supprimer workflow
POST   /v1/workflows/create-from-prompt  # Création legacy
```

### Intégrations
```bash
GET    /v1/integrations           # Lister intégrations
POST   /v1/integrations           # Créer intégration
POST   /v1/integrations/:id/test  # Tester connexion
DELETE /v1/integrations/:id       # Supprimer intégration
```

### Administration
```bash
GET   /v1/admin/users             # Lister utilisateurs
PATCH /v1/admin/users/:id         # Modifier utilisateur
GET   /v1/admin/stats             # Statistiques système
```

## 🔧 Utilisation

### 1. Première Connexion
- Accédez à `http://localhost:3000`
- Créez un compte administrateur
- Configurez vos intégrations

### 2. Création de Webhooks
1. Allez dans l'onglet "🎯 Webhooks"
2. Sélectionnez un workflow existant
3. Configurez l'endpoint (ex: `/webhook/music-simulator-lead`)
4. Copiez l'URL générée pour vos formulaires

### 3. Templates d'Emails
1. Allez dans "📧 Templates Email" 
2. Utilisez "Initialiser templates MDMC" pour les modèles pré-configurés
3. Créez vos propres templates avec variables `{{ nom_variable }}`

### 4. Workflows Complexes via Chat
1. Ouvrez l'Assistant IA
2. Décrivez votre automation complexe
3. L'IA générera un workflow avec branches si nécessaire

## 🔒 Sécurité

### Chiffrement
- **AES-256-GCM** pour tous les credentials
- **Clés uniques** par installation  
- **Hachage PBKDF2** pour les mots de passe
- **Variables d'environnement** pour secrets

### Authentification & Autorisation
- **Sessions JWT** sécurisées avec expiration
- **Isolation complète** des données par utilisateur
- **Contrôle d'accès** granulaire par ressource
- **Nettoyage automatique** des sessions expirées

## 📊 Cas d'Usage Supportés

| Type | Exemple | Complexité |
|------|---------|------------|
| **Simple** | Notification Discord | ⭐ |
| **Conditionnel** | Email selon critères | ⭐⭐ |
| **Multi-branches** | Lead scoring MDMC | ⭐⭐⭐ |
| **Workflows visuels** | Drag & drop (roadmap) | ⭐⭐⭐⭐ |

## 🎯 Services Supportés

### Services Natifs FlowForge
| Service | Type | Fonctionnalités | Status |
|---------|------|----------------|---------|
| **Claude** | IA | Chat conversationnel, génération | ✅ |
| **Google** | Productivité | Sheets, Gmail, Drive | ✅ |
| **Brevo** | Email | Campagnes, contacts, automation | ✅ |
| **Discord** | Communication | Messages, webhooks, bots | ✅ |
| **Slack** | Communication | Messages, notifications | ✅ |
| **GitHub** | Développement | Issues, repositories, actions | ✅ |

### ⚡ Composants Pipedream (1000+)
| Catégorie | Exemples | Quantité |
|-----------|----------|----------|
| **Communication** | Slack, Discord, Telegram, WhatsApp | 200+ |
| **Email & Marketing** | Gmail, Outlook, Mailgun, SendGrid | 150+ |
| **Productivité** | Google Sheets, Notion, Airtable, Trello | 180+ |
| **Réseaux Sociaux** | Twitter, Facebook, Instagram, LinkedIn | 120+ |
| **Stockage** | Google Drive, Dropbox, AWS S3, OneDrive | 80+ |
| **E-commerce** | Shopify, WooCommerce, Stripe, PayPal | 100+ |
| **Développement** | GitHub, GitLab, Jenkins, Docker | 90+ |
| **Autres** | RSS, HTTP, Webhooks, Bases de données | 80+ |

## 🚧 Roadmap v2.2

### Fonctionnalités Prévues
- **Éditeur visuel** drag & drop pour workflows
- **Triggers avancés** (fichiers, calendrier, conditions complexes)
- **Intégrations supplémentaires** (Notion, Airtable, Zapier)
- **API publique** pour développeurs tiers
- **Marketplace** de workflows communautaires

### Améliorations Techniques
- **Tests automatisés** complets
- **Performance** optimisée avec cache Redis
- **Scalabilité** horizontale avec clustering
- **Monitoring** avancé avec métriques détaillées

---

**FlowForge v2.1** - L'automatisation professionnelle sans limites

Développé avec une approche centrée sur la sécurité, la performance et l'expérience utilisateur. Capable de reproduire les automatisations les plus complexes de n8n avec une interface plus simple et une architecture multi-utilisateurs sécurisée.

🚀 **Prêt pour la production** | 🎯 **Compatible n8n workflows** | 🔒 **Enterprise ready**