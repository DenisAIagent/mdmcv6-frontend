/**
 * 📘 Page Glossaire - Comprendre le langage du marketing musical
 * Route SEO: /ressources/glossaire
 */

import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import './ResourcesPages.css';

const Glossaire = () => {
  const { t } = useTranslation();

  return (
    <HelmetProvider>
      <Helmet>
        <title>{t('glossaire.meta_title', 'Glossaire - MDMC Music Ads')}</title>
        <meta name="description" content={t('glossaire.meta_description', 'Glossaire complet du marketing musical : CPV, ROAS, SmartLink et tous les termes techniques')} />
        <link rel="canonical" href="https://mdmcmusicads.com/ressources/glossaire" />
      </Helmet>
      
      <Header />
      
      <main className="resource-page">
        <div className="resource-container">
          <div className="resource-header">
            <h1>{t('glossaire.title', 'Glossaire — Comprendre le langage du marketing musical')}</h1>
            <p className="resource-subtitle">{t('glossaire.subtitle', 'Définitions des termes techniques du marketing digital musical')}</p>
          </div>

          <div className="glossaire-content">
            <div className="glossaire-item">
              <h3>{t('glossaire.term_cpv', 'CPV (Coût par Vue)')}</h3>
              <p>{t('glossaire.def_cpv', 'Montant payé chaque fois qu\'un internaute visionne votre vidéo sponsorisée.')}</p>
            </div>

            <div className="glossaire-item">
              <h3>{t('glossaire.term_roas', 'ROAS (Return On Ad Spend)')}</h3>
              <p>{t('glossaire.def_roas', 'Retour sur investissement publicitaire.')}</p>
            </div>

            <div className="glossaire-item">
              <h3>{t('glossaire.term_smartlink', 'SmartLink')}</h3>
              <p>{t('glossaire.def_smartlink', 'Lien unique regroupant vos plateformes de streaming, réseaux et boutique.')}</p>
            </div>

            <div className="glossaire-item">
              <h3>{t('glossaire.term_lookalike', 'Lookalike Audience')}</h3>
              <p>{t('glossaire.def_lookalike', 'Audience similaire à la vôtre, générée automatiquement.')}</p>
            </div>

            <div className="glossaire-item">
              <h3>{t('glossaire.term_ab_testing', 'A/B Testing')}</h3>
              <p>{t('glossaire.def_ab_testing', 'Test comparatif pour améliorer les performances.')}</p>
            </div>

            <div className="glossaire-item">
              <h3>{t('glossaire.term_retargeting', 'Retargeting')}</h3>
              <p>{t('glossaire.def_retargeting', 'Reciblage d\'utilisateurs ayant déjà interagi avec vous.')}</p>
            </div>

            <div className="glossaire-item">
              <h3>{t('glossaire.term_conversion', 'Conversion')}</h3>
              <p>{t('glossaire.def_conversion', 'Objectif atteint (abonnement, achat, vue complète, etc.).')}</p>
            </div>

            <div className="glossaire-item">
              <h3>{t('glossaire.term_tracking', 'Tracking')}</h3>
              <p>{t('glossaire.def_tracking', 'Mesure des actions utilisateurs via pixels, balises ou événements.')}</p>
            </div>
          </div>

          <div className="resource-cta">
            <h3>{t('glossaire.cta_title', 'Besoin d\'explications supplémentaires ?')}</h3>
            <p>{t('glossaire.cta_text', 'Notre équipe peut vous accompagner dans la compréhension de ces concepts.')}</p>
            <a href="mailto:contact@mdmcmusicads.com" className="resource-button">
              {t('glossaire.cta_button', 'Demander un accompagnement')}
            </a>
          </div>
        </div>
      </main>
      
      <Footer />
    </HelmetProvider>
  );
};

export default Glossaire;