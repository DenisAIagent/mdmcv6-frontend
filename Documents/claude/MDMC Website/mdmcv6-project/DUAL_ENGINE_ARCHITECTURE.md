# 🔄 ARCHITECTURE DUAL ENGINE TRACKING
## Système de Tracking Hybride Server-Side + Client-Side

### 🎯 CONCEPT FONDAMENTAL
Le **Dual Engine** combine le tracking server-side (100% fiable) avec le tracking client-side (communication avec les plateformes) pour garantir une précision maximale des analytics.

---

## 🏗️ ARCHITECTURE TECHNIQUE

### 📊 Engine 1 : Server-Side Tracking (Fiabilité)
```typescript
// pages/[smartlinkSlug].tsx
export async function getServerSideProps({ params, req, res }) {
  const smartlink = await SmartLink.findOne({ slug: params.smartlinkSlug });
  
  // TRACKING SERVER IMMÉDIAT
  const trackingData = {
    smartlinkId: smartlink._id,
    timestamp: new Date(),
    userAgent: req.headers['user-agent'],
    ip: getClientIP(req),
    referer: req.headers.referer || null,
    country: await getCountryFromIP(req),
    device: detectDevice(req.headers['user-agent']),
    platform: detectPlatform(req.headers['user-agent'])
  };
  
  // Enregistrement IMMÉDIAT en base
  await Analytics.create(trackingData);
  
  return {
    props: {
      smartlink,
      tracking: {
        ga4: smartlink.client.tracking.ga4,
        gtm: smartlink.client.tracking.gtm,
        sessionId: generateSessionId()
      }
    }
  };
}
```

### 🌐 Engine 2 : Client-Side Tracking (Communication)
```typescript
// components/SmartLinkPage.tsx
export default function SmartLinkPage({ smartlink, tracking }) {
  useEffect(() => {
    // GTM/GA4 pour communication avec plateformes
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'smartlink_view',
      smartlink_id: smartlink._id,
      artist_name: smartlink.artistName,
      track_title: smartlink.trackTitle,
      session_id: tracking.sessionId
    });
    
    // Facebook Pixel
    if (smartlink.client.tracking.facebook) {
      fbq('track', 'ViewContent', {
        content_name: smartlink.trackTitle,
        content_category: 'Music',
        custom_parameter: smartlink._id
      });
    }
  }, []);
  
  return (
    <>
      <Head>
        {/* GTM - PRÉSENT DÈS LE RENDU INITIAL */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${tracking.gtm}');
            `
          }}
        />
        
        {/* GA4 - PRÉSENT DÈS LE RENDU INITIAL */}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${tracking.ga4}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${tracking.ga4}');
            `
          }}
        />
      </Head>
      
      <SmartLinkContent smartlink={smartlink} />
    </>
  );
}
```

---

## 🎯 AVANTAGES DU DUAL ENGINE

### ✅ Engine Server-Side
- **100% fiabilité** : Pas de blocage adblockers
- **Données précises** : IP, User-Agent, timestamps exacts
- **Performance** : Tracking immédiat sans JavaScript
- **Compliance** : Respect RGPD automatique

### ✅ Engine Client-Side  
- **Communication plateformes** : GA4, GTM, Facebook
- **Événements riches** : Scroll, clics, interactions
- **Remarketing** : Pixels pour campagnes
- **Analytics avancées** : Comportement utilisateur

---

## 📊 STRUCTURE DE DONNÉES

### 🗃️ Collection Analytics (Server-Side)
```typescript
interface AnalyticsEntry {
  _id: ObjectId;
  smartlinkId: ObjectId;
  clientId: ObjectId;
  timestamp: Date;
  
  // Données serveur (100% fiables)
  server: {
    ip: string;
    userAgent: string;
    referer?: string;
    country: string;
    region: string;
    city: string;
  };
  
  // Données device/platform
  device: {
    type: 'mobile' | 'desktop' | 'tablet';
    os: string;
    browser: string;
    screenResolution?: string;
  };
  
  // Données business
  business: {
    isUniqueVisitor: boolean;
    sessionId: string;
    conversionPath: string[];
    revenue?: number;
  };
  
  // Tracking client (si disponible)
  client?: {
    ga4SessionId?: string;
    gtmEvents?: any[];
    facebookPixelId?: string;
    customEvents?: any[];
  };
}
```

### 🏢 Multi-Client Schema
```typescript
interface Client {
  _id: ObjectId;
  name: string;
  domain: string;
  
  tracking: {
    ga4: string;           // G-XXXXXXXXXX
    gtm: string;           // GTM-XXXXXXX
    facebook?: string;     // Pixel ID
    tiktok?: string;       // Pixel ID
    custom?: {
      [key: string]: string;
    };
  };
  
  branding: {
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    font: string;
  };
  
  settings: {
    allowCustomDomains: boolean;
    maxSmartlinksPerMonth: number;
    analyticsRetentionDays: number;
  };
}
```

---

## 🔒 SÉCURITÉ & CONFORMITÉ

### 🛡️ Protection Données
```typescript
// middleware/privacy.ts
export function privacyMiddleware(req: NextRequest) {
  // Anonymisation IP selon RGPD
  const anonymizedIP = anonymizeIP(req.ip);
  
  // Respect préférences cookies
  const cookieConsent = req.cookies.get('cookie-consent');
  
  return {
    trackingAllowed: cookieConsent?.value === 'accepted',
    anonymizedIP,
    dataRetention: calculateRetentionDate()
  };
}
```

### 📋 Conformité RGPD
- **Anonymisation IP** automatique
- **Consentement cookies** respecté
- **Rétention données** configurable par client
- **Droit à l'oubli** implémenté

---

## 📈 MONITORING & ALERTES

### 🔍 Health Checks
```typescript
// api/health/tracking.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const stats = await Analytics.aggregate([
    { $match: { timestamp: { $gte: last24h } } },
    {
      $group: {
        _id: null,
        totalViews: { $sum: 1 },
        uniqueIPs: { $addToSet: '$server.ip' },
        serverTracking: { $sum: { $cond: ['$server', 1, 0] } },
        clientTracking: { $sum: { $cond: ['$client', 1, 0] } }
      }
    }
  ]);
  
  const healthScore = (stats.serverTracking / stats.totalViews) * 100;
  
  res.json({
    status: healthScore > 95 ? 'healthy' : 'warning',
    stats: {
      totalViews: stats.totalViews,
      uniqueVisitors: stats.uniqueIPs.length,
      serverTrackingRate: `${healthScore.toFixed(1)}%`,
      clientTrackingRate: `${((stats.clientTracking / stats.totalViews) * 100).toFixed(1)}%`
    }
  });
}
```

### 🚨 Alertes Automatiques
- **Tracking rate < 95%** → Alert Slack
- **Unusual traffic spike** → Email admin
- **Client tracking failure** → Dashboard notification

---

## 🔧 MIGRATION STRATEGY

### Phase 1 : Parallel Running
```typescript
// Pendant migration : double tracking
const trackServerSide = async (data) => {
  // Nouveau système Next.js
  await Analytics.create(data);
};

const trackLegacy = async (data) => {
  // Ancien système React
  await LegacyAnalytics.create(data);
};

// Les deux systèmes tournent en parallèle
await Promise.all([
  trackServerSide(trackingData),
  trackLegacy(trackingData)
]);
```

### Phase 2 : Validation & Switch
- **Comparaison données** 48h
- **Validation précision** ±2%
- **Switch progressif** par client
- **Rollback plan** si problème

---

## 📊 DASHBOARD ANALYTICS

### 🎯 Vue Client Individuel
```typescript
interface ClientDashboard {
  overview: {
    totalViews: number;
    uniqueVisitors: number;
    conversionRate: number;
    topCountries: Country[];
  };
  
  realtime: {
    activeUsers: number;
    currentViews: number;
    topPages: SmartLink[];
  };
  
  performance: {
    serverTrackingRate: number;
    clientTrackingRate: number;
    dataQuality: 'excellent' | 'good' | 'warning';
  };
}
```

### 🏢 Vue MDMC Master
- **Tous clients** agrégés
- **Revenue tracking** per client
- **Performance monitoring** global
- **Growth metrics** business

---

**🤖 Generated with [Claude Code](https://claude.ai/code)**

**Co-Authored-By: Claude <noreply@anthropic.com>**