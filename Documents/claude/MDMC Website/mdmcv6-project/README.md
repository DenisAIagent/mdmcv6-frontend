# SmartLink Music System

Système de SmartLink musical professionnel avec intégration Odesli et tracking analytics complet (GTM, GA4, Google Ads).

**🧹 Environnement nettoyé - Version unifiée - 27 juillet 2025**

## 🚀 Fonctionnalités

- **Scan automatique** de toutes les plateformes musicales via Odesli
- **Landing pages dynamiques** avec détection intelligente de plateforme
- **Analytics avancés** avec GTM, GA4 et Google Ads conversion tracking
- **Dashboard complet** pour gérer vos SmartLinks
- **Branding personnalisé** pour chaque artiste/label
- **API RESTful** pour intégrations tierces
- **Responsive design** optimisé mobile

## 🛠 Installation

### Prérequis
- Node.js 16+
- MongoDB
- Redis (optionnel, pour le cache)
- Docker & Docker Compose (optionnel)

### Installation locale

1. **Cloner le repository**
```bash
git clone <repository-url>
cd mdmcv6-project
```

2. **Installer les dépendances**
```bash
npm run install:all
```

3. **Configuration**
```bash
cp .env.example .env
# Éditer .env avec vos paramètres
```

4. **Démarrer MongoDB**
```bash
# Avec Docker
docker run -d -p 27017:27017 --name mongodb mongo

# Ou avec MongoDB local
mongod
```

5. **Lancer l'application**
```bash
npm run dev
```

L'application sera accessible sur :
- Frontend : http://localhost:3000
- API : http://localhost:3001

### Installation avec Docker

```bash
docker-compose up -d
```

## 📋 Configuration Analytics

### Google Tag Manager
1. Créer un conteneur GTM
2. Ajouter l'ID GTM dans l'interface SmartLink
3. Configurer les triggers pour les événements SmartLink

### Google Analytics 4
1. Créer une propriété GA4
2. Ajouter l'ID GA4 dans l'interface
3. Les événements personnalisés sont automatiquement trackés

### Google Ads
1. Créer des actions de conversion dans Google Ads
2. Ajouter l'ID Google Ads dans l'interface
3. Les conversions sont trackées automatiquement lors des clics

## 🎯 Utilisation

### 1. Créer un SmartLink
- Aller sur `/create`
- Entrer une URL Spotify, Apple Music, ou un ISRC
- Personnaliser le branding et les intégrations analytics
- Cliquer sur "Scanner" pour générer le SmartLink

### 2. Analytics
- Accéder aux analytics via le dashboard
- Voir les métriques par plateforme, pays, appareil
- Exporter les données en CSV/PDF

### 3. API Usage

#### Créer un SmartLink
```javascript
POST /api/smartlinks
{
  "sourceUrl": "https://open.spotify.com/track/...",
  "userId": "user-id",
  "customizations": {
    "slug": "mon-titre-personnalise",
    "integrations": {
      "gtmId": "GTM-XXXXXXX",
      "ga4Id": "G-XXXXXXXXXX",
      "googleAdsId": "AW-XXXXXXXXX"
    },
    "branding": {
      "primaryColor": "#1DB954",
      "backgroundColor": "#000000"
    }
  }
}
```

#### Récupérer les analytics
```javascript
GET /api/analytics/:linkId?timeframe=30d
```

## 🔧 Architecture

### Backend (Node.js/Express)
- API RESTful pour la gestion des SmartLinks
- Intégration Odesli pour le scan des plateformes
- Système d'analytics avec MongoDB
- Rate limiting et sécurité

### Frontend (React)
- Interface de création de SmartLinks
- Landing pages dynamiques avec SSR
- Dashboard analytics avec Chart.js
- Design responsive et moderne

### Base de données (MongoDB)
- SmartLinks avec métadonnées complètes
- Analytics événements et métriques
- Système d'utilisateurs et permissions

## 📊 Événements Analytics Trackés

- **smartlink_view** : Vue d'une landing page
- **platform_click** : Clic sur une plateforme
- **conversion** : Conversion Google Ads
- **select_content** : Sélection de contenu GA4

## 🛡 Sécurité

- Rate limiting sur l'API
- Validation des données entrantes
- CORS configuré pour la production
- Variables d'environnement pour les secrets
- Helmet.js pour les headers de sécurité

## 🚀 Déploiement

### Avec Docker
```bash
docker-compose -f docker-compose.yml up -d
```

### Vercel (Frontend)
```bash
cd frontend-clean
vercel
```

### Railway (Backend)
```bash
railway login
railway init
railway up
```

### Variables d'environnement de production
- `MONGODB_URI` : URL de votre base MongoDB
- `NODE_ENV` : production
- `JWT_SECRET` : Secret pour l'authentification
- `ADMIN_KEY` : Clé d'accès admin

## 📈 API Endpoints

### SmartLinks
- `POST /api/smartlinks` - Créer un SmartLink
- `GET /api/smartlinks/:slug` - Récupérer un SmartLink
- `PUT /api/smartlinks/:id` - Modifier un SmartLink
- `DELETE /api/smartlinks/:id` - Supprimer un SmartLink

### Analytics
- `POST /api/analytics/:linkId` - Tracker un événement
- `GET /api/analytics/:linkId` - Récupérer les analytics

### Administration
- `GET /api/admin/stats` - Statistiques globales
- `GET /api/admin/health` - État du système
- `GET /api/admin/users` - Liste des utilisateurs

## 🎵 API Odesli

Ce système utilise l'API Odesli (song.link) pour scanner automatiquement toutes les plateformes musicales. L'API est gratuite pour un usage raisonnable.

Plateformes supportées :
- Spotify
- Apple Music
- Amazon Music
- YouTube Music
- Deezer
- Tidal
- SoundCloud
- Pandora
- Et bien d'autres...

## 📈 Monitoring et Performance

- Monitoring temps réel avec alertes
- Cache Redis pour optimiser les performances
- Métriques détaillées des conversions
- Logs structurés pour le debugging

## 🤝 Contribution

1. Fork le project
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour le support technique ou les questions :
- Email : support@mdmc-agency.com
- Documentation : https://docs.mdmc-agency.com
- Issues GitHub : https://github.com/mdmc-agency/smartlink/issues