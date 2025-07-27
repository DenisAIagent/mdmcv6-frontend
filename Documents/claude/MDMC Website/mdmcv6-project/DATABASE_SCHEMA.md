# 🗃️ SCHÉMA BASE DE DONNÉES MULTI-CLIENT
## Architecture MongoDB pour Tracking Dual Engine

### 🎯 OVERVIEW
Architecture multi-tenant avec collections optimisées pour le tracking server-side et la gestion multi-clients.

---

## 📊 COLLECTIONS PRINCIPALES

### 🏢 Collection: `clients`
```typescript
interface Client {
  _id: ObjectId;
  name: string;                    // "Universal Music", "Warner"
  slug: string;                    // "universal-music"
  domain: string;                  // "smartlinks.universal.com"
  subdomain?: string;              // "universal.mdmclinks.com"
  
  // Configuration tracking
  tracking: {
    ga4: string;                   // "G-XXXXXXXXXX"
    gtm: string;                   // "GTM-XXXXXXX"
    facebook?: string;             // "1234567890"
    tiktok?: string;               // "C9XXXXXXXXX"
    linkedin?: string;             // "987654321"
    custom?: Array<{
      name: string;
      id: string;
      type: 'pixel' | 'tag' | 'script';
    }>;
  };
  
  // Branding personnalisé
  branding: {
    logo: string;                  // URL CDN
    favicon: string;               // URL CDN
    primaryColor: string;          // "#1DB954"
    secondaryColor: string;        // "#191414"
    accentColor: string;           // "#FFFFFF"
    font: string;                  // "Inter, sans-serif"
    customCSS?: string;            // CSS personnalisé
  };
  
  // Paramètres business
  settings: {
    maxSmartlinksPerMonth: number; // 1000
    maxUsersPerClient: number;     // 50
    allowCustomDomains: boolean;   // true
    analyticsRetentionDays: number;// 365
    apiRateLimit: number;          // 1000/hour
    features: string[];            // ["advanced-analytics", "white-label"]
  };
  
  // Contacts
  contacts: {
    primary: {
      name: string;
      email: string;
      phone?: string;
    };
    billing: {
      name: string;
      email: string;
      address: Address;
    };
    technical?: {
      name: string;
      email: string;
    };
  };
  
  // Métadonnées
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    status: 'active' | 'suspended' | 'trial';
    trialEndDate?: Date;
    planType: 'starter' | 'professional' | 'enterprise';
    monthlyRevenue: number;
  };
}
```

### 🎵 Collection: `smartlinks`
```typescript
interface SmartLink {
  _id: ObjectId;
  clientId: ObjectId;              // Référence vers clients
  slug: string;                    // "jiro-in-your-light"
  
  // Informations track
  track: {
    title: string;                 // "In Your Light"
    artistName: string;            // "Jiro"
    albumName?: string;            // "Debut Album"
    genre?: string;                // "Electronic"
    releaseDate?: Date;
    duration?: number;             // secondes
    isrc?: string;                 // "FR-ABC-12-34567"
  };
  
  // URLs plateformes
  platforms: {
    spotify?: string;
    appleMusic?: string;
    deezer?: string;
    youtube?: string;
    soundcloud?: string;
    tidal?: string;
    amazonMusic?: string;
    bandcamp?: string;
    custom?: Array<{
      name: string;
      url: string;
      iconUrl?: string;
    }>;
  };
  
  // Média associés
  media: {
    coverArt: string;              // URL CDN
    backgroundImage?: string;      // URL CDN
    audioPreview?: string;         // URL CDN 30sec
    videoTeaser?: string;          // URL CDN
  };
  
  // Configuration tracking spécifique
  tracking: {
    customEvents?: string[];       // ["purchase", "newsletter-signup"]
    conversionGoals?: Array<{
      platform: string;
      weight: number;              // 1-10
      value: number;               // €
    }>;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  };
  
  // SEO
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    ogImage?: string;
    structuredData?: any;
  };
  
  // Métadonnées
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: ObjectId;           // user._id
    status: 'active' | 'draft' | 'archived';
    featured: boolean;
    totalViews: number;            // cache pour performance
    uniqueVisitors: number;        // cache pour performance
    conversionRate: number;        // cache calculé
  };
}
```

### 📈 Collection: `analytics`
```typescript
interface AnalyticsEntry {
  _id: ObjectId;
  smartlinkId: ObjectId;
  clientId: ObjectId;              // Pour requêtes rapides
  timestamp: Date;
  sessionId: string;               // UUID v4
  
  // Données server-side (100% fiables)
  server: {
    ip: string;                    // Anonymisé si RGPD
    userAgent: string;
    referer?: string;
    acceptLanguage: string;
    country: string;               // ISO 3166-1
    region?: string;
    city?: string;
    isp?: string;
    timezone?: string;
  };
  
  // Détection device/platform
  device: {
    type: 'mobile' | 'desktop' | 'tablet' | 'bot';
    os: string;                    // "iOS 15.1", "Windows 11"
    browser: string;               // "Safari 15.1", "Chrome 96"
    vendor?: string;               // "Apple", "Samsung"
    model?: string;                // "iPhone 13", "Galaxy S21"
    screenResolution?: string;     // "1920x1080"
    colorDepth?: number;           // 24
    pixelRatio?: number;           // 2.0
  };
  
  // Données géolocalisation précise (si autorisée)
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;              // mètres
    city: string;
    district?: string;
  };
  
  // Données business/conversion
  business: {
    isUniqueVisitor: boolean;
    isReturningVisitor: boolean;
    visitNumber: number;           // 1, 2, 3...
    timeOnPage?: number;           // secondes
    scrollDepth?: number;          // 0-100%
    clickedPlatforms: string[];    // ["spotify", "apple"]
    conversionValue?: number;      // €
    conversionType?: string;       // "stream", "purchase", "follow"
  };
  
  // Données tracking client-side (si disponible)
  client?: {
    ga4SessionId?: string;
    gtmDataLayer?: any[];
    facebookPixelId?: string;
    customEvents?: Array<{
      name: string;
      value: any;
      timestamp: Date;
    }>;
    performanceMetrics?: {
      loadTime: number;
      domContentLoaded: number;
      firstContentfulPaint: number;
      largestContentfulPaint: number;
    };
  };
  
  // Attribution marketing
  attribution?: {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmTerm?: string;
    utmContent?: string;
    gclid?: string;                // Google Ads Click ID
    fbclid?: string;               // Facebook Click ID
    ttclid?: string;               // TikTok Click ID
  };
  
  // Métadonnées techniques
  metadata: {
    processingTime: number;        // ms pour traiter l'événement
    dataQuality: 'excellent' | 'good' | 'partial' | 'poor';
    errors?: string[];
    retries?: number;
  };
}
```

### 👥 Collection: `users`
```typescript
interface User {
  _id: ObjectId;
  clientId: ObjectId;              // Appartient à quel client
  
  // Authentification
  auth: {
    email: string;
    passwordHash: string;
    salt: string;
    lastLogin?: Date;
    loginAttempts: number;
    lockUntil?: Date;
    emailVerified: boolean;
    emailVerificationToken?: string;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
  };
  
  // Profil
  profile: {
    firstName: string;
    lastName: string;
    displayName?: string;
    avatar?: string;               // URL CDN
    phone?: string;
    timezone: string;              // "Europe/Paris"
    language: string;              // "fr"
    bio?: string;
  };
  
  // Permissions & rôles
  permissions: {
    role: 'admin' | 'manager' | 'editor' | 'viewer';
    scopes: string[];              // ["smartlinks:read", "analytics:write"]
    restrictions?: {
      maxSmartlinks?: number;
      allowedDomains?: string[];
      ipWhitelist?: string[];
    };
  };
  
  // Préférences
  preferences: {
    emailNotifications: boolean;
    slackNotifications?: string;   // Webhook URL
    dashboardLayout: 'classic' | 'minimal' | 'advanced';
    defaultPlatformOrder: string[];
    autoSaveEnabled: boolean;
  };
  
  // Métadonnées
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    lastActiveAt: Date;
    status: 'active' | 'inactive' | 'suspended';
    createdBy?: ObjectId;          // Qui a créé ce user
    notes?: string;                // Notes admin
  };
}
```

---

## 🚀 COLLECTIONS PERFORMANCE

### 📊 Collection: `analytics_daily` (Agrégations)
```typescript
interface DailyAnalytics {
  _id: ObjectId;
  date: Date;                      // Début de journée UTC
  clientId: ObjectId;
  smartlinkId?: ObjectId;          // null = agrégation client
  
  metrics: {
    totalViews: number;
    uniqueVisitors: number;
    returningVisitors: number;
    avgTimeOnPage: number;
    bounceRate: number;            // 0-100%
    conversionRate: number;        // 0-100%
    totalConversions: number;
    conversionValue: number;       // €
  };
  
  breakdown: {
    countries: Map<string, number>;
    devices: Map<string, number>;
    platforms: Map<string, number>;
    sources: Map<string, number>;
    hours: number[];               // 24 éléments pour heure
  };
  
  // Métadonnées
  metadata: {
    lastUpdated: Date;
    dataQuality: number;           // 0-100%
    rawEventsCount: number;
  };
}
```

### 🔄 Collection: `sessions`
```typescript
interface Session {
  _id: string;                     // sessionId UUID
  smartlinkId: ObjectId;
  clientId: ObjectId;
  
  // Données session
  session: {
    startTime: Date;
    endTime?: Date;
    duration?: number;             // secondes
    pageviews: number;
    events: Array<{
      type: string;                // "click", "scroll", "conversion"
      timestamp: Date;
      data: any;
    }>;
  };
  
  // Attribution première visite
  attribution: {
    firstReferer?: string;
    firstUtmSource?: string;
    firstUtmMedium?: string;
    firstUtmCampaign?: string;
    landingPage: string;
  };
  
  // Résumé conversion
  conversion?: {
    converted: boolean;
    conversionTime?: Date;
    conversionValue?: number;
    conversionPlatform?: string;
    conversionPath: string[];      // ["view", "click-spotify", "conversion"]
  };
}
```

---

## 🔍 INDEX STRATÉGIQUES

### 📈 Analytics Performance
```javascript
// Index composé pour requêtes temps réel
db.analytics.createIndex({ 
  "clientId": 1, 
  "timestamp": -1 
});

// Index pour analytics SmartLink spécifique
db.analytics.createIndex({ 
  "smartlinkId": 1, 
  "timestamp": -1 
});

// Index géospatial pour analytics par pays
db.analytics.createIndex({ 
  "server.country": 1, 
  "timestamp": -1 
});

// Index pour sessions tracking
db.analytics.createIndex({ 
  "sessionId": 1 
});

// Index pour visiteurs uniques
db.analytics.createIndex({ 
  "server.ip": 1, 
  "smartlinkId": 1, 
  "timestamp": -1 
});
```

### 🏢 Multi-Client Performance
```javascript
// Index client + slug pour résolution SmartLink
db.smartlinks.createIndex({ 
  "clientId": 1, 
  "slug": 1 
}, { unique: true });

// Index pour recherche SmartLinks par client
db.smartlinks.createIndex({ 
  "clientId": 1, 
  "metadata.status": 1, 
  "metadata.createdAt": -1 
});

// Index utilisateurs par client
db.users.createIndex({ 
  "clientId": 1, 
  "auth.email": 1 
}, { unique: true });
```

---

## 🔒 SÉCURITÉ DONNÉES

### 🛡️ Chiffrement Sensible
```typescript
// Champs chiffrés niveau application
interface EncryptedFields {
  'server.ip': string;             // Hash SHA-256 + salt
  'auth.passwordHash': string;     // bcrypt
  'contacts.email': string;        // AES-256
}
```

### 📋 Audit Trail
```typescript
interface AuditLog {
  _id: ObjectId;
  userId: ObjectId;
  clientId: ObjectId;
  action: string;                  // "create", "update", "delete"
  resource: string;                // "smartlink", "user", "client"
  resourceId: ObjectId;
  changes?: any;                   // Diff avant/après
  timestamp: Date;
  ip: string;
  userAgent: string;
}
```

---

## 📊 REQUÊTES OPTIMISÉES

### 🎯 Dashboard Client Temps Réel
```typescript
// Agrégation pour dashboard client
const clientDashboard = await db.analytics.aggregate([
  { $match: { 
    clientId: clientId, 
    timestamp: { $gte: last24Hours } 
  }},
  { $group: {
    _id: null,
    totalViews: { $sum: 1 },
    uniqueVisitors: { $addToSet: "$server.ip" },
    topCountries: { $push: "$server.country" },
    conversionValue: { $sum: "$business.conversionValue" }
  }},
  { $project: {
    totalViews: 1,
    uniqueVisitors: { $size: "$uniqueVisitors" },
    conversionValue: 1,
    topCountries: { $slice: [
      { $sortArray: { 
        input: { $setUnion: "$topCountries" }, 
        sortBy: 1 
      }}, 5
    ]}
  }}
]);
```

### 📈 Analytics SmartLink Détaillées
```typescript
// Performance par SmartLink
const smartlinkPerformance = await db.analytics.aggregate([
  { $match: { 
    smartlinkId: smartlinkId,
    timestamp: { $gte: startDate, $lte: endDate }
  }},
  { $group: {
    _id: { 
      date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }},
      country: "$server.country"
    },
    views: { $sum: 1 },
    uniqueVisitors: { $addToSet: "$server.ip" },
    avgTimeOnPage: { $avg: "$business.timeOnPage" },
    conversions: { $sum: { $cond: ["$business.conversionValue", 1, 0] }}
  }},
  { $sort: { "_id.date": 1 }}
]);
```

---

**🤖 Generated with [Claude Code](https://claude.ai/code)**

**Co-Authored-By: Claude <noreply@anthropic.com>**