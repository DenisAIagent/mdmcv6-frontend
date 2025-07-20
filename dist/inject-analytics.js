/**
 * 🎯 Script d'injection analytics externe
 * À charger manuellement pour tester les analytics sur www.mdmcmusicads.com
 */

(function() {
  console.log('🎯 Injection manuelle des analytics démarrée...');
  
  // 🎯 Codes de test
  const testTrackingIds = {
    ga4Id: 'G-TEST123456',
    gtmId: 'GTM-TEST123',
    metaPixelId: '123456789012345',
    tiktokPixelId: 'C4A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5'
  };
  
  // 🎯 Google Analytics 4
  if (testTrackingIds.ga4Id && !window.gtag) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${testTrackingIds.ga4Id}`;
    document.head.appendChild(script);
    
    script.onload = function() {
      window.dataLayer = window.dataLayer || [];
      function gtag(){window.dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', testTrackingIds.ga4Id, {
        page_title: document.title,
        page_location: window.location.href,
        custom_parameter: 'manual_injection_test'
      });
      console.log('🎯 GA4 injecté manuellement:', testTrackingIds.ga4Id);
    };
  }
  
  // 🎯 Google Tag Manager
  if (testTrackingIds.gtmId && !window.dataLayer) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    });
    
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${testTrackingIds.gtmId}`;
    document.head.appendChild(script);
    
    console.log('🎯 GTM injecté manuellement:', testTrackingIds.gtmId);
  }
  
  // 🎯 Meta Pixel
  if (testTrackingIds.metaPixelId && !window.fbq) {
    !function(f,b,e,v,n,t,s) {
      if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)
    }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
    
    window.fbq('init', testTrackingIds.metaPixelId);
    window.fbq('track', 'PageView');
    console.log('🎯 Meta Pixel injecté manuellement:', testTrackingIds.metaPixelId);
  }
  
  // 🎯 TikTok Pixel
  if (testTrackingIds.tiktokPixelId && !window.ttq) {
    !function (w, d, t) {
      w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
      ttq.load(testTrackingIds.tiktokPixelId);
      ttq.page();
      console.log('🎯 TikTok Pixel injecté manuellement:', testTrackingIds.tiktokPixelId);
    }(window, document, 'ttq');
  }
  
  // 🎯 Vérification après 2 secondes
  setTimeout(() => {
    console.log('🎯 Vérification des analytics injectés:');
    console.log('GA4:', !!window.gtag);
    console.log('GTM:', !!window.dataLayer);
    console.log('Meta Pixel:', !!window.fbq);
    console.log('TikTok Pixel:', !!window.ttq);
    
    if (window.gtag || window.dataLayer || window.fbq || window.ttq) {
      console.log('✅ Analytics injectés avec succès! Tag Assistant devrait les détecter.');
    } else {
      console.log('❌ Échec de l\'injection des analytics.');
    }
  }, 2000);
})();