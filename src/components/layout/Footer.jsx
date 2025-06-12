import { useTranslation } from 'react-i18next';
import '../../assets/styles/footer.css';

const Footer = ({ openSimulator }) => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  
  const handleSimulatorClick = () => {
    if (openSimulator) {
      openSimulator();
    }
  };
  
  const handleCookieClick = () => {
    // Cette fonction sera implémentée plus tard pour ouvrir la bannière de cookies
    const cookieBanner = document.getElementById('cookie-banner');
    if (cookieBanner) {
      cookieBanner.style.display = 'block';
    }
  };

  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-brand">
          <a href="#hero" aria-label="MDMC - Retour à l'accueil">
            <img src="/assets/images/logo.png" alt="MDMC Logo" />
          </a>
          <p>{t('footer.logo_p')}</p>
          <div className="google-partner">
            <a 
              href="https://www.google.com/partners/agency?id=3215385696" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label={t('contact.partner_google_aria_label')}
            >
              <img 
                src="https://www.gstatic.com/partners/badge/images/2024/PartnerBadgeClickable.svg" 
                alt={t('contact.partners.google_badge_alt')} 
                loading="lazy" 
              />
            </a>
          </div>
        </div>
        
        <div className="footer-links">
          <div className="footer-column">
            <h4>{t('footer.nav_title')}</h4>
            <ul>
              <li><a href="#hero">{t('footer.nav_home')}</a></li>
              <li><a href="#services">{t('nav.services')}</a></li>
              <li><a href="#about">{t('nav.about')}</a></li>
              <li><a href="#articles">{t('nav.articles')}</a></li>
              <li><a href="#contact">{t('nav.contact')}</a></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h4>{t('footer.resources_title')}</h4>
            <ul>
              <li><a href="#articles">{t('footer.resources_blog')}</a></li>
              <li>
                <button 
                  type="button" 
                  className="btn-link-style" 
                  onClick={handleSimulatorClick}
                >
                  {t('footer.resources_simulator')}
                </button>
              </li>
              <li><a href="#">{t('footer.resources_faq')}</a></li>
              <li><a href="#">{t('footer.resources_glossary')}</a></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h4>{t('footer.legal_title')}</h4>
            <ul>
              <li><a href="#">{t('footer.legal_privacy')}</a></li>
              <li><a href="#">{t('footer.legal_terms')}</a></li>
              <li>
                <button 
                  type="button" 
                  className="btn-link-style" 
                  onClick={handleCookieClick}
                >
                  {t('footer.legal_cookies')}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {currentYear} {t('footer.copyright')}</p>
      </div>
    </footer>
  );
};

export default Footer;
