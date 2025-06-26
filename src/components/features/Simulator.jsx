import { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import apiService from '../../services/api.service';
import '../../assets/styles/simulator.css';

// Liens Calendly pour chaque plateforme
const CALENDLY_LINKS = {
  meta: "https://calendly.com/mhl-agency/decouverte?month=2025-04",
  tiktok: "https://calendly.com/mhl-agency/decouverte?month=2025-04",
  youtube: "https://calendly.com/denis-mdmcmusicads/30min"
};

// 🎯 DONNÉES DE COÛT MISES À JOUR - Version 2025
const COST_DATA = {
  youtube: {
    usa: {
      awareness: { min: 0.035, max: 0.092, unit: "CPV" }, // +20%
      engagement: { min: 0.084, max: 0.173, unit: "CPV" }, // +20%
      conversion: { min: 0.173, max: 0.345, unit: "CPV" } // +15%
    },
    canada: {
      // Ajustement cohérent avec les tendances USA (-15% environ)
      awareness: { min: 0.012, max: 0.058, unit: "CPV" }, // +15%
      engagement: { min: 0.046, max: 0.092, unit: "CPV" }, // +15%
      conversion: { min: 0.092, max: 0.173, unit: "CPV" } // +15%
    },
    europe: {
      awareness: { min: 0.012, max: 0.046, unit: "CPV" }, // +15%
      engagement: { min: 0.035, max: 0.081, unit: "CPV" }, // +15%
      conversion: { min: 0.058, max: 0.138, unit: "CPV" } // +15%
    },
    south_america: {
      awareness: { min: 0.006, max: 0.023, unit: "CPV" }, // +15%
      engagement: { min: 0.012, max: 0.058, unit: "CPV" }, // +15%
      conversion: { min: 0.023, max: 0.092, unit: "CPV" } // +15%
    },
    asia: {
      // Ajustement cohérent (+12% environ)
      awareness: { min: 0.006, max: 0.034, unit: "CPV" }, // +12%
      engagement: { min: 0.011, max: 0.067, unit: "CPV" }, // +12%
      conversion: { min: 0.022, max: 0.112, unit: "CPV" } // +12%
    }
  },
  meta: {
    usa: {
      awareness: { min: 5.40, max: 13.20, unit: "CPM" }, // +25%
      engagement: { min: 12.00, max: 24.00, unit: "CPM" }, // +20%
      conversion: { min: 22.50, max: 42.00, unit: "CPM" } // +20%
    },
    canada: {
      // Ajustement cohérent avec les tendances USA (-20% environ)
      awareness: { min: 2.40, max: 7.20, unit: "CPM" }, // +20%
      engagement: { min: 7.20, max: 14.40, unit: "CPM" }, // +20%
      conversion: { min: 12.00, max: 24.00, unit: "CPM" } // +20%
    },
    europe: {
      awareness: { min: 1.80, max: 6.00, unit: "CPM" }, // +20%
      engagement: { min: 6.00, max: 12.00, unit: "CPM" }, // +20%
      conversion: { min: 9.60, max: 18.00, unit: "CPM" } // +20%
    },
    south_america: {
      awareness: { min: 0.60, max: 3.60, unit: "CPM" }, // +20%
      engagement: { min: 2.40, max: 7.20, unit: "CPM" }, // +20%
      conversion: { min: 3.60, max: 9.60, unit: "CPM" } // +20%
    },
    asia: {
      // Ajustement cohérent (+18% environ)
      awareness: { min: 1.18, max: 4.72, unit: "CPM" }, // +18%
      engagement: { min: 3.54, max: 8.26, unit: "CPM" }, // +18%
      conversion: { min: 5.90, max: 11.80, unit: "CPM" } // +18%
    }
  },
  tiktok: {
    usa: {
      awareness: { min: 12.00, max: 60.00, unit: "CPM" }, // +10%
      engagement: { min: 18.90, max: 72.00, unit: "CPM" }, // +15%
      conversion: { min: 27.50, max: 96.00, unit: "CPM" } // +20%
    },
    canada: {
      // Ajustement cohérent avec les tendances USA (-15% environ)
      awareness: { min: 8.40, max: 42.00, unit: "CPM" }, // +5%
      engagement: { min: 12.60, max: 52.50, unit: "CPM" }, // +5%
      conversion: { min: 15.75, max: 73.50, unit: "CPM" } // +5%
    },
    europe: {
      awareness: { min: 10.50, max: 52.50, unit: "CPM" }, // +5%
      engagement: { min: 15.75, max: 57.75, unit: "CPM" }, // +5%
      conversion: { min: 22.00, max: 77.00, unit: "CPM" } // +10%
    },
    south_america: {
      awareness: { min: 3.15, max: 15.75, unit: "CPM" }, // +5%
      engagement: { min: 5.25, max: 21.00, unit: "CPM" }, // +5%
      conversion: { min: 8.40, max: 31.50, unit: "CPM" } // +5%
    },
    asia: {
      // Ajustement cohérent (+8% environ)
      awareness: { min: 2.16, max: 10.80, unit: "CPM" }, // +8%
      engagement: { min: 4.32, max: 16.20, unit: "CPM" }, // +8%
      conversion: { min: 5.40, max: 27.00, unit: "CPM" } // +8%
    }
  }
};

const Simulator = forwardRef((props, ref) => {
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
    reach: null
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useImperativeHandle(ref, () => ({
    openSimulator: () => {
      setIsOpen(true);
    }
  }));

  const closeSimulator = () => {
    setIsOpen(false);
    setCurrentStep(1);
    setFormData({ platform: '', budget: '', country: '', campaignType: '', artistName: '', email: '' });
    setErrors({});
    setResults({ views: null, cpv: null, reach: null });
    setSubmitError('');
    setSubmitSuccess(false);
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
          newErrors.platform = t('simulator.platform_error');
          isValid = false;
        }
        break;
      case 2:
        if (!formData.campaignType) {
          newErrors.campaignType = t('simulator.campaignType_error');
          isValid = false;
        }
        break;
      case 3:
        if (!formData.budget || formData.budget < 500) {
          newErrors.budget = t('simulator.budget_error');
          isValid = false;
        }
        break;
      case 4:
        if (!formData.country) {
          newErrors.country = t('simulator.region_error');
          isValid = false;
        }
        break;
      case 5:
        if (!formData.artistName) {
          newErrors.artistName = t('simulator.artist_error');
          isValid = false;
        }
        if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = t('simulator.email_error');
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
      setSubmitError('');
      
      const budget = parseInt(formData.budget);
      const costData = COST_DATA[formData.platform]?.[formData.country]?.[formData.campaignType];

      if (!costData) {
        console.error('❌ Données de coût manquantes:', {
          platform: formData.platform,
          country: formData.country,
          campaignType: formData.campaignType
        });
        setSubmitError('Configuration de campagne non supportée.');
        setSubmitting(false);
        return;
      }

      const avgCost = (costData.min + costData.max) / 2;
      let views, reach;

      if (costData.unit === "CPV") {
        views = Math.round(budget / avgCost);
        reach = Math.round(views * 2.5);
      } else if (costData.unit === "CPM") {
        const impressions = (budget / avgCost) * 1000;
        views = Math.round(impressions * 0.3);
        reach = Math.round(impressions);
      } else {
        views = 0; reach = 0;
      }

      const viewsFormatted = views.toLocaleString();
      const costRangeFormatted = `${costData.min.toFixed(3)} - ${costData.max.toFixed(3)} $ (${costData.unit})`;
      const reachFormatted = reach.toLocaleString();

      setResults({
        views: viewsFormatted,
        cpv: costRangeFormatted,
        reach: reachFormatted
      });

      console.log('📊 Résultats calculés:', { views: viewsFormatted, cpv: costRangeFormatted, reach: reachFormatted });

      // Passage à l'étape résultats AVANT l'envoi API
      setCurrentStep(6);
      
      // Envoi API en arrière-plan
      submitResults(viewsFormatted, costRangeFormatted, reachFormatted);
    }
  };

  const submitResults = async (views, cpv, reach) => {
    try {
      setSubmitError('');
      
      const simulatorData = {
        artistName: formData.artistName,
        email: formData.email,
        platform: formData.platform,
        campaignType: formData.campaignType,
        budget: formData.budget,
        country: formData.country,
        views,
        cpv,
        reach,
        timestamp: new Date().toISOString()
      };

      console.log('📤 Envoi des données simulateur:', simulatorData);
      
      // Vérification que apiService existe
      if (!apiService || !apiService.submitSimulatorResults) {
        throw new Error('Service API non disponible');
      }

      const response = await apiService.submitSimulatorResults(simulatorData);
      console.log('✅ Réponse API:', response);
      
      setSubmitSuccess(true);
      
    } catch (error) {
      console.error('❌ Erreur soumission simulateur:', error);
      
      // Gestion d'erreur détaillée
      let errorMessage = 'Erreur lors de l\'envoi. ';
      
      if (error.message?.includes('fetch')) {
        errorMessage += 'Problème de connexion réseau.';
      } else if (error.status === 404) {
        errorMessage += 'Service temporairement indisponible.';
      } else if (error.status === 422) {
        errorMessage += 'Données invalides.';
      } else {
        errorMessage += error.message || 'Erreur inconnue.';
      }
      
      setSubmitError(errorMessage);
      
    } finally {
      setSubmitting(false);
    }
  };

  const handleClickOutside = (e) => {
    if (e.target.classList.contains('simulator-popup') && currentStep !== 6) {
      closeSimulator();
    }
  };

  return (
    <div
      className={`simulator-popup ${isOpen ? 'active' : ''}`}
      role="dialog" aria-modal="true" aria-labelledby="simulator-title"
      onClick={handleClickOutside}
    >
      <div className="simulator-content" tabIndex="-1">
        <button className="close-popup" type="button" aria-label={t('simulator.close_button_aria_label', 'Fermer')} onClick={closeSimulator}>
          &times;
        </button>

        <h2 id="simulator-title">{t('simulator.title')}</h2>

        <div className="progress-bar" aria-hidden="true">
          {[1, 2, 3, 4, 5, 6].map(step => (
            <div key={step} className={`progress-step ${currentStep >= step ? 'active' : ''}`}></div>
          ))}
        </div>

        <form id="simulator-form" onSubmit={(e) => e.preventDefault()} noValidate>
          {/* Étape 1 - Plateforme */}
          <div className={`form-step ${currentStep === 1 ? 'active' : ''}`} id="step-1" role="tabpanel">
            <h3>{t('simulator.step1_title')}</h3>
            <div className="form-group">
              <label htmlFor="platform">{t('simulator.step1_platform_label')}</label>
              <select id="platform" name="platform" value={formData.platform} onChange={handleChange} required aria-describedby={errors.platform ? "platform-error" : undefined}>
                <option value="" disabled>{t('simulator.option_select')}</option>
                <option value="youtube">{t('simulator.platform_youtube')}</option>
                <option value="meta">{t('simulator.platform_meta')}</option>
                <option value="tiktok">{t('simulator.platform_tiktok')}</option>
              </select>
              {errors.platform && <span className="form-error" id="platform-error">{errors.platform}</span>}
            </div>
            <div className="form-buttons" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-primary" onClick={nextStep} aria-label={t('simulator.button_next')}>
                {t('simulator.button_next')}
              </button>
            </div>
          </div>

          {/* Étape 2 - Type de campagne */}
          <div className={`form-step ${currentStep === 2 ? 'active' : ''}`} id="step-2" role="tabpanel">
            <h3>{t('simulator.step2_title')}</h3>
            <div className="form-group">
              <label htmlFor="campaignType">{t('simulator.step2_campaignType_label')}</label>
              <select id="campaignType" name="campaignType" value={formData.campaignType} onChange={handleChange} required aria-describedby={errors.campaignType ? "campaignType-error" : undefined}>
                <option value="" disabled>{t('simulator.option_select')}</option>
                <option value="awareness">{t('simulator.campaignType_awareness')}</option>
                <option value="engagement">{t('simulator.campaignType_engagement')}</option>
                <option value="conversion">{t('simulator.campaignType_conversion')}</option>
              </select>
              {errors.campaignType && <span className="form-error" id="campaignType-error">{errors.campaignType}</span>}
            </div>
            <div className="form-buttons">
              <button type="button" className="btn btn-secondary" onClick={prevStep} aria-label={t('simulator.button_prev')}>
                {t('simulator.button_prev')}
              </button>
              <button type="button" className="btn btn-primary" onClick={nextStep} aria-label={t('simulator.button_next')}>
                {t('simulator.button_next')}
              </button>
            </div>
          </div>

          {/* Étape 3 - Budget */}
          <div className={`form-step ${currentStep === 3 ? 'active' : ''}`} id="step-3" role="tabpanel">
             <h3>{t('simulator.step3_title')}</h3>
            <div className="form-group">
              <label htmlFor="budget">{t('simulator.step3_budget_label')}</label>
              <input type="number" id="budget" name="budget" min="500" step="10" value={formData.budget} onChange={handleChange} required placeholder={t('simulator.step3_budget_placeholder')} aria-describedby={errors.budget ? "budget-error" : undefined} />
              {errors.budget && <span className="form-error" id="budget-error">{errors.budget}</span>}
            </div>
            <div className="form-buttons">
              <button type="button" className="btn btn-secondary" onClick={prevStep} aria-label={t('simulator.button_prev')}>
                {t('simulator.button_prev')}
              </button>
              <button type="button" className="btn btn-primary" onClick={nextStep} aria-label={t('simulator.button_next')}>
                {t('simulator.button_next')}
              </button>
            </div>
          </div>

          {/* Étape 4 - Pays */}
          <div className={`form-step ${currentStep === 4 ? 'active' : ''}`} id="step-4" role="tabpanel">
            <h3>{t('simulator.step4_title')}</h3>
            <div className="form-group">
              <label htmlFor="country">{t('simulator.step4_region_label')}</label>
              <select id="country" name="country" value={formData.country} onChange={handleChange} required aria-describedby={errors.country ? "country-error" : undefined}>
                <option value="" disabled>{t('simulator.option_select')}</option>
                <option value="europe">{t('simulator.region_europe')}</option>
                <option value="usa">{t('simulator.region_usa')}</option>
                <option value="canada">{t('simulator.region_canada')}</option>
                <option value="south_america">{t('simulator.region_south_america')}</option>
                <option value="asia">{t('simulator.region_asia')}</option>
              </select>
              {errors.country && <span className="form-error" id="country-error">{errors.country}</span>}
            </div>
            <div className="form-buttons">
              <button type="button" className="btn btn-secondary" onClick={prevStep} aria-label={t('simulator.button_prev')}>
                {t('simulator.button_prev')}
              </button>
              <button type="button" className="btn btn-primary" onClick={nextStep} aria-label={t('simulator.button_next')}>
                {t('simulator.button_next')}
              </button>
            </div>
          </div>

          {/* Étape 5 - Informations */}
          <div className={`form-step ${currentStep === 5 ? 'active' : ''}`} id="step-5" role="tabpanel">
             <h3>{t('simulator.step5_title')}</h3>
            <div className="form-group">
              <label htmlFor="artistName">{t('simulator.step5_artist_label')}</label>
              <input type="text" id="artistName" name="artistName" value={formData.artistName} onChange={handleChange} required placeholder={t('simulator.step5_artist_placeholder')} aria-describedby={errors.artistName ? "artistName-error" : undefined} />
              {errors.artistName && <span className="form-error" id="artistName-error">{errors.artistName}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="simulator-email">{t('simulator.step5_email_label')}</label>
              <input type="email" id="simulator-email" name="email" value={formData.email} onChange={handleChange} required placeholder={t('simulator.step5_email_placeholder')} aria-describedby={errors.email ? "simulator-email-error" : undefined} />
              {errors.email && <span className="form-error" id="simulator-email-error">{errors.email}</span>}
            </div>
            <div className="form-buttons">
              <button type="button" className="btn btn-secondary" onClick={prevStep} aria-label={t('simulator.button_prev')}>
                {t('simulator.button_prev')}
              </button>
              <button type="button" className="btn btn-primary" onClick={calculateResults} disabled={submitting} aria-label={t('simulator.button_show_results')}>
                {submitting ? t('simulator.submitting_text') : t('simulator.button_show_results')}
              </button>
            </div>
          </div>

          {/* Étape 6 - Résultats */}
          <div className={`form-step ${currentStep === 6 ? 'active' : ''}`} id="step-6" role="tabpanel">
            <h3>{t('simulator.results_title')}</h3>
            <div className="result-preview" aria-live="polite">
              <div className="result-item">
                <span>{t('simulator.results_views_label')}</span>
                <span className="result-value" id="result-views">{results.views || '--'}</span>
              </div>
              <div className="result-item">
                <span>{t('simulator.results_cpv_label')}</span>
                <span className="result-value" id="result-cpv">{results.cpv || '--'}</span>
              </div>
              <div className="result-item">
                <span>{t('simulator.results_reach_label')}</span>
                <span className="result-value" id="result-reach">{results.reach || '--'}</span>
              </div>
              <p className="results-disclaimer">{t('simulator.results_disclaimer')}</p>
            </div>

            {/* Messages d'erreur/succès */}
            {submitError && (
              <div className="error-message" style={{
                background: '#fee', 
                border: '1px solid #fcc', 
                padding: '10px', 
                borderRadius: '4px',
                margin: '10px 0',
                color: '#c33'
              }}>
                ⚠️ {submitError}
                <button 
                  type="button" 
                  onClick={() => submitResults(results.views, results.cpv, results.reach)}
                  style={{marginLeft: '10px', fontSize: '12px'}}
                >
                  Réessayer
                </button>
              </div>
            )}

            {submitSuccess && (
              <div className="success-message" style={{
                background: '#efe', 
                border: '1px solid #cfc', 
                padding: '10px', 
                borderRadius: '4px',
                margin: '10px 0',
                color: '#060'
              }}>
                ✅ Vos résultats ont été envoyés avec succès !
              </div>
            )}

            <div className="form-buttons">
              <button type="button" className="btn btn-secondary" onClick={() => setCurrentStep(5)} aria-label={t('simulator.button_modify')}>
                {t('simulator.button_modify')}
              </button>
              <a id="calendly-link" href={`${CALENDLY_LINKS[formData.platform]}?name=${encodeURIComponent(formData.artistName)}&email=${encodeURIComponent(formData.email)}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary" aria-label={t('simulator.results_cta_expert')}>
                {t('simulator.cta_expert_button')}
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
});

Simulator.displayName = 'Simulator';

export default Simulator;
