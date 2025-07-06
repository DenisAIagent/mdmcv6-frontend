/**
 * 📋 Page FAQ - Réponses claires à vos questions fréquentes
 * Route SEO: /ressources/faq
 */

import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import './ResourcesPages.css';

const FAQ = () => {
  const { t } = useTranslation();

  return (
    <HelmetProvider>
      <Helmet>
        <title>{t('faq.meta_title', 'FAQ - MDMC Music Ads')}</title>
        <meta name="description" content={t('faq.meta_description', 'Réponses aux questions fréquentes sur nos services de marketing musical')} />
        <link rel="canonical" href="https://mdmcmusicads.com/ressources/faq" />
      </Helmet>
      
      <Header />
      
      <main className="resource-page">
        <div className="resource-container">
          <div className="resource-header">
            <h1>{t('faq.title', 'FAQ — Réponses claires à vos questions fréquentes')}</h1>
            <p className="resource-subtitle">{t('faq.subtitle', 'Trouvez rapidement les réponses à vos questions sur nos services')}</p>
          </div>

          <div className="faq-content">
            <div className="faq-item">
              <h2>{t('faq.question_1', '1. Qui êtes-vous ?')}</h2>
              <div className="faq-answer">
                <p>{t('faq.answer_1_p1', 'Nous sommes MDMC Music Ads, une agence indépendante fondée en 2018 par un ancien salarié de Google, également ex-attaché de presse musique en France.')}</p>
                
                <p>{t('faq.answer_1_p2', 'Notre ADN repose sur la jonction entre la culture musicale et la maîtrise avancée des outils publicitaires numériques. Depuis plus de 6 ans, nous accompagnons des artistes, labels, festivals, agences et porteurs de projets créatifs en France, en Europe et en Amérique du Nord.')}</p>
                
                <p>{t('faq.answer_1_p3', 'Nos campagnes s\'appuient sur :')}</p>
                <ul>
                  <li>{t('faq.answer_1_li1', 'une expertise technique pointue en YouTube Ads, Meta, TikTok & tracking,')}</li>
                  <li>{t('faq.answer_1_li2', 'une compréhension fine des enjeux artistiques, culturels et commerciaux,')}</li>
                  <li>{t('faq.answer_1_li3', 'une culture du résultat : notoriété, abonnés, vues ciblées, engagement et ventes.')}</li>
                </ul>
                
                <p>{t('faq.answer_1_p4', 'Nous plaçons l\'humain, la transparence et l\'impact au cœur de chaque collaboration. Chaque campagne est conçue comme un levier de croissance réelle et durable pour les artistes et structures que nous accompagnons.')}</p>
              </div>
            </div>

            <div className="faq-item">
              <h2>{t('faq.question_2', '2. Quels services proposez-vous ?')}</h2>
              <div className="faq-answer">
                <p>{t('faq.answer_2', 'Campagnes YouTube Ads, Meta, TikTok, analyse de données et consulting stratégique.')}</p>
              </div>
            </div>

            <div className="faq-item">
              <h2>{t('faq.question_3', '3. Combien coûte une campagne ?')}</h2>
              <div className="faq-answer">
                <p>{t('faq.answer_3', 'Le coût dépend de vos objectifs, de la durée de la campagne et du budget média souhaité. Utilisez notre simulateur pour obtenir une estimation personnalisée.')}</p>
              </div>
            </div>

            <div className="faq-item">
              <h2>{t('faq.question_4', '4. Comment puis-je mesurer les résultats ?')}</h2>
              <div className="faq-answer">
                <p>{t('faq.answer_4', 'Vous avez accès à un tableau de bord complet, incluant vues, abonnés, conversions, ROAS, etc. Des bilans peuvent être fournis à chaque étape.')}</p>
              </div>
            </div>

            <div className="faq-item">
              <h2>{t('faq.question_5', '5. Travaillez-vous avec tous les styles musicaux ?')}</h2>
              <div className="faq-answer">
                <p>{t('faq.answer_5', 'Oui. Du hip-hop à la musique classique, nous adaptons nos campagnes à chaque univers artistique.')}</p>
              </div>
            </div>

            <div className="faq-item">
              <h2>{t('faq.question_6', '6. Est-ce que vous garantissez les résultats ?')}</h2>
              <div className="faq-answer">
                <p>{t('faq.answer_6', 'Non. Nous garantissons une méthode éprouvée et une optimisation continue, mais les résultats dépendent aussi de votre contenu, ciblage et budget.')}</p>
              </div>
            </div>
          </div>

          <div className="resource-cta">
            <h3>{t('faq.cta_title', 'Vous avez d\'autres questions ?')}</h3>
            <p>{t('faq.cta_text', 'Contactez-nous directement pour obtenir des réponses personnalisées.')}</p>
            <a href="mailto:contact@mdmcmusicads.com" className="resource-button">
              {t('faq.cta_button', 'Nous contacter')}
            </a>
          </div>
        </div>
      </main>
      
      <Footer />
    </HelmetProvider>
  );
};

export default FAQ;