import { useTranslation } from 'react-i18next';
import '../../assets/styles/services.css';

const Services = () => {
  const { t } = useTranslation();

  const services = [
    {
      id: 'youtube',
      icon: '🎥',
      title: t('services.youtube.title', 'YouTube Ads'),
      description: t('services.youtube.description', 'Campagnes publicitaires ciblées pour maximiser vos vues et votre engagement.'),
      features: [
        t('services.youtube.feature1', 'Ciblage précis par démographie'),
        t('services.youtube.feature2', 'Optimisation du coût par vue'),
        t('services.youtube.feature3', 'Analytics détaillés')
      ]
    },
    {
      id: 'meta',
      icon: '📱',
      title: t('services.meta.title', 'Meta Ads'),
      description: t('services.meta.description', 'Facebook et Instagram : touchez votre audience où elle se trouve.'),
      features: [
        t('services.meta.feature1', 'Ciblage par intérêts musicaux'),
        t('services.meta.feature2', 'Formats visuels engageants'),
        t('services.meta.feature3', 'Retargeting avancé')
      ]
    },
    {
      id: 'tiktok',
      icon: '🎵',
      title: t('services.tiktok.title', 'TikTok Ads'),
      description: t('services.tiktok.description', 'La plateforme qui fait exploser les tendances musicales.'),
      features: [
        t('services.tiktok.feature1', 'Contenu viral optimisé'),
        t('services.tiktok.feature2', 'Audience jeune et engagée'),
        t('services.tiktok.feature3', 'Intégration native')
      ]
    }
  ];

  return (
    <section id="services" className="services">
      <div className="container">
        <h2 className="section-title">{t('services.title', 'Nos Services')}</h2>
        <p className="section-subtitle">{t('services.subtitle', 'Des solutions publicitaires adaptées à chaque plateforme')}</p>

        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">{service.description}</p>
              
              <ul className="service-features">
                {service.features.map((feature, index) => (
                  <li key={index} className="service-feature">
                    <span className="feature-check">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button className="service-cta btn btn-primary">
                {t('services.cta', 'En savoir plus')}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
