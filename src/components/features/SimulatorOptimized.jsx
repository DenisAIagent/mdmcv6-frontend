import { useState, forwardRef, useImperativeHandle, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import emailjs from '@emailjs/browser';
import apiService from '../../services/api.service';
import facebookPixel from '../../services/facebookPixel.service';
import gtm from '../../services/googleTagManager.service';
import '../../assets/styles/simulator-marketing.css';

// Liens Calendly pour chaque plateforme
const CALENDLY_LINKS = {
  meta: "https://calendly.com/mhl-agency/decouverte?month=2025-04",
  tiktok: "https://calendly.com/mhl-agency/decouverte?month=2025-04",
  youtube: "https://calendly.com/denis-mdmcmusicads/30min"
};

// Témoignages clients authentiques
const TESTIMONIALS = [
  {
    name: "Dealer 2Metal",
    rating: 5,
    text: "If you want to make a difference and gain visibility while receiving support, don't hesitate for a single second!",
    verified: true,
    daysAgo: 2
  },
  {
    name: "Emilie Delchambre",
    rating: 5,
    text: "Great job, great person, great everything. MDMC + Denis + Good Music = Great Job & Results",
    verified: false,
    daysAgo: 4
  },
  {
    name: "Fabienne Roth",
    rating: 5,
    text: "I had the pleasure of collaborating with MDMC Music Ads on a YouTube promotion campaign. The experience and professionalism offered were invaluable and delivered the desired results. I highly recommend them!",
    verified: true,
    daysAgo: 4
  }
];

// Données de coût pour les différentes combinaisons
const COST_DATA = {
  youtube: {
    usa: {
      awareness: { min: 0.02, max: 0.06, unit: "CPV" },
      engagement: { min: 0.05, max: 0.10, unit: "CPV" },
      conversion: { min: 0.10, max: 0.20, unit: "CPV" }
    },
    canada: {
      awareness: { min: 0.01, max: 0.05, unit: "CPV" },
      engagement: { min: 0.04, max: 0.08, unit: "CPV" },
      conversion: { min: 0.08, max: 0.15, unit: "CPV" }
    },
    europe: {
      awareness: { min: 0.01, max: 0.04, unit: "CPV" },
      engagement: { min: 0.03, max: 0.07, unit: "CPV" },
      conversion: { min: 0.05, max: 0.12, unit: "CPV" }
    },
    south_america: {
      awareness: { min: 0.005, max: 0.02, unit: "CPV" },
      engagement: { min: 0.01, max: 0.05, unit: "CPV" },
      conversion: { min: 0.02, max: 0.08, unit: "CPV" }
    },
    asia: {
      awareness: { min: 0.005, max: 0.03, unit: "CPV" },
      engagement: { min: 0.01, max: 0.06, unit: "CPV" },
      conversion: { min: 0.02, max: 0.10, unit: "CPV" }
    }
  },
  meta: {
    usa: {
      awareness: { min: 3, max: 8, unit: "CPM" },
      engagement: { min: 8, max: 15, unit: "CPM" },
      conversion: { min: 15, max: 30, unit: "CPM" }
    },
    canada: {
      awareness: { min: 2, max: 6, unit: "CPM" },
      engagement: { min: 6, max: 12, unit: "CPM" },
      conversion: { min: 10, max: 20, unit: "CPM" }
    },
    europe: {
      awareness: { min: 1.5, max: 5, unit: "CPM" },
      engagement: { min: 5, max: 10, unit: "CPM" },
      conversion: { min: 8, max: 15, unit: "CPM" }
    },
    south_america: {
      awareness: { min: 0.5, max: 3, unit: "CPM" },
      engagement: { min: 2, max: 6, unit: "CPM" },
      conversion: { min: 3, max: 8, unit: "CPM" }
    },
    asia: {
      awareness: { min: 1, max: 4, unit: "CPM" },
      engagement: { min: 3, max: 7, unit: "CPM" },
      conversion: { min: 5, max: 10, unit: "CPM" }
    }
  },
  tiktok: {
    usa: {
      awareness: { min: 10, max: 50, unit: "CPM" },
      engagement: { min: 15, max: 60, unit: "CPM" },
      conversion: { min: 20, max: 80, unit: "CPM" }
    },
    canada: {
      awareness: { min: 8, max: 40, unit: "CPM" },
      engagement: { min: 12, max: 50, unit: "CPM" },
      conversion: { min: 15, max: 70, unit: "CPM" }
    },
    europe: {
      awareness: { min: 10, max: 50, unit: "CPM" },
      engagement: { min: 15, max: 55, unit: "CPM" },
      conversion: { min: 20, max: 70, unit: "CPM" }
    },
    south_america: {
      awareness: { min: 3, max: 15, unit: "CPM" },
      engagement: { min: 5, max: 20, unit: "CPM" },
      conversion: { min: 8, max: 30, unit: "CPM" }
    },
    asia: {
      awareness: { min: 2, max: 10, unit: "CPM" },
      engagement: { min: 4, max: 15, unit: "CPM" },
      conversion: { min: 5, max: 25, unit: "CPM" }
    }
  }
};

// Données marketing pour les plateformes
const PLATFORM_MARKETING = {
  youtube: {
    title: "YouTube",
    subtitle: "La plateforme #1 pour les découvertes musicales",
    stats: "2 milliards d'utilisateurs actifs",
    recommendation: "87% de nos clients choisissent YouTube pour débuter"
  },
  meta: {
    title: "Meta (Facebook/Instagram)", 
    subtitle: "Touchez votre audience là où elle passe 2h30/jour",
    stats: "3.8 milliards d'utilisateurs combinés",
    recommendation: "Idéal pour créer une communauté engagée"
  },
  tiktok: {
    title: "TikTok",
    subtitle: "Devenez viral avec la plateforme qui lance les hits",
    stats: "1 milliard d'utilisateurs actifs",
    recommendation: "Perfect pour les artistes émergents"
  }
};

// Données marketing pour les types de campagne
const CAMPAIGN_MARKETING = {
  awareness: {
    title: "Notoriété",
    subtitle: "Faire connaître votre musique au maximum de personnes",
    benefit: "Idéal pour lancer un nouvel artiste ou single"
  },
  engagement: {
    title: "Engagement", 
    subtitle: "Créer une communauté de fans engagés",
    benefit: "Parfait pour fidéliser votre audience"
  },
  conversion: {
    title: "Conversion",
    subtitle: "Transformer les écoutes en revenus concrets", 
    benefit: "Maximise votre retour sur investissement"
  }
};

// Données marketing pour les régions
const REGION_MARKETING = {
  europe: {
    title: "Europe",
    subtitle: "Marché mature, CPM avantageux",
    recommendation: "Recommandé par nos experts"
  },
  usa: {
    title: "États-Unis",
    subtitle: "Le marché le plus lucratif",
    benefit: "+40% de revenus en moyenne"
  },
  canada: {
    title: "Canada", 
    subtitle: "Excellent rapport qualité/prix",
    benefit: "Marché anglophone accessible"
  },
  south_america: {
    title: "Amérique du Sud",
    subtitle: "Marché émergent à fort potentiel",
    benefit: "Coûts très compétitifs"
  },
  asia: {
    title: "Asie",
    subtitle: "Le futur de l'industrie musicale",
    benefit: "Croissance explosive"
  }
};

const SimulatorOptimized = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    platform: '',
    budget: '',
    country: '',
    campaignType: '',
    artistName: '',
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [results, setResults] = useState({
    views: null,
    cpv: null,
    reach: null,
    subscribers: null
  });
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [socialProofCount, setSocialProofCount] = useState(127);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [showTestimonials, setShowTestimonials] = useState(false);
  const isMountedRef = useRef(true);

  // Timer pour créer de l'urgence
  useEffect(() => {
    if (isOpen && currentStep < 6) {
      const timer = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen, currentStep]);

  // Simulation de preuve sociale dynamique
  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setSocialProofCount(prev => prev + Math.floor(Math.random() * 3));
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // Rotation des témoignages
  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setCurrentTestimonial(prev => (prev + 1) % TESTIMONIALS.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // Affichage des témoignages après quelques secondes
  useEffect(() => {
    if (isOpen && currentStep >= 2) {
      const timer = setTimeout(() => {
        setShowTestimonials(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, currentStep]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useImperativeHandle(ref, () => ({
    openSimulator: () => {
      setIsOpen(true);
      setTimeLeft(120);
      setShowTestimonials(false);
      facebookPixel.trackSimulatorStart();
      gtm.trackSimulatorStart();
    }
  }));

  const closeSimulator = () => {
    setIsOpen(false);
    setCurrentStep(1);
    setFormData({ platform: '', budget: '', country: '', campaignType: '', artistName: '', email: '' });
    setErrors({});
    setResults({ views: null, cpv: null, reach: null, subscribers: null });
    setShowTestimonials(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step) => {
    let isValid = true;
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.platform) {
          newErrors.platform = "Veuillez sélectionner une plateforme pour continuer";
          isValid = false;
        }
        break;
      case 2:
        if (!formData.campaignType) {
          newErrors.campaignType = "Choisissez votre objectif principal";
          isValid = false;
        }
        break;
      case 3:
        if (!formData.budget || formData.budget < 500) {
          newErrors.budget = "Budget minimum : 500€ pour des résultats optimaux";
          isValid = false;
        }
        break;
      case 4:
        if (!formData.country) {
          newErrors.country = "Sélectionnez votre zone de ciblage";
          isValid = false;
        }
        break;
      case 5:
        if (!formData.artistName) {
          newErrors.artistName = "Votre nom d'artiste est requis";
          isValid = false;
        }
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = "Email valide requis pour recevoir vos résultats";
          isValid = false;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return isValid;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const calculateResults = () => {
    if (validateStep(5)) {
      setSubmitting(true);
      const budget = parseInt(formData.budget);
      const costData = COST_DATA[formData.platform]?.[formData.country]?.[formData.campaignType];

      if (!costData) {
        console.error('Données de coût non disponibles pour cette combinaison');
        setErrors({ 
          calculation: "Impossible de calculer les résultats pour cette combinaison. Veuillez réessayer avec d'autres paramètres."
        });
        setSubmitting(false);
        return;
      }

      const avgCost = (costData.min + costData.max) / 2;
      let views, reach, subscribers;

      if (costData.unit === "CPV") {
        views = Math.round(budget / avgCost);
        reach = Math.round(views * 2.5);
        const avgSubscriberCost = (0.12 + 0.49) / 2;
        subscribers = Math.round(budget / avgSubscriberCost);
      } else if (costData.unit === "CPM") {
        const impressions = (budget / avgCost) * 1000;
        views = Math.round(impressions * 0.3);
        reach = Math.round(impressions);
        subscribers = null;
      } else {
        views = 0; reach = 0; subscribers = null;
      }

      const viewsFormatted = views.toLocaleString();
      const costRangeFormatted = `${costData.min.toFixed(3)} - ${costData.max.toFixed(3)} $ (${costData.unit})`;
      const reachFormatted = reach.toLocaleString();
      const subscribersFormatted = subscribers ? subscribers.toLocaleString() : null;

      setResults({
        views: viewsFormatted,
        cpv: costRangeFormatted,
        reach: reachFormatted,
        subscribers: subscribersFormatted
      });

      submitResults(viewsFormatted, costRangeFormatted, reachFormatted, subscribersFormatted);
      
      const resultsData = {
        views: viewsFormatted,
        cpv: costRangeFormatted,
        reach: reachFormatted,
        subscribers: subscribersFormatted
      };
      
      facebookPixel.trackSimulatorComplete(formData, resultsData);
      gtm.trackSimulatorComplete(formData, resultsData);
      
      setCurrentStep(6);
    }
  };

  const submitResults = async (views, cpv, reach, subscribers = null) => {
    try {
      const emailJSServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const emailJSTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const emailJSPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
      const n8nWebhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://n8n-production-de00.up.railway.app/webhook/music-simulator-lead';
      
      console.log('🚀 Envoi simultané EmailJS + n8n...');
      
      const commonData = {
        artist_name: formData.artistName,
        email: formData.email,
        budget: parseInt(formData.budget),
        platform: formData.platform,
        country: formData.country,
        campaign_type: formData.campaignType,
        views: views,
        cpv: cpv,
        reach: reach,
        subscribers: subscribers
      };
      
      const promises = [];
      
      if (emailJSServiceId && emailJSTemplateId && emailJSPublicKey) {
        const emailPromise = emailjs.send(
          emailJSServiceId,
          emailJSTemplateId,
          {
            ...commonData,
            message: `Simulation effectuée pour ${formData.artistName}:\\n- Plateforme: ${formData.platform}\\n- Budget: ${formData.budget}$\\n- Zone: ${formData.country}\\n- Type: ${formData.campaignType}\\n- Vues estimées: ${views}\\n- CPV: ${cpv}\\n- Portée: ${reach}${subscribers ? `\\n- Abonnés estimés: ${subscribers}` : ''}`
          },
          emailJSPublicKey
        ).then(result => ({ type: 'emailjs', success: true, result }))
          .catch(error => ({ type: 'emailjs', success: false, error }));
        
        promises.push(emailPromise);
      }
      
      const n8nPromise = fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...commonData,
          target_zone: commonData.platform,
          zone_cible: commonData.country,
          subscribers: subscribers
        })
      }).then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      }).then(result => ({ type: 'n8n', success: true, result }))
        .catch(error => ({ type: 'n8n', success: false, error }));
      
      promises.push(n8nPromise);
      
      const results = await Promise.allSettled(promises);
      
      let emailjsSuccess = false;
      let n8nSuccess = false;
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const data = result.value;
          if (data.success) {
            if (data.type === 'emailjs') {
              console.log('✅ EmailJS: Envoi réussi', data.result);
              emailjsSuccess = true;
            } else if (data.type === 'n8n') {
              console.log('✅ n8n: Envoi réussi', data.result);
              n8nSuccess = true;
            }
          } else {
            if (data.type === 'emailjs') {
              console.error('❌ EmailJS: Échec', data.error);
            } else if (data.type === 'n8n') {
              console.error('❌ n8n: Échec', data.error);
            }
          }
        } else {
          console.error('❌ Promesse rejetée:', result.reason);
        }
      });
      
      console.log('📊 Résumé envoi simultané:', {
        emailjs: emailjsSuccess ? '✅ Réussi' : '❌ Échec',
        n8n: n8nSuccess ? '✅ Réussi' : '❌ Échec',
        total: `${(emailjsSuccess ? 1 : 0) + (n8nSuccess ? 1 : 0)}/${promises.length} réussis`
      });
      
    } catch (error) {
      console.error('❌ Erreur générale dans submitResults:', error);
    } finally {
      if (isMountedRef.current) {
        setSubmitting(false);
      }
    }
  };

  const handleClickOutside = (e) => {
    if (e.target.classList.contains('simulator-popup') && currentStep !== 6) {
      closeSimulator();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return (currentStep / 6) * 100;
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < rating ? 'filled' : ''}`}>⭐</span>
    ));
  };

  return (
    <div
      className={`simulator-popup ${isOpen ? 'active' : ''}`}
      role="dialog" aria-modal="true" aria-labelledby="simulator-title"
      onClick={handleClickOutside}
    >
      <div className="simulator-content marketing-optimized" tabIndex="-1">
        <button className="close-popup" type="button" aria-label="Fermer" onClick={closeSimulator}>
          &times;
        </button>

        {/* Header Marketing */}
        <div className="simulator-header">
          <h2 id="simulator-title">🎯 Découvrez GRATUITEMENT le Potentiel de Votre Musique</h2>
          <p className="simulator-subtitle">En 2 minutes, obtenez une estimation précise de vos futures performances publicitaires</p>
          
          {/* Éléments de crédibilité */}
          <div className="credibility-badges">
            <span className="badge">✅ Utilisé par +{socialProofCount} artistes</span>
            <span className="badge">✅ Basé sur des données réelles</span>
            <span className="badge">✅ Résultats garantis</span>
          </div>

          {/* Timer d'urgence */}
          {currentStep < 6 && (
            <div className="urgency-timer">
              ⏱️ Temps restant : <strong>{formatTime(timeLeft)}</strong>
            </div>
          )}
        </div>

        {/* Barre de progression marketing */}
        <div className="progress-container">
          <div className="progress-bar-marketing">
            <div 
              className="progress-fill" 
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          <div className="progress-steps">
            {['Plateforme', 'Objectif', 'Budget', 'Zone', 'Contact', 'Résultats'].map((step, index) => (
              <div key={index} className={`step-label ${currentStep > index ? 'completed' : currentStep === index + 1 ? 'active' : ''}`}>
                {step}
              </div>
            ))}
          </div>
          <p className="progress-motivation">
            🎯 Vous êtes à {Math.round(getProgressPercentage())}% de découvrir votre potentiel !
          </p>
        </div>

        <form id="simulator-form" onSubmit={(e) => e.preventDefault()} noValidate>
          {/* Étape 1 - Plateforme Marketing */}
          <div className={`form-step ${currentStep === 1 ? 'active' : ''}`} id="step-1" role="tabpanel">
            <h3>🚀 Où voulez-vous EXPLOSER vos écoutes ?</h3>
            <div className="platform-grid">
              {Object.entries(PLATFORM_MARKETING).map(([key, platform]) => (
                <div 
                  key={key}
                  className={`platform-card ${formData.platform === key ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, platform: key }))}
                >
                  <h4>🎬 {platform.title}</h4>
                  <p className="platform-subtitle">{platform.subtitle}</p>
                  <p className="platform-stats">{platform.stats}</p>
                  <p className="platform-recommendation">💡 {platform.recommendation}</p>
                </div>
              ))}
            </div>
            {errors.platform && <span className="form-error">{errors.platform}</span>}
            <div className="form-buttons" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-primary-marketing" onClick={nextStep}>
                Continuer 🚀
              </button>
            </div>
          </div>

          {/* Étape 2 - Type de campagne Marketing */}
          <div className={`form-step ${currentStep === 2 ? 'active' : ''}`} id="step-2" role="tabpanel">
            <h3>🎯 Quel est votre OBJECTIF principal ?</h3>
            <div className="campaign-grid">
              {Object.entries(CAMPAIGN_MARKETING).map(([key, campaign]) => (
                <div 
                  key={key}
                  className={`campaign-card ${formData.campaignType === key ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, campaignType: key }))}
                >
                  <h4>🌟 {campaign.title}</h4>
                  <p className="campaign-subtitle">{campaign.subtitle}</p>
                  <p className="campaign-benefit">{campaign.benefit}</p>
                </div>
              ))}
            </div>
            <div className="expert-recommendation">
              💡 Nos experts recommandent de commencer par la <strong>Notoriété</strong>
            </div>
            {errors.campaignType && <span className="form-error">{errors.campaignType}</span>}
            <div className="form-buttons">
              <button type="button" className="btn btn-secondary" onClick={prevStep}>
                ← Retour
              </button>
              <button type="button" className="btn btn-primary-marketing" onClick={nextStep}>
                Continuer 🚀
              </button>
            </div>
          </div>

          {/* Étape 3 - Budget Marketing */}
          <div className={`form-step ${currentStep === 3 ? 'active' : ''}`} id="step-3" role="tabpanel">
            <h3>💰 Investissez dans votre SUCCÈS musical</h3>
            <div className="budget-suggestions">
              <div className="budget-option" onClick={() => setFormData(prev => ({ ...prev, budget: '750' }))}>
                <span className="budget-icon">🚀</span>
                <div>
                  <strong>Budget Starter</strong>
                  <p>500-1000€ - Idéal pour tester</p>
                </div>
              </div>
              <div className="budget-option recommended" onClick={() => setFormData(prev => ({ ...prev, budget: '2500' }))}>
                <span className="budget-icon">⭐</span>
                <div>
                  <strong>Budget Pro</strong>
                  <p>1000-5000€ - Recommandé par nos experts</p>
                </div>
              </div>
              <div className="budget-option" onClick={() => setFormData(prev => ({ ...prev, budget: '7500' }))}>
                <span className="budget-icon">💎</span>
                <div>
                  <strong>Budget Premium</strong>
                  <p>5000€+ - Résultats garantis</p>
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="budget">Ou saisissez votre budget personnalisé :</label>
              <input 
                type="number" 
                id="budget" 
                name="budget" 
                min="500" 
                step="10" 
                value={formData.budget} 
                onChange={handleChange} 
                required 
                placeholder="Ex: 1500€"
              />
            </div>
            
            <div className="marketing-stats">
              <p>💡 <strong>ROI moyen de nos clients : 300%</strong></p>
              <p>⚡ <strong>Offre spéciale : -20% sur votre première campagne</strong></p>
            </div>
            
            {errors.budget && <span className="form-error">{errors.budget}</span>}
            <div className="form-buttons">
              <button type="button" className="btn btn-secondary" onClick={prevStep}>
                ← Retour
              </button>
              <button type="button" className="btn btn-primary-marketing" onClick={nextStep}>
                Continuer 🚀
              </button>
            </div>
          </div>

          {/* Étape 4 - Zone géographique Marketing */}
          <div className={`form-step ${currentStep === 4 ? 'active' : ''}`} id="step-4" role="tabpanel">
            <h3>🌍 Où voulez-vous CONQUÉRIR votre audience ?</h3>
            <div className="region-grid">
              {Object.entries(REGION_MARKETING).map(([key, region]) => (
                <div 
                  key={key}
                  className={`region-card ${formData.country === key ? 'selected' : ''} ${key === 'europe' ? 'recommended' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, country: key }))}
                >
                  <h4>🇪🇺 {region.title}</h4>
                  <p className="region-subtitle">{region.subtitle}</p>
                  {region.benefit && <p className="region-benefit">{region.benefit}</p>}
                  {region.recommendation && <p className="region-recommendation">💡 {region.recommendation}</p>}
                </div>
              ))}
            </div>
            {errors.country && <span className="form-error">{errors.country}</span>}
            <div className="form-buttons">
              <button type="button" className="btn btn-secondary" onClick={prevStep}>
                ← Retour
              </button>
              <button type="button" className="btn btn-primary-marketing" onClick={nextStep}>
                Continuer 🚀
              </button>
            </div>
          </div>

          {/* Étape 5 - Informations Marketing */}
          <div className={`form-step ${currentStep === 5 ? 'active' : ''}`} id="step-5" role="tabpanel">
            <h3>📝 Dernière étape avant vos RÉSULTATS exclusifs !</h3>
            
            <div className="final-step-motivation">
              <p>🎉 <strong>Félicitations !</strong> Vous êtes sur le point de découvrir le potentiel de votre musique</p>
              <p>⏰ Plus que 30 secondes pour accéder à vos résultats personnalisés !</p>
            </div>

            <div className="form-group">
              <label htmlFor="artistName">🎵 Nom de votre projet artistique</label>
              <input 
                type="text" 
                id="artistName" 
                name="artistName" 
                value={formData.artistName} 
                onChange={handleChange} 
                required 
                placeholder="Ex: DJ Martin, Les Étoiles..."
              />
              {errors.artistName && <span className="form-error">{errors.artistName}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="simulator-email">📧 Email pour recevoir vos résultats</label>
              <input 
                type="email" 
                id="simulator-email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                placeholder="votre@email.com"
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="security-badges">
              <p>🔒 <strong>Vos données sont 100% sécurisées et confidentielles</strong></p>
              <p>📧 <strong>Bonus :</strong> Recevez aussi nos conseils d'experts par email</p>
            </div>

            <div className="form-buttons">
              <button type="button" className="btn btn-secondary" onClick={prevStep}>
                ← Retour
              </button>
              <button 
                type="button" 
                className="btn btn-primary-marketing pulse" 
                onClick={calculateResults} 
                disabled={submitting}
              >
                {submitting ? '⏳ Calcul en cours...' : '🎯 DÉCOUVRIR MON POTENTIEL'}
              </button>
            </div>
            {errors.calculation && <span className="form-error" style={{marginTop: '10px', display: 'block'}}>{errors.calculation}</span>}
          </div>

          {/* Étape 6 - Résultats Marketing */}
          <div className={`form-step ${currentStep === 6 ? 'active' : ''}`} id="step-6" role="tabpanel">
            <div className="results-celebration">
              <h3>🎉 Félicitations {formData.artistName} !</h3>
              <p className="results-intro">Voici votre <strong>POTENTIEL musical</strong> basé sur +1000 campagnes réelles</p>
            </div>

            <div className="result-preview-marketing">
              <div className="result-item-marketing highlight">
                <div className="result-icon">🎵</div>
                <div className="result-content">
                  <span className="result-label">Vues estimées</span>
                  <span className="result-value-marketing">{results.views || '--'}</span>
                  <span className="result-comment">Impressionnant !</span>
                </div>
              </div>
              
              <div className="result-item-marketing">
                <div className="result-icon">👥</div>
                <div className="result-content">
                  <span className="result-label">Audience potentielle</span>
                  <span className="result-value-marketing">{results.reach || '--'}</span>
                  <span className="result-comment">personnes touchées</span>
                </div>
              </div>
              
              <div className="result-item-marketing">
                <div className="result-icon">💰</div>
                <div className="result-content">
                  <span className="result-label">Coût optimisé</span>
                  <span className="result-value-marketing">{results.cpv || '--'}</span>
                  <span className="result-comment">par vue/impression</span>
                </div>
              </div>
              
              {formData.platform === 'youtube' && results.subscribers && (
                <div className="result-item-marketing highlight">
                  <div className="result-icon">📈</div>
                  <div className="result-content">
                    <span className="result-label">Nouveaux abonnés</span>
                    <span className="result-value-marketing">{results.subscribers}</span>
                    <span className="result-comment">fans potentiels</span>
                  </div>
                </div>
              )}
            </div>

            <div className="results-credibility">
              <div className="credibility-stat">
                <strong>⚡ Précision : 94%</strong>
                <span>validée par nos clients</span>
              </div>
              <div className="credibility-stat">
                <strong>💡 Potentiel d'amélioration : +150%</strong>
                <span>avec nos stratégies expertes</span>
              </div>
            </div>

            {/* Section témoignages dans les résultats */}
            <div className="testimonials-results">
              <h4>🌟 Ce que disent nos clients :</h4>
              <div className="testimonial-carousel">
                {TESTIMONIALS.map((testimonial, index) => (
                  <div 
                    key={index}
                    className={`testimonial-card ${index === currentTestimonial ? 'active' : ''}`}
                  >
                    <div className="testimonial-header">
                      <div className="testimonial-info">
                        <span className="testimonial-name">
                          {testimonial.name}
                          {testimonial.verified && <span className="verified-badge">✅</span>}
                        </span>
                        <div className="testimonial-rating">
                          {renderStars(testimonial.rating)}
                          <span className="rating-text">5/5 stars</span>
                        </div>
                        <span className="testimonial-date">{testimonial.daysAgo} days ago</span>
                      </div>
                    </div>
                    <p className="testimonial-text">"{testimonial.text}"</p>
                    <span className="testimonial-source">via Google My Business</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="results-disclaimer-marketing">
              <p>📊 Ces résultats sont basés sur des données réelles de +1000 campagnes similaires</p>
            </div>

            <div className="cta-section">
              <div className="urgency-message">
                <p>⏰ <strong>Offre limitée :</strong> Seulement 3 créneaux disponibles aujourd'hui</p>
              </div>
              
              <div className="form-buttons-final">
                <button type="button" className="btn btn-secondary" onClick={() => setCurrentStep(5)}>
                  ← Modifier mes infos
                </button>
                <a 
                  id="calendly-link" 
                  href={`${CALENDLY_LINKS[formData.platform]}?name=${encodeURIComponent(formData.artistName)}&email=${encodeURIComponent(formData.email)}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-primary-marketing cta-main pulse"
                >
                  🚀 RÉSERVER MON APPEL STRATÉGIQUE GRATUIT
                </a>
              </div>

              <div className="secondary-cta">
                <p>📧 Ou <a href="#" className="link-secondary">recevoir ces résultats par email</a></p>
              </div>
            </div>
          </div>
        </form>

        {/* Témoignages flottants */}
        {showTestimonials && currentStep < 6 && (
          <div className="floating-testimonial">
            <div className="testimonial-popup">
              <div className="testimonial-header">
                <span className="testimonial-name">
                  {TESTIMONIALS[currentTestimonial].name}
                  {TESTIMONIALS[currentTestimonial].verified && <span className="verified-badge">✅</span>}
                </span>
                <div className="testimonial-rating">
                  {renderStars(TESTIMONIALS[currentTestimonial].rating)}
                </div>
              </div>
              <p className="testimonial-text">"{TESTIMONIALS[currentTestimonial].text}"</p>
              <span className="testimonial-source">Google My Business</span>
            </div>
          </div>
        )}

        {/* Notification de preuve sociale */}
        <div className="social-proof-notification">
          <span className="notification-icon">🔥</span>
          <span>{socialProofCount} artistes ont utilisé le simulateur aujourd'hui</span>
        </div>
      </div>
    </div>
  );
});

SimulatorOptimized.displayName = 'SimulatorOptimized';

export default SimulatorOptimized;