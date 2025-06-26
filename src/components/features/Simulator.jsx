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
      setSubmitting(true); // Déplacé ici pour montrer le chargement pendant le calcul
      const budget = parseInt(formData.budget);
      const costData = COST_DATA[formData.platform]?.[formData.country]?.[formData.campaignType];

      if (!costData) {
        console.error('Données de coût non disponibles pour cette combinaison');
        // TODO: Afficher une erreur à l'utilisateur ?
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

      submitResults(viewsFormatted, costRangeFormatted, reachFormatted); // submitResults gère setSubmitting(false)
      setCurrentStep(6);
    }
  };

  const submitResults = async (views, cpv, reach) => {
    // Pas besoin de setSubmitting(true) ici, déjà fait dans calculateResults
    try {
      const simulatorData = {
        artistName: formData.artistName, email: formData.email, platform: formData.platform,
        campaignType: formData.campaignType, budget: formData.budget, country: formData.country,
        views, cpv, reach
      };
      await apiService.submitSimulatorResults(simulatorData);
    } catch (error) {
      console.error('Erreur lors de la soumission des résultats du simulateur:', error);
      // Afficher une notification d'erreur à l'utilisateur si nécessaire
    } finally {
      setSubmitting(false); // Assurez-vous que submitting est remis à false même en cas d'erreur
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
              <label htmlFor="budget">{t('simulator.step3_budget_label')}</label> {/* Clé modifiée pour correspondre à l'étape */}
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
              <label htmlFor="country">{t('simulator.step4_region_label')}</label> {/* Clé modifiée */}
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
              <label htmlFor="artistName">{t('simulator.step5_artist_label')}</label> {/* Clé modifiée */}
              <input type="text" id="artistName" name="artistName" value={formData.artistName} onChange={handleChange} required placeholder={t('simulator.step5_artist_placeholder')} aria-describedby={errors.artistName ? "artistName-error" : undefined} />
              {errors.artistName && <span className="form-error" id="artistName-error">{errors.artistName}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="simulator-email">{t('simulator.step5_email_label')}</label> {/* Clé modifiée */}
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
            <div className="form-buttons">
              <button type="button" className="btn btn-secondary" onClick={() => setCurrentStep(5)} aria-label={t('simulator.button_modify')}> {/* Retour à l'étape 5 */}
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
