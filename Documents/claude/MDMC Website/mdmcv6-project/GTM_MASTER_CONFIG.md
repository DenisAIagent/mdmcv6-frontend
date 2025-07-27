# 🏷️ CONFIGURATION GTM MAÎTRE MULTI-CLIENT
## Google Tag Manager Universal pour Tracking Dynamique

### 🎯 CONCEPT
Un seul conteneur GTM maître qui s'adapte dynamiquement selon le client et injecte les bonnes configurations de tracking.

---

## 🏗️ ARCHITECTURE GTM

### 📦 Conteneur Maître
- **ID Conteneur** : `GTM-MDMC-MASTER`
- **Type** : Web Container
- **Scope** : Tous les SmartLinks multi-clients
- **Mode** : Dynamic Configuration

---

## 🔧 VARIABLES GTM

### 1️⃣ Variable: `Client ID`
```javascript
// Variable Type: Custom JavaScript
function() {
  // Extrait le client ID depuis l'URL ou localStorage
  var pathArray = window.location.pathname.split('/');
  var clientSlug = pathArray[1]; // /universal-music/track-slug
  
  // Mapping des slugs vers IDs
  var clientMapping = {
    'universal-music': 'client_001',
    'warner': 'client_002',
    'mdmc': 'client_000',
    'default': 'client_000'
  };
  
  return clientMapping[clientSlug] || clientMapping['default'];
}
```

### 2️⃣ Variable: `Dynamic GA4 ID`
```javascript
// Variable Type: Lookup Table
// Input Variable: {{Client ID}}
// Default Value: G-MDMC-DEFAULT

client_000 → G-MDMC-DEFAULT
client_001 → G-UNIVERSAL-001
client_002 → G-WARNER-002
```

### 3️⃣ Variable: `Dynamic GTM ID`
```javascript
// Variable Type: Lookup Table
// Input Variable: {{Client ID}}
// Default Value: GTM-MDMC-DEFAULT

client_000 → GTM-MDMC-DEFAULT
client_001 → GTM-UNIVERSAL-001
client_002 → GTM-WARNER-002
```

### 4️⃣ Variable: `SmartLink Data`
```javascript
// Variable Type: Custom JavaScript
function() {
  return {
    smartlinkId: window.smartlinkData?.id || 'unknown',
    artistName: window.smartlinkData?.artistName || 'Unknown Artist',
    trackTitle: window.smartlinkData?.trackTitle || 'Unknown Track',
    clientName: window.smartlinkData?.clientName || 'MDMC',
    timestamp: new Date().toISOString()
  };
}
```

### 5️⃣ Variable: `User Engagement Score`
```javascript
// Variable Type: Custom JavaScript
function() {
  var score = 0;
  var startTime = window.smartlinkStartTime || Date.now();
  var timeOnPage = Date.now() - startTime;
  
  // Score basé sur le temps passé
  if (timeOnPage > 30000) score += 25;      // 30s+
  if (timeOnPage > 60000) score += 25;      // 1min+
  if (timeOnPage > 120000) score += 25;     // 2min+
  
  // Score basé sur les interactions
  var clicks = parseInt(localStorage.getItem('smartlink_clicks') || '0');
  score += Math.min(clicks * 10, 25);       // Max 25 points pour clics
  
  return Math.min(score, 100);
}
```

### 6️⃣ Variable: `Device Category Enhanced`
```javascript
// Variable Type: Custom JavaScript
function() {
  var ua = navigator.userAgent;
  var screen = window.screen;
  
  if (/Mobile|Android|iPhone|iPad/i.test(ua)) {
    if (screen.width > 768) return 'tablet';
    return 'mobile';
  }
  
  if (screen.width > 1920) return 'desktop-large';
  if (screen.width > 1200) return 'desktop';
  return 'desktop-small';
}
```

### 7️⃣ Variable: `Conversion Value`
```javascript
// Variable Type: Custom JavaScript  
function() {
  var platform = {{Click Element}}.getAttribute('data-platform');
  
  // Valeurs de conversion par plateforme
  var platformValues = {
    'spotify': 0.004,        // Revenue per stream
    'apple-music': 0.007,
    'deezer': 0.006,
    'youtube': 0.001,
    'bandcamp': 2.50,        // Average purchase
    'default': 0.005
  };
  
  return platformValues[platform] || platformValues['default'];
}
```

### 8️⃣ Variable: `Geographic Data`
```javascript
// Variable Type: Custom JavaScript
function() {
  // Récupère la géolocalisation depuis l'API ou localStorage
  var geoData = JSON.parse(localStorage.getItem('geoData') || '{}');
  
  return {
    country: geoData.country || 'Unknown',
    region: geoData.region || 'Unknown', 
    city: geoData.city || 'Unknown',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
}
```

---

## 🎯 DÉCLENCHEURS (TRIGGERS)

### 1️⃣ Trigger: `SmartLink Page View`
```
Type: Page View
Conditions:
- Page Path matches RegEx: ^/[^/]+/[^/]+/?$
- Page Title contains: "SmartLink"
```

### 2️⃣ Trigger: `Platform Click`
```
Type: Click - All Elements
Conditions:
- Click Element matches CSS selector: .platform-button, [data-platform]
- Click URL does not contain: javascript:void
```

### 3️⃣ Trigger: `High Engagement`
```
Type: Custom Event
Event Name: high_engagement
Conditions:
- {{User Engagement Score}} greater than 75
```

### 4️⃣ Trigger: `Mobile Specific`
```
Type: Page View
Conditions:
- {{Device Category Enhanced}} equals mobile
- Page Path matches RegEx: ^/[^/]+/[^/]+/?$
```

### 5️⃣ Trigger: `Conversion Event`
```
Type: Custom Event
Event Name: conversion
Conditions:
- Event Action equals: platform_click
- {{Conversion Value}} greater than 0
```

### 6️⃣ Trigger: `Exit Intent`
```
Type: Custom Event
Event Name: exit_intent
Conditions:
- Mouse leaves viewport (custom implementation)
```

---

## 📊 BALISES (TAGS)

### 1️⃣ Tag: `GA4 Configuration Dynamique`
```
Type: Google Analytics: GA4 Configuration
Measurement ID: {{Dynamic GA4 ID}}

Configuration Settings:
- send_page_view: true
- client_id: {{Client ID}}
- custom_map:
  - smartlink_id: smartlink_id
  - artist_name: artist_name  
  - track_title: track_title
  - engagement_score: engagement_score

Trigger: SmartLink Page View
```

### 2️⃣ Tag: `GA4 Enhanced Event Tracking`
```
Type: Google Analytics: GA4 Event
Event Name: smartlink_interaction

Event Parameters:
- smartlink_id: {{SmartLink Data}}.smartlinkId
- artist_name: {{SmartLink Data}}.artistName
- track_title: {{SmartLink Data}}.trackTitle
- client_name: {{SmartLink Data}}.clientName
- platform: {{Click Element}}.data-platform
- conversion_value: {{Conversion Value}}
- engagement_score: {{User Engagement Score}}
- device_category: {{Device Category Enhanced}}
- country: {{Geographic Data}}.country
- timestamp: {{SmartLink Data}}.timestamp

Trigger: Platform Click, High Engagement
```

### 3️⃣ Tag: `Facebook Pixel Conditionnel`
```
Type: Custom HTML

HTML:
<script>
  (function() {
    var clientId = {{Client ID}};
    var pixelMapping = {
      'client_001': '1234567890',     // Universal Music
      'client_002': '0987654321',     // Warner
      'client_000': null              // MDMC - pas de pixel
    };
    
    var pixelId = pixelMapping[clientId];
    if (pixelId) {
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      
      fbq('init', pixelId);
      fbq('track', 'PageView');
      
      // Event tracking
      fbq('track', 'ViewContent', {
        content_name: {{SmartLink Data}}.trackTitle,
        content_category: 'Music',
        content_ids: [{{SmartLink Data}}.smartlinkId],
        content_type: 'product'
      });
    }
  })();
</script>

Trigger: SmartLink Page View
```

### 4️⃣ Tag: `TikTok Pixel Conditionnel`
```
Type: Custom HTML

HTML:
<script>
  (function() {
    var clientId = {{Client ID}};
    var tiktokMapping = {
      'client_001': 'C9UNIVERSAL001',   // Universal Music
      'client_002': 'C9WARNER002',      // Warner
      'client_000': null                // MDMC
    };
    
    var pixelId = tiktokMapping[clientId];
    if (pixelId) {
      !function (w, d, t) {
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
        ttq.load(pixelId);
        ttq.page();
      }(window, document, 'ttq');
      
      // Event tracking
      ttq.track('ViewContent', {
        content_name: {{SmartLink Data}}.trackTitle,
        content_category: 'Music',
        content_id: {{SmartLink Data}}.smartlinkId
      });
    }
  })();
</script>

Trigger: SmartLink Page View
```

### 5️⃣ Tag: `LinkedIn Insight Tag`
```
Type: Custom HTML

HTML:
<script type="text/javascript">
  var clientId = {{Client ID}};
  var linkedinMapping = {
    'client_001': '123456',      // Universal Music
    'client_002': '789012',      // Warner  
    'client_000': null           // MDMC
  };
  
  var partnerId = linkedinMapping[clientId];
  if (partnerId) {
    _linkedin_partner_id = partnerId;
    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    window._linkedin_data_partner_ids.push(_linkedin_partner_id);
    
    (function(l) {
      if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
      window.lintrk.q=[]}
      var s = document.getElementsByTagName("script")[0];
      var b = document.createElement("script");
      b.type = "text/javascript";b.async = true;
      b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
      s.parentNode.insertBefore(b, s);})(window.lintrk);
  }
</script>

Trigger: SmartLink Page View
```

### 6️⃣ Tag: `DataLayer Push - Conversion`
```
Type: Custom HTML

HTML:
<script>
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    'event': 'smartlink_conversion',
    'smartlink_id': {{SmartLink Data}}.smartlinkId,
    'artist_name': {{SmartLink Data}}.artistName,
    'track_title': {{SmartLink Data}}.trackTitle,
    'platform': {{Click Element}}.getAttribute('data-platform'),
    'conversion_value': {{Conversion Value}},
    'client_id': {{Client ID}},
    'timestamp': new Date().toISOString()
  });
</script>

Trigger: Conversion Event
```

### 7️⃣ Tag: `Server-Side Tracking Backup`
```
Type: Custom HTML

HTML:
<script>
  // Backup tracking vers notre API
  fetch('/api/analytics/track', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      smartlinkId: {{SmartLink Data}}.smartlinkId,
      clientId: {{Client ID}},
      event: 'gtm_tracking',
      data: {
        platform: {{Click Element}}.getAttribute('data-platform'),
        conversionValue: {{Conversion Value}},
        engagementScore: {{User Engagement Score}},
        deviceCategory: {{Device Category Enhanced}},
        geographic: {{Geographic Data}},
        timestamp: new Date().toISOString()
      }
    })
  }).catch(function(error) {
    console.log('Backup tracking failed:', error);
  });
</script>

Trigger: Platform Click
```

---

## 🔧 CONFIGURATION AVANCÉE

### 📊 Enhanced Ecommerce Setup
```javascript
// Pour tracking des conversions comme des achats
{
  'event': 'purchase',
  'ecommerce': {
    'transaction_id': {{SmartLink Data}}.smartlinkId + '_' + Date.now(),
    'value': {{Conversion Value}},
    'currency': 'EUR',
    'items': [{
      'item_id': {{SmartLink Data}}.smartlinkId,
      'item_name': {{SmartLink Data}}.trackTitle,
      'item_category': 'Music',
      'item_brand': {{SmartLink Data}}.artistName,
      'price': {{Conversion Value}},
      'quantity': 1
    }]
  }
}
```

### 🎯 Audience Building
```javascript
// Custom audiences basées sur l'engagement
if ({{User Engagement Score}} > 75) {
  gtag('event', 'conversion', {
    'send_to': {{Dynamic GA4 ID}} + '/high_engagement'
  });
}
```

### 📱 App Tracking (si applicable)
```javascript
// Si l'app mobile MDMC existe
gtag('config', {{Dynamic GA4 ID}}, {
  'app_name': 'MDMC SmartLinks',
  'app_version': '2.0.0',
  'app_id': 'com.mdmc.smartlinks'
});
```

---

## 🔒 RESPECT RGPD

### 🍪 Consent Management
```javascript
// Variable: Consent Status
function() {
  var consent = localStorage.getItem('cookie-consent');
  return {
    'analytics_storage': consent === 'accepted' ? 'granted' : 'denied',
    'ad_storage': consent === 'accepted' ? 'granted' : 'denied',
    'ad_user_data': consent === 'accepted' ? 'granted' : 'denied',
    'ad_personalization': consent === 'accepted' ? 'granted' : 'denied'
  };
}
```

### 🛡️ Data Minimization
```javascript
// Anonymisation automatique
gtag('config', {{Dynamic GA4 ID}}, {
  'anonymize_ip': true,
  'allow_google_signals': false,
  'allow_ad_personalization_signals': false
});
```

---

## 📊 DEBUGGING & TESTING

### 🔍 Debug Mode Setup
```javascript
// Variable: Debug Mode
function() {
  return window.location.search.includes('debug=true') || 
         localStorage.getItem('gtm-debug') === 'true';
}

// Conditional debugging
if ({{Debug Mode}}) {
  console.log('GTM Debug - Client ID:', {{Client ID}});
  console.log('GTM Debug - GA4 ID:', {{Dynamic GA4 ID}});
  console.log('GTM Debug - SmartLink Data:', {{SmartLink Data}});
}
```

### 🧪 A/B Testing Support  
```javascript
// Variable: Test Variant
function() {
  var variants = ['A', 'B'];
  var smartlinkId = {{SmartLink Data}}.smartlinkId;
  var hash = 0;
  
  for (var i = 0; i < smartlinkId.length; i++) {
    hash = ((hash << 5) - hash + smartlinkId.charCodeAt(i)) & 0xffffffff;
  }
  
  return variants[Math.abs(hash) % variants.length];
}
```

---

**🤖 Generated with [Claude Code](https://claude.ai/code)**

**Co-Authored-By: Claude <noreply@anthropic.com>**