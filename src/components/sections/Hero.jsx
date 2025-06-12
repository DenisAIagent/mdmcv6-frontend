import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef } from 'react';
import '../../assets/styles/hero.css';

const Hero = ({ openSimulator }) => {
  const { t } = useTranslation();
  const [counts, setCounts] = useState({
    campaigns: 0,
    artists: 0,
    views: 0,
    countries: 0
  });
  
  const targetCounts = {
    campaigns: 500,
    artists: 200,
    views: 50,
    countries: 25
  };
  
  const countersRef = useRef(null);
  const hasAnimated = useRef(false);
  
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    };
    
    const handleIntersect = (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && !hasAnimated.current) {
        hasAnimated.current = true;
        animateCounters();
      }
    };
    
    const observer = new IntersectionObserver(handleIntersect, options);
    
    if (countersRef.current) {
      observer.observe(countersRef.current);
    }
    
    return () => {
      if (countersRef.current) {
        observer.unobserve(countersRef.current);
      }
    };
  }, []);
  
  const animateCounters = () => {
    const duration = 2500; // 2.5 secondes
    const frameDuration = 1000 / 60; // 60 FPS
    const totalFrames = Math.round(duration / frameDuration);
    let frame = 0;
    
    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      
      setCounts({
        campaigns: Math.floor(targetCounts.campaigns * progress),
        artists: Math.floor(targetCounts.artists * progress),
        views: Math.floor(targetCounts.views * progress),
        countries: Math.floor(targetCounts.countries * progress)
      });
      
      if (frame === totalFrames) {
        clearInterval(counter);
        setCounts(targetCounts);
      }
    }, frameDuration);
  };

  return (
    <section id="hero" className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <h1>{t('hero.title')}</h1>
          <p className="hero-slogan red-text">{t('hero.slogan')}</p>
          <p className="hero-description">{t('hero.description')}</p>
          <div className="cta-container">
            <button onClick={openSimulator} className="btn btn-primary" id="simulator-trigger">{t('simulator.title')}</button>
            <a href="#contact" className="btn btn-secondary">{t('nav.contact')}</a>
          </div>
        </div>
        
        <div className="hero-stats" ref={countersRef}>
          <div className="stat-item">
            <span className="stat-number">{counts.campaigns}+</span>
            <span className="stat-label">{t('hero.stats.campaigns')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{counts.artists}+</span>
            <span className="stat-label">{t('hero.stats.artists')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{counts.views}M+</span>
            <span className="stat-label">{t('hero.stats.views')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{counts.countries}+</span>
            <span className="stat-label">{t('hero.stats.countries')}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
