import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/common/SEOHead';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import SimulatorOptimized from '../components/features/SimulatorOptimized';
import facebookPixel from '../services/facebookPixel.service';
import gtm from '../services/googleTagManager.service';
import '../assets/styles/simulator-page.css';

const SimulateurPage = () => {
  const simulatorRef = useRef(null);

  useEffect(() => {
    // Tracker la visite de la page simulateur
    facebookPixel.trackServicePageView('Simulateur Marketing Musical');
    gtm.trackServicePageView('Simulateur Marketing Musical');
    
    // Ouvrir automatiquement le simulateur
    if (simulatorRef.current) {
      setTimeout(() => {
        simulatorRef.current.openSimulator();
      }, 500);
    }
  }, []);

  const openSimulator = () => {
    if (simulatorRef.current) {
      simulatorRef.current.openSimulator();
    }
  };

  const simulatorSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Simulateur Marketing Musical MDMC",
    "description": "Outil gratuit de simulation de campagnes publicitaires pour artistes et musiciens. Découvrez votre potentiel sur YouTube, Meta et TikTok en 2 minutes.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR",
      "description": "Simulateur gratuit de campagnes marketing musical"
    },
    "provider": {
      "@type": "LocalBusiness",
      "name": "MDMC Music Ads",
      "url": "https://www.mdmcmusicads.com"
    },
    "featureList": [
      "Simulation YouTube Ads",
      "Simulation Meta Ads",
      "Simulation TikTok Ads",
      "Calcul ROI musical",
      "Estimation abonnés",
      "Ciblage géographique"
    ],
    "screenshot": "https://www.mdmcmusicads.com/assets/images/simulateur-screenshot.jpg",
    "softwareVersion": "2.0",
    "datePublished": "2025-01-15",
    "dateModified": "2025-01-23",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "547",
      "bestRating": "5"
    }
  };

  return (
    <>
      <SEOHead
        title="Simulateur Marketing Musical Gratuit | MDMC Music Ads - Découvrez Votre Potentiel"
        description="🎯 Simulateur GRATUIT : Découvrez en 2 minutes votre potentiel sur YouTube, Meta et TikTok. Estimation précise de vos futures performances publicitaires. +500 artistes nous font confiance !"
        keywords="simulateur marketing musical, calculateur campagne musique, simulation YouTube ads, estimation Meta ads, TikTok promotion, ROI musical, budget campagne artiste, marketing digital musique"
        url="https://www.mdmcmusicads.com/simulateur"
        canonicalUrl="https://www.mdmcmusicads.com/simulateur"
        structuredData={simulatorSchema}
        ogImage="https://www.mdmcmusicads.com/assets/images/simulateur-og.jpg"
      />
      
      <Header />
      
      <main className="simulator-page">
        {/* Hero Section */}
        <section className="simulator-hero">
          <div className="container">
            <div className="hero-content">
              <div className="hero-badges">
                <span className="badge-fire">🔥 +547 artistes ont découvert leur potentiel</span>
                <span className="badge-verified">✅ Données réelles certifiées</span>
              </div>
              
              <h1 className="hero-title">
                <span className="highlight">Découvrez GRATUITEMENT</span>
                <br />le Potentiel de Votre Musique
              </h1>
              
              <p className="hero-subtitle">
                En seulement <strong>2 minutes</strong>, obtenez une estimation précise de vos futures performances publicitaires sur YouTube, Meta et TikTok
              </p>
              
              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-number">+300%</span>
                  <span className="stat-label">Augmentation moyenne des streams</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">94%</span>
                  <span className="stat-label">Précision validée par nos clients</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">2min</span>
                  <span className="stat-label">Temps nécessaire</span>
                </div>
              </div>
              
              <div className="hero-cta">
                <button 
                  className="btn-hero-primary" 
                  onClick={openSimulator}
                >
                  🚀 LANCER MON SIMULATION GRATUITE
                </button>
                <p className="cta-disclaimer">
                  💡 Aucune carte bancaire requise • Résultats instantanés
                </p>
              </div>
            </div>
            
            <div className="hero-visual">
              <div className="simulator-preview">
                <div className="preview-screen">
                  <div className="preview-header">
                    <div className="preview-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span className="preview-title">Simulateur MDMC</span>
                  </div>
                  <div className="preview-content">
                    <div className="preview-step active">
                      <h4>🎬 Plateforme</h4>
                      <div className="preview-options">
                        <div className="option selected">YouTube</div>
                        <div className="option">Meta</div>
                        <div className="option">TikTok</div>
                      </div>
                    </div>
                    <div className="preview-results">
                      <div className="result-preview">
                        <span>🎵 Vues estimées</span>
                        <strong>25,847</strong>
                      </div>
                      <div className="result-preview">
                        <span>👥 Portée</span>
                        <strong>64,618</strong>
                      </div>
                      <div className="result-preview">
                        <span>📈 Abonnés</span>
                        <strong>1,639</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="simulator-benefits">
          <div className="container">
            <h2>Pourquoi utiliser notre simulateur ?</h2>
            <div className="benefits-grid">
              <div className="benefit-card">
                <div className="benefit-icon">🎯</div>
                <h3>Estimation Précise</h3>
                <p>Basé sur +1000 campagnes réelles, notre algorithme vous donne une estimation fiable de vos performances futures.</p>
                <div className="benefit-stat">94% de précision validée</div>
              </div>
              
              <div className="benefit-card">
                <div className="benefit-icon">⚡</div>
                <h3>Résultats Instantanés</h3>
                <p>En moins de 2 minutes, découvrez votre potentiel sur YouTube, Meta et TikTok avec des données personnalisées.</p>
                <div className="benefit-stat">+547 simulations réalisées</div>
              </div>
              
              <div className="benefit-card">
                <div className="benefit-icon">💎</div>
                <h3>Stratégie Personnalisée</h3>
                <p>Recevez des recommandations d'experts adaptées à votre style musical et votre budget marketing.</p>
                <div className="benefit-stat">Conseils d'experts inclus</div>
              </div>
              
              <div className="benefit-card">
                <div className="benefit-icon">📊</div>
                <h3>Données Multi-Plateformes</h3>
                <p>Comparez les performances entre YouTube, Meta et TikTok pour choisir la meilleure stratégie.</p>
                <div className="benefit-stat">3 plateformes analysées</div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works">
          <div className="container">
            <h2>Comment ça marche ?</h2>
            <div className="steps-timeline">
              <div className="step-item">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>🎬 Choisissez votre plateforme</h3>
                  <p>Sélectionnez entre YouTube, Meta (Facebook/Instagram) ou TikTok selon vos objectifs.</p>
                </div>
              </div>
              
              <div className="step-item">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>🎯 Définissez votre objectif</h3>
                  <p>Notoriété, engagement ou conversion : choisissez ce qui correspond à vos besoins.</p>
                </div>
              </div>
              
              <div className="step-item">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>💰 Indiquez votre budget</h3>
                  <p>Saisissez votre budget marketing pour obtenir des estimations réalistes.</p>
                </div>
              </div>
              
              <div className="step-item">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3>🌍 Sélectionnez votre zone</h3>
                  <p>Europe, USA, Canada... choisissez votre marché cible géographique.</p>
                </div>
              </div>
              
              <div className="step-item">
                <div className="step-number">5</div>
                <div className="step-content">
                  <h3>📧 Recevez vos résultats</h3>
                  <p>Obtenez instantanément vos estimations et un appel stratégique gratuit avec nos experts.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="social-proof">
          <div className="container">
            <h2>Ils ont découvert leur potentiel avec MDMC</h2>
            <div className="testimonials-carousel">
              <div className="testimonial-slide active">
                <div className="testimonial-content">
                  <div className="stars">⭐⭐⭐⭐⭐</div>
                  <blockquote>
                    "If you want to make a difference and gain visibility while receiving support, don't hesitate for a single second!"
                  </blockquote>
                  <div className="testimonial-author">
                    <strong>Dealer 2Metal</strong>
                    <span>Artiste Metal • Vérifié ✅</span>
                  </div>
                </div>
              </div>
              
              <div className="testimonial-slide">
                <div className="testimonial-content">
                  <div className="stars">⭐⭐⭐⭐⭐</div>
                  <blockquote>
                    "Great job, great person, great everything. MDMC + Denis + Good Music = Great Job & Results"
                  </blockquote>
                  <div className="testimonial-author">
                    <strong>Emilie Delchambre</strong>
                    <span>Artiste Pop • Client MDMC</span>
                  </div>
                </div>
              </div>
              
              <div className="testimonial-slide">
                <div className="testimonial-content">
                  <div className="stars">⭐⭐⭐⭐⭐</div>
                  <blockquote>
                    "I had the pleasure of collaborating with MDMC Music Ads on a YouTube promotion campaign. The experience and professionalism offered were invaluable and delivered the desired results. I highly recommend them!"
                  </blockquote>
                  <div className="testimonial-author">
                    <strong>Fabienne Roth</strong>
                    <span>Artiste Soul • Vérifié ✅</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="social-stats">
              <div className="social-stat">
                <span className="stat-number">4.9/5</span>
                <span className="stat-label">Note moyenne clients</span>
              </div>
              <div className="social-stat">
                <span className="stat-number">+500</span>
                <span className="stat-label">Campagnes réalisées</span>
              </div>
              <div className="social-stat">
                <span className="stat-number">25+</span>
                <span className="stat-label">Pays couverts</span>
              </div>
              <div className="social-stat">
                <span className="stat-number">50M+</span>
                <span className="stat-label">Vues générées</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="final-cta">
          <div className="container">
            <div className="cta-content">
              <h2>
                <span className="cta-emoji">🎯</span>
                Prêt à découvrir votre potentiel musical ?
              </h2>
              <p>
                Rejoignez les <strong>+547 artistes</strong> qui ont déjà découvert leur potentiel avec notre simulateur gratuit
              </p>
              
              <div className="urgency-indicator">
                <span className="urgency-icon">⏱️</span>
                <span>Simulation gratuite • Résultats en 2 minutes • Aucun engagement</span>
              </div>
              
              <button 
                className="btn-final-cta" 
                onClick={openSimulator}
              >
                🚀 LANCER MA SIMULATION MAINTENANT
              </button>
              
              <div className="cta-guarantees">
                <div className="guarantee">
                  <span className="guarantee-icon">🔒</span>
                  <span>100% sécurisé</span>
                </div>
                <div className="guarantee">
                  <span className="guarantee-icon">⚡</span>
                  <span>Résultats instantanés</span>
                </div>
                <div className="guarantee">
                  <span className="guarantee-icon">💎</span>
                  <span>Conseils d'experts inclus</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="simulator-faq">
          <div className="container">
            <h2>Questions fréquentes</h2>
            <div className="faq-grid">
              <div className="faq-item">
                <h3>🤔 Le simulateur est-il vraiment gratuit ?</h3>
                <p>Oui, 100% gratuit ! Aucune carte bancaire requise. Vous obtenez instantanément vos estimations et pouvez choisir de planifier un appel gratuit avec nos experts.</p>
              </div>
              
              <div className="faq-item">
                <h3>📊 Quelle est la précision des estimations ?</h3>
                <p>Nos estimations ont une précision de 94%, validée par nos clients. Elles sont basées sur +1000 campagnes réelles et mises à jour régulièrement.</p>
              </div>
              
              <div className="faq-item">
                <h3>⏱️ Combien de temps prend la simulation ?</h3>
                <p>Moins de 2 minutes ! Le simulateur est optimisé pour être rapide et intuitif. Vous obtenez vos résultats instantanément après avoir rempli 5 étapes simples.</p>
              </div>
              
              <div className="faq-item">
                <h3>🎵 Pour quels genres musicaux ?</h3>
                <p>Tous les genres ! Pop, rap, rock, électro, jazz... Notre simulateur s'adapte à tous les styles musicaux et audiences.</p>
              </div>
              
              <div className="faq-item">
                <h3>🌍 Quelles zones géographiques ?</h3>
                <p>Europe, États-Unis, Canada, Amérique du Sud et Asie. Chaque zone a ses spécificités tarifaires et d'audience que nous prenons en compte.</p>
              </div>
              
              <div className="faq-item">
                <h3>💰 Quel budget minimum ?</h3>
                <p>Le budget minimum est de 500€ pour obtenir des résultats significatifs. Nous proposons des stratégies adaptées à tous les budgets, du starter au premium.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      
      {/* Simulateur en overlay */}
      <SimulatorOptimized ref={simulatorRef} />
    </>
  );
};

export default SimulateurPage;