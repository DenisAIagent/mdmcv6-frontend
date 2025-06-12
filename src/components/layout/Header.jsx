import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../common/LanguageSelector';
// Assurez-vous que le chemin vers le CSS est correct
import '../../assets/styles/header.css';

const Header = () => {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Gestion du scroll pour changer l'apparence du header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Fermer le menu mobile lors du clic sur un lien
  const handleNavLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container header-container">
        <div className="logo">
          <a href="#hero" aria-label="MDMC - Retour à l'accueil">
            {/* === Chemin du logo CORRIGÉ === */}
            <img src="/assets/images/logo.png" alt="MDMC Logo" />
            {/* ============================== */}
          </a>
        </div>

        <nav className="nav-desktop">
          <ul>
            <li><a href="#hero" onClick={handleNavLinkClick}>{t('nav.home')}</a></li>
            <li><a href="#services" onClick={handleNavLinkClick}>{t('nav.services')}</a></li>
            <li><a href="#about" onClick={handleNavLinkClick}>{t('nav.about')}</a></li>
            <li><a href="#articles" onClick={handleNavLinkClick}>{t('nav.articles')}</a></li>
            <li><a href="#contact" onClick={handleNavLinkClick}>{t('nav.contact')}</a></li>
            <li><LanguageSelector /></li>
          </ul>
        </nav>

        <button
          className={`hamburger-menu ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        <nav className={`nav-mobile ${isMobileMenuOpen ? 'active' : ''}`}>
          <ul>
            <li><a href="#hero" onClick={handleNavLinkClick}>{t('nav.home')}</a></li>
            <li><a href="#services" onClick={handleNavLinkClick}>{t('nav.services')}</a></li>
            <li><a href="#about" onClick={handleNavLinkClick}>{t('nav.about')}</a></li>
            <li><a href="#articles" onClick={handleNavLinkClick}>{t('nav.articles')}</a></li>
            <li><a href="#contact" onClick={handleNavLinkClick}>{t('nav.contact')}</a></li>
            <li className="mobile-language-selector-container">
              <LanguageSelector />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
