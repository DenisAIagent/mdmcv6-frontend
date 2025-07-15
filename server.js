const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'dist')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Route spéciale pour SmartLinks - Server-Side Rendering avec codes tracking
app.get('/smartlinks/:artistSlug/:trackSlug', async (req, res) => {
  const { artistSlug, trackSlug } = req.params;
  
  try {
    // Lire le fichier HTML de base
    const htmlPath = path.join(__dirname, 'dist/index.html');
    let html = fs.readFileSync(htmlPath, 'utf8');
    
    // Récupérer les codes tracking depuis l'API
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
        const trackingIds = response.data.smartLink.trackingIds;
        console.log('🎯 SSR - Injection codes tracking:', trackingIds);
        
        // Injection Google Analytics 4 côté serveur
        if (trackingIds.ga4Id && trackingIds.ga4Id.trim()) {
          const ga4Script = `
<!-- Google Analytics 4 SmartLink SSR -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${trackingIds.ga4Id}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${trackingIds.ga4Id}', {
    page_title: '${artistSlug} - ${trackSlug}',
    page_location: window.location.href
  });
</script>`;
          
          html = html.replace('</head>', ga4Script + '</head>');
        }
        
        // Injection Google Tag Manager côté serveur
        if (trackingIds.gtmId && trackingIds.gtmId.trim()) {
          const gtmScript = `
<!-- Google Tag Manager SmartLink SSR -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${trackingIds.gtmId}');</script>`;
          
          const gtmNoScript = `
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${trackingIds.gtmId}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`;
          
          html = html.replace('</head>', gtmScript + '</head>');
          html = html.replace('<body>', '<body>' + gtmNoScript);
        }
      }
    } catch (apiError) {
      console.error('❌ Erreur API pour codes tracking:', apiError);
    }
    
    // Redirection JavaScript vers l'app React avec hash
    const redirectScript = `
<script>
  // Redirection vers l'app React si pas de hash
  if (!window.location.hash) {
    window.location.replace('/#/smartlinks/${artistSlug}/${trackSlug}');
  }
</script>`;
    
    html = html.replace('</body>', redirectScript + '</body>');
    
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