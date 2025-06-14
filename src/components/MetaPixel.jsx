import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const MetaPixel = () => {
  const location = useLocation();

  useEffect(() => {
    // Initialisation du Pixel Meta
    window.fbq = window.fbq || function() {
      (window.fbq.q = window.fbq.q || []).push(arguments);
    };
    window.fbq('init', '1161871108956199');
    window.fbq('track', 'PageView');

    // Chargement du script Meta Pixel
    const script = document.createElement('script');
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
    `;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Suivi des changements de page
  useEffect(() => {
    window.fbq('track', 'PageView');
  }, [location]);

  return null;
};

export default MetaPixel; 