import { pipedreamAdapter } from './pipedream-adapter.js';
import { encrypt, decrypt } from './crypto.js';
import { pool } from './db/pool.js';
import { logger } from './utils/logger.js';

/**
 * FlowForge v2.1 - Gestionnaire d'Intégrations Étendu
 * Support des composants Pipedream et intégrations personnalisées
 */
export class IntegrationsManager {
  constructor() {
    this.serviceCategories = {
      ai: {
        name: 'Intelligence Artificielle',
        icon: '🤖',
        services: ['claude', 'openai', 'cohere']
      },
      communication: {
        name: 'Communication',
        icon: '💬',
        services: ['slack', 'discord', 'telegram', 'whatsapp']
      },
      email: {
        name: 'Email & Marketing',
        icon: '📧',
        services: ['gmail', 'outlook', 'brevo', 'mailgun', 'sendgrid']
      },
      productivity: {
        name: 'Productivité',
        icon: '📊',
        services: ['google-sheets', 'notion', 'airtable', 'trello', 'asana']
      },
      social: {
        name: 'Réseaux Sociaux',
        icon: '📱',
        services: ['twitter', 'facebook', 'instagram', 'linkedin', 'tiktok']
      },
      storage: {
        name: 'Stockage & Fichiers',
        icon: '💾',
        services: ['google-drive', 'dropbox', 'onedrive', 'aws-s3']
      },
      ecommerce: {
        name: 'E-commerce',
        icon: '🛒',
        services: ['shopify', 'woocommerce', 'stripe', 'paypal']
      },
      development: {
        name: 'Développement',
        icon: '⚙️',
        services: ['github', 'gitlab', 'bitbucket', 'jenkins']
      },
      triggers: {
        name: 'Déclencheurs',
        icon: '🎯',
        services: ['http', 'webhook', 'schedule', 'rss']
      }
    };
  }

  /**
   * Récupère toutes les intégrations disponibles (incluant Pipedream)
   */
  async getAvailableIntegrations() {
    try {
      // Combiner les intégrations natives et Pipedream
      const nativeIntegrations = this.getNativeIntegrations();
      const pipedreamComponents = pipedreamAdapter.isInitialized() 
        ? pipedreamAdapter.getAvailableComponents()
        : [];

      // Fusionner et catégoriser
      const allIntegrations = [
        ...nativeIntegrations.map(integration => ({
          ...integration,
          source: 'native',
          category: this.determineCategory(integration.name)
        })),
        ...pipedreamComponents.map(component => ({
          ...component,
          source: 'pipedream',
          category: component.category || this.determineCategory(component.name)
        }))
      ];

      // Grouper par catégorie
      const groupedIntegrations = {};
      for (const [categoryKey, categoryInfo] of Object.entries(this.serviceCategories)) {
        groupedIntegrations[categoryKey] = {
          ...categoryInfo,
          integrations: allIntegrations.filter(integration => 
            categoryInfo.services.some(service => 
              integration.name.toLowerCase().includes(service) || 
              integration.category === categoryKey
            )
          )
        };
      }

      // Ajouter une catégorie "Autres" pour les intégrations non catégorisées
      const categorizedNames = Object.values(groupedIntegrations)
        .flatMap(cat => cat.integrations.map(i => i.name));
      
      const uncategorized = allIntegrations.filter(integration => 
        !categorizedNames.includes(integration.name)
      );

      if (uncategorized.length > 0) {
        groupedIntegrations.other = {
          name: 'Autres',
          icon: '🔧',
          services: [],
          integrations: uncategorized
        };
      }

      return groupedIntegrations;

    } catch (error) {
      logger.error('Failed to get available integrations', { error: error.message });
      throw error;
    }
  }

  /**
   * Récupère les intégrations natives de FlowForge
   */
  getNativeIntegrations() {
    return [
      {
        name: 'claude',
        displayName: 'Claude AI',
        description: 'Assistant IA conversationnel d\'Anthropic',
        authType: 'api_key',
        configFields: [
          { name: 'apiKey', label: 'Clé API', type: 'password', required: true }
        ],
        capabilities: ['chat', 'text-generation', 'analysis']
      },
      {
        name: 'google-sheets',
        displayName: 'Google Sheets',
        description: 'Tableurs et feuilles de calcul Google',
        authType: 'oauth2',
        configFields: [
          { name: 'clientId', label: 'Client ID', type: 'text', required: true },
          { name: 'clientSecret', label: 'Client Secret', type: 'password', required: true }
        ],
        capabilities: ['read', 'write', 'create']
      },
      {
        name: 'brevo',
        displayName: 'Brevo (ex-Sendinblue)',
        description: 'Plateforme d\'email marketing',
        authType: 'api_key',
        configFields: [
          { name: 'apiKey', label: 'Clé API', type: 'password', required: true }
        ],
        capabilities: ['send-email', 'manage-contacts', 'campaigns']
      },
      {
        name: 'discord',
        displayName: 'Discord',
        description: 'Plateforme de communication pour communautés',
        authType: 'webhook',
        configFields: [
          { name: 'webhookUrl', label: 'URL du Webhook', type: 'url', required: true }
        ],
        capabilities: ['send-message', 'notifications']
      },
      {
        name: 'slack',
        displayName: 'Slack',
        description: 'Plateforme de collaboration d\'équipe',
        authType: 'webhook',
        configFields: [
          { name: 'webhookUrl', label: 'URL du Webhook', type: 'url', required: true },
          { name: 'botToken', label: 'Bot Token (optionnel)', type: 'password', required: false }
        ],
        capabilities: ['send-message', 'channels', 'notifications']
      },
      {
        name: 'github',
        displayName: 'GitHub',
        description: 'Plateforme de développement collaboratif',
        authType: 'token',
        configFields: [
          { name: 'personalAccessToken', label: 'Personal Access Token', type: 'password', required: true }
        ],
        capabilities: ['issues', 'repositories', 'actions']
      }
    ];
  }

  /**
   * Crée une nouvelle intégration utilisateur
   */
  async createIntegration(userId, integrationData) {
    const { name, displayName, authType, config } = integrationData;

    try {
      // Valider les données d'entrée
      this.validateIntegrationData(integrationData);

      // Chiffrer les données sensibles
      const encryptedConfig = encrypt(JSON.stringify(config));

      // Insérer en base de données
      const query = `
        INSERT INTO credentials (user_id, service_name, service_type, display_name, encrypted_data, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, created_at
      `;

      const result = await pool.query(query, [
        userId,
        name,
        authType,
        displayName,
        encryptedConfig,
        'active'
      ]);

      const integrationId = result.rows[0].id;

      logger.info('Integration created', {
        integrationId,
        userId,
        serviceName: name,
        authType
      });

      return {
        id: integrationId,
        name,
        displayName,
        authType,
        status: 'active',
        createdAt: result.rows[0].created_at
      };

    } catch (error) {
      logger.error('Failed to create integration', {
        userId,
        serviceName: name,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Récupère les intégrations d'un utilisateur
   */
  async getUserIntegrations(userId) {
    try {
      const query = `
        SELECT id, service_name, service_type, display_name, status, last_tested, created_at, updated_at
        FROM credentials
        WHERE user_id = $1
        ORDER BY created_at DESC
      `;

      const result = await pool.query(query, [userId]);

      return result.rows.map(row => ({
        id: row.id,
        name: row.service_name,
        displayName: row.display_name,
        authType: row.service_type,
        status: row.status,
        lastTested: row.last_tested,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

    } catch (error) {
      logger.error('Failed to get user integrations', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * Teste une intégration
   */
  async testIntegration(userId, integrationId) {
    try {
      // Récupérer les données de l'intégration
      const integration = await this.getIntegrationById(userId, integrationId);
      if (!integration) {
        throw new Error('Integration not found');
      }

      // Déchiffrer la configuration
      const config = JSON.parse(decrypt(integration.encryptedData));

      // Tester selon le type d'intégration
      let testResult;
      if (integration.source === 'pipedream') {
        testResult = await this.testPipedreamIntegration(integration.serviceName, config);
      } else {
        testResult = await this.testNativeIntegration(integration.serviceName, config);
      }

      // Mettre à jour le statut et la date de test
      const newStatus = testResult.success ? 'active' : 'error';
      await this.updateIntegrationStatus(integrationId, newStatus);

      logger.info('Integration test completed', {
        integrationId,
        serviceName: integration.serviceName,
        success: testResult.success
      });

      return testResult;

    } catch (error) {
      logger.error('Integration test failed', {
        integrationId,
        userId,
        error: error.message
      });

      // Marquer l'intégration comme en erreur
      await this.updateIntegrationStatus(integrationId, 'error');

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Teste une intégration Pipedream
   */
  async testPipedreamIntegration(serviceName, config) {
    if (!pipedreamAdapter.isInitialized()) {
      return { success: false, error: 'Pipedream adapter not initialized' };
    }

    // Utiliser un composant de test simple pour vérifier la connectivité
    try {
      const component = pipedreamAdapter.getComponentDetails(serviceName);
      if (!component) {
        return { success: false, error: `Component ${serviceName} not found` };
      }

      // Tester avec une action basique si disponible
      if (component.actions && component.actions.length > 0) {
        const testAction = component.actions.find(a => a.name.includes('test')) || component.actions[0];
        
        // Exécution de test avec des paramètres minimaux
        const result = await pipedreamAdapter.executeComponent(
          serviceName,
          testAction.name,
          config,
          { test: true }
        );

        return {
          success: result.success,
          message: result.success ? 'Connection successful' : result.error,
          details: { component: serviceName, action: testAction.name }
        };
      }

      return { success: true, message: 'Component found and accessible' };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Teste une intégration native
   */
  async testNativeIntegration(serviceName, config) {
    switch (serviceName) {
      case 'claude':
        return await this.testClaudeIntegration(config);
      
      case 'google-sheets':
        return await this.testGoogleSheetsIntegration(config);
      
      case 'brevo':
        return await this.testBrevoIntegration(config);
      
      case 'discord':
        return await this.testDiscordIntegration(config);
      
      case 'slack':
        return await this.testSlackIntegration(config);
      
      case 'github':
        return await this.testGitHubIntegration(config);
      
      default:
        return { success: false, error: `Test not implemented for service: ${serviceName}` };
    }
  }

  /**
   * Teste l'intégration Claude
   */
  async testClaudeIntegration(config) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Test' }]
        })
      });

      if (response.ok) {
        return { success: true, message: 'Claude API connection successful' };
      } else {
        const error = await response.json();
        return { success: false, error: error.error?.message || 'API request failed' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Teste l'intégration Discord
   */
  async testDiscordIntegration(config) {
    try {
      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: '✅ Test de connexion FlowForge réussi !',
          username: 'FlowForge'
        })
      });

      if (response.ok) {
        return { success: true, message: 'Discord webhook test message sent' };
      } else {
        return { success: false, error: `Discord API returned ${response.status}` };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Teste l'intégration Slack
   */
  async testSlackIntegration(config) {
    try {
      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: '✅ Test de connexion FlowForge réussi !',
          username: 'FlowForge'
        })
      });

      if (response.ok) {
        return { success: true, message: 'Slack webhook test message sent' };
      } else {
        return { success: false, error: `Slack API returned ${response.status}` };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Teste l'intégration GitHub
   */
  async testGitHubIntegration(config) {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${config.personalAccessToken}`,
          'User-Agent': 'FlowForge-v2.1'
        }
      });

      if (response.ok) {
        const user = await response.json();
        return { 
          success: true, 
          message: `Connected as ${user.login}`,
          details: { username: user.login, name: user.name }
        };
      } else {
        return { success: false, error: `GitHub API returned ${response.status}` };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Supprime une intégration
   */
  async deleteIntegration(userId, integrationId) {
    try {
      const query = `
        DELETE FROM credentials
        WHERE id = $1 AND user_id = $2
        RETURNING service_name
      `;

      const result = await pool.query(query, [integrationId, userId]);

      if (result.rows.length === 0) {
        throw new Error('Integration not found');
      }

      logger.info('Integration deleted', {
        integrationId,
        userId,
        serviceName: result.rows[0].service_name
      });

      return { success: true };

    } catch (error) {
      logger.error('Failed to delete integration', {
        integrationId,
        userId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Récupère une intégration par ID
   */
  async getIntegrationById(userId, integrationId) {
    try {
      const query = `
        SELECT id, service_name, service_type, display_name, encrypted_data, status
        FROM credentials
        WHERE id = $1 AND user_id = $2
      `;

      const result = await pool.query(query, [integrationId, userId]);

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];

    } catch (error) {
      logger.error('Failed to get integration by ID', {
        integrationId,
        userId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Met à jour le statut d'une intégration
   */
  async updateIntegrationStatus(integrationId, status) {
    try {
      const query = `
        UPDATE credentials
        SET status = $1, last_tested = NOW(), updated_at = NOW()
        WHERE id = $2
      `;

      await pool.query(query, [status, integrationId]);

    } catch (error) {
      logger.error('Failed to update integration status', {
        integrationId,
        status,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Détermine la catégorie d'une intégration
   */
  determineCategory(integrationName) {
    const name = integrationName.toLowerCase();
    
    for (const [categoryKey, categoryInfo] of Object.entries(this.serviceCategories)) {
      if (categoryInfo.services.some(service => name.includes(service))) {
        return categoryKey;
      }
    }
    
    return 'other';
  }

  /**
   * Valide les données d'intégration
   */
  validateIntegrationData(data) {
    const { name, displayName, authType, config } = data;

    if (!name || typeof name !== 'string') {
      throw new Error('Integration name is required');
    }

    if (!displayName || typeof displayName !== 'string') {
      throw new Error('Display name is required');
    }

    if (!authType || typeof authType !== 'string') {
      throw new Error('Auth type is required');
    }

    if (!config || typeof config !== 'object') {
      throw new Error('Configuration is required');
    }

    // Valider selon le type d'authentification
    switch (authType) {
      case 'api_key':
        if (!config.apiKey) {
          throw new Error('API key is required');
        }
        break;
      
      case 'oauth2':
        if (!config.clientId || !config.clientSecret) {
          throw new Error('OAuth2 credentials are required');
        }
        break;
      
      case 'webhook':
        if (!config.webhookUrl) {
          throw new Error('Webhook URL is required');
        }
        break;
      
      case 'token':
        if (!config.personalAccessToken && !config.accessToken) {
          throw new Error('Access token is required');
        }
        break;
    }
  }

  /**
   * Méthodes de test pour les autres services (stubs)
   */
  async testGoogleSheetsIntegration(config) {
    return { success: false, error: 'Google Sheets test not yet implemented' };
  }

  async testBrevoIntegration(config) {
    return { success: false, error: 'Brevo test not yet implemented' };
  }
}

// Instance singleton
export const integrationsManager = new IntegrationsManager();