import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Initialisation de GA4
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', 'G-P11JTJ21NZ');

    // Chargement du script GA4
    const script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-P11JTJ21NZ';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Suivi des changements de page
  useEffect(() => {
    window.gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
    });
  }, [location]);

  return null;
};

export default GoogleAnalytics; 