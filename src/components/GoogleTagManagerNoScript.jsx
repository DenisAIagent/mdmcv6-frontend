import React from 'react';

const GoogleTagManagerNoScript = () => {
  return (
    <noscript>
      <iframe
        src="https://www.googletagmanager.com/ns.html?id=GTM-PFSK4LJZ"
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
        title="Google Tag Manager"
      />
    </noscript>
  );
};

export default GoogleTagManagerNoScript; 