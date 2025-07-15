const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'dist')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Route spéciale pour SmartLinks - SANS REDIRECTION comme Linkfire
// 🧪 VERSION TEST : Utilise des trackingIds factices pour contourner l'authentification API
app.get('/smartlinks/:artistSlug/:trackSlug', async (req, res) => {
  const { artistSlug, trackSlug } = req.params;
  
  try {
    // Lire le fichier HTML de base
    const htmlPath = path.join(__dirname, 'dist/index.html');
    let html = fs.readFileSync(htmlPath, 'utf8');
    
    // 🧪 SOLUTION TEMPORAIRE : Codes tracking factices pour test
    // Une fois l'authentification résolue, ce code sera remplacé par l'appel API
    let trackingIds = {
      ga4Id: 'G-TEST123456',
      gtmId: 'GTM-TEST123',
      metaPixelId: '123456789012345',
      tiktokPixelId: 'C4A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5'
    };
    
    console.log('🧪 TEST - Utilisation codes tracking factices:', trackingIds);
    
    // CODE ORIGINAL (désactivé temporairement) :
    /*
    try {
      const https = require('https');
      const http = require('http');
      
      const apiUrl = `https://api.mdmcmusicads.com/api/v1/smartlinks/${artistSlug}/${trackSlug}`;
      
      const response = await new Promise((resolve, reject) => {
        const protocol = apiUrl.startsWith('https') ? https : http;
        const req = protocol.get(apiUrl, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(e);
            }
          });
        });
        req.on('error', reject);
        req.setTimeout(5000, () => reject(new Error('Timeout')));
      });
      
      if (response.success && response.data.smartLink?.trackingIds) {
        trackingIds = response.data.smartLink.trackingIds;
        console.log('🎯 SSR - Injection codes tracking:', trackingIds);
      }
    } catch (apiError) {
      console.error('❌ Erreur API pour codes tracking:', apiError);
    }
    */
    
    // Injecter les scripts analytics (même sans redirection)
    if (trackingIds.ga4Id && trackingIds.ga4Id.trim()) {
      const ga4Script = `
<!-- Google Analytics 4 SmartLink SSR - PERMANENT -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${trackingIds.ga4Id}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${trackingIds.ga4Id}', {
    page_title: '${artistSlug} - ${trackSlug}',
    page_location: 'https://mdmcv6-frontend-production.up.railway.app/smartlinks/${artistSlug}/${trackSlug}',
    custom_map: {'smartlink_artist': '${artistSlug}', 'smartlink_track': '${trackSlug}'}
  });
  console.log('🎯 GA4 loaded for SmartLink:', '${trackingIds.ga4Id}');
</script>`;
      
      html = html.replace('</head>', ga4Script + '</head>');
    }
    
    if (trackingIds.gtmId && trackingIds.gtmId.trim()) {
      const gtmScript = `
<!-- Google Tag Manager SmartLink SSR - PERMANENT -->
<script>
  (function(w,d,s,l,i){
    w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
    var f=d.getElementsByTagName(s)[0], j=d.createElement(s), dl=l!='dataLayer'?'&l='+l:'';
    j.async=true; j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
    f.parentNode.insertBefore(j,f);
    console.log('🎯 GTM loaded for SmartLink:', '${trackingIds.gtmId}');
  })(window,document,'script','dataLayer','${trackingIds.gtmId}');
</script>`;
      
      const gtmNoScript = `
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${trackingIds.gtmId}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`;
      
      html = html.replace('</head>', gtmScript + '</head>');
      html = html.replace('<body>', '<body>' + gtmNoScript);
    }
    
    if (trackingIds.metaPixelId && trackingIds.metaPixelId.trim()) {
      const metaScript = `
<!-- Meta Pixel SmartLink SSR - PERMANENT -->
<script>
  !function(f,b,e,v,n,t,s) {
    if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)
  }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '${trackingIds.metaPixelId}');
  fbq('track', 'PageView');
  console.log('🎯 Meta Pixel loaded for SmartLink:', '${trackingIds.metaPixelId}');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${trackingIds.metaPixelId}&ev=PageView&noscript=1"/></noscript>`;
      
      html = html.replace('</head>', metaScript + '</head>');
    }
    
    if (trackingIds.tiktokPixelId && trackingIds.tiktokPixelId.trim()) {
      const tiktokScript = `
<!-- TikTok Pixel SmartLink SSR - PERMANENT -->
<script>
  !function (w, d, t) {
    w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
    ttq.load('${trackingIds.tiktokPixelId}');
    ttq.page();
    console.log('🎯 TikTok Pixel loaded for SmartLink:', '${trackingIds.tiktokPixelId}');
  }(window, document, 'ttq');
</script>`;
      
      html = html.replace('</head>', tiktokScript + '</head>');
    }
    
    // SOLUTION LINKFIRE : Pas de redirection, forcer React à charger la route directement
    const smartlinkScript = `
<script>
  // Forcer React à charger la route SmartLink SANS redirection
  window.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 SmartLink SSR: Analytics intégrés, chargement React...');
    
    // Ajouter les paramètres SmartLink au window pour React
    window.SMARTLINK_SSR_DATA = {
      artistSlug: '${artistSlug}',
      trackSlug: '${trackSlug}',
      analyticsLoaded: true
    };
    
    // Forcer React à afficher la route SmartLink
    if (window.location.hash === '') {
      window.location.hash = '#/smartlinks/${artistSlug}/${trackSlug}';
    }
    
    console.log('🎯 SmartLink route set:', window.location.hash);
  });
</script>`;
    
    html = html.replace('</body>', smartlinkScript + '</body>');
    
    res.send(html);
  } catch (error) {
    console.error('❌ Erreur SmartLink SSR:', error);
    res.sendFile(path.join(__dirname, 'dist/index.html'));
  }
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 MDMC Frontend server running on port ${PORT}`);
  console.log(`💚 Health check available at http://localhost:${PORT}/health`);
});