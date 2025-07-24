import { createClient } from '@pipedream/sdk';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { logger } from './utils/logger.js';
import { config } from './config.js';

/**
 * FlowForge - Adaptateur Pipedream
 * Intègre les composants open source Pipedream dans FlowForge
 */
export class PipedreamAdapter {
  constructor() {
    this.client = null;
    this.componentRegistry = new Map();
    this.activeComponents = new Map();
    this.initialized = false;
  }

  /**
   * Initialise l'adaptateur Pipedream
   */
  async initialize() {
    try {
      // Initialiser le client Pipedream si une clé API est disponible
      if (config.pipedreamApiKey) {
        this.client = createClient({
          apiKey: config.pipedreamApiKey,
          environment: config.nodeEnv === 'production' ? 'production' : 'development'
        });
      }

      // Charger les composants disponibles depuis le registre GitHub
      await this.loadComponentRegistry();
      
      this.initialized = true;
      logger.info('Pipedream adapter initialized successfully', {
        componentsLoaded: this.componentRegistry.size,
        hasApiKey: !!config.pipedreamApiKey
      });
    } catch (error) {
      logger.error('Failed to initialize Pipedream adapter', { error: error.message });
      throw error;
    }
  }

  /**
   * Charge le registre des composants Pipedream depuis GitHub
   */
  async loadComponentRegistry() {
    try {
      // Charger les composants populaires depuis l'API GitHub
      const response = await axios.get(
        'https://api.github.com/repos/PipedreamHQ/pipedream/contents/components',
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'FlowForge-v2.1'
          }
        }
      );

      // Parser les dossiers de composants
      for (const item of response.data) {
        if (item.type === 'dir') {
          const componentInfo = await this.loadComponentInfo(item.name);
          if (componentInfo) {
            this.componentRegistry.set(item.name, componentInfo);
          }
        }
      }

      logger.info(`Loaded ${this.componentRegistry.size} Pipedream components`);
    } catch (error) {
      logger.warn('Could not load Pipedream component registry', { error: error.message });
      // Charger des composants par défaut en mode dégradé
      this.loadDefaultComponents();
    }
  }

  /**
   * Charge les informations d'un composant spécifique
   */
  async loadComponentInfo(componentName) {
    try {
      // Charger le package.json du composant pour obtenir les métadonnées
      const packageResponse = await axios.get(
        `https://raw.githubusercontent.com/PipedreamHQ/pipedream/master/components/${componentName}/package.json`
      );

      const packageData = packageResponse.data;
      
      return {
        name: componentName,
        displayName: packageData.pd_metadata?.displayName || componentName,
        description: packageData.description || 'Pipedream component',
        version: packageData.version || '1.0.0',
        category: this.determineCategory(componentName),
        actions: await this.loadComponentActions(componentName),
        sources: await this.loadComponentSources(componentName),
        auth: packageData.pd_metadata?.auth || null
      };
    } catch (error) {
      logger.debug(`Could not load component info for ${componentName}`, { error: error.message });
      return null;
    }
  }

  /**
   * Charge les actions disponibles pour un composant
   */
  async loadComponentActions(componentName) {
    try {
      const response = await axios.get(
        `https://api.github.com/repos/PipedreamHQ/pipedream/contents/components/${componentName}/actions`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'FlowForge-v2.1'
          }
        }
      );

      const actions = [];
      for (const file of response.data) {
        if (file.name.endsWith('.mjs') || file.name.endsWith('.js')) {
          const actionName = file.name.replace(/\.(mjs|js)$/, '');
          actions.push({
            name: actionName,
            displayName: this.formatDisplayName(actionName),
            file: file.name,
            downloadUrl: file.download_url
          });
        }
      }

      return actions;
    } catch (error) {
      return [];
    }
  }

  /**
   * Charge les sources d'événements pour un composant
   */
  async loadComponentSources(componentName) {
    try {
      const response = await axios.get(
        `https://api.github.com/repos/PipedreamHQ/pipedream/contents/components/${componentName}/sources`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'FlowForge-v2.1'
          }
        }
      );

      const sources = [];
      for (const file of response.data) {
        if (file.name.endsWith('.mjs') || file.name.endsWith('.js')) {
          const sourceName = file.name.replace(/\.(mjs|js)$/, '');
          sources.push({
            name: sourceName,
            displayName: this.formatDisplayName(sourceName),
            file: file.name,
            downloadUrl: file.download_url
          });
        }
      }

      return sources;
    } catch (error) {
      return [];
    }
  }

  /**
   * Charge des composants par défaut en mode dégradé
   */
  loadDefaultComponents() {
    const defaultComponents = [
      {
        name: 'http',
        displayName: 'HTTP / Webhooks',
        description: 'Trigger workflows with HTTP requests',
        category: 'triggers',
        actions: [
          { name: 'send-http-request', displayName: 'Send HTTP Request' }
        ],
        sources: [
          { name: 'new-webhook-requests', displayName: 'New Webhook Requests' }
        ]
      },
      {
        name: 'slack',
        displayName: 'Slack',
        description: 'Send messages and interact with Slack',
        category: 'communication',
        actions: [
          { name: 'send-message', displayName: 'Send Message to Channel' },
          { name: 'send-direct-message', displayName: 'Send Direct Message' }
        ],
        sources: [
          { name: 'new-message', displayName: 'New Message in Channel' }
        ]
      },
      {
        name: 'discord',
        displayName: 'Discord',
        description: 'Send messages to Discord channels',
        category: 'communication',
        actions: [
          { name: 'send-message', displayName: 'Send Message to Channel' }
        ]
      },
      {
        name: 'google-sheets',
        displayName: 'Google Sheets',
        description: 'Create and update Google Sheets',
        category: 'productivity',
        actions: [
          { name: 'add-row', displayName: 'Add Row' },
          { name: 'update-row', displayName: 'Update Row' },
          { name: 'get-values', displayName: 'Get Cell Values' }
        ],
        sources: [
          { name: 'new-row', displayName: 'New Row Added' }
        ]
      },
      {
        name: 'gmail',
        displayName: 'Gmail',
        description: 'Send emails via Gmail',
        category: 'email',
        actions: [
          { name: 'send-email', displayName: 'Send Email' }
        ],
        sources: [
          { name: 'new-email', displayName: 'New Email Received' }
        ]
      }
    ];

    defaultComponents.forEach(component => {
      this.componentRegistry.set(component.name, component);
    });

    logger.info(`Loaded ${defaultComponents.length} default Pipedream components`);
  }

  /**
   * Exécute un composant Pipedream
   */
  async executeComponent(componentName, actionName, params, context = {}) {
    try {
      const executionId = uuidv4();
      logger.info('Executing Pipedream component', {
        executionId,
        componentName,
        actionName,
        userId: context.userId
      });

      const component = this.componentRegistry.get(componentName);
      if (!component) {
        throw new Error(`Component ${componentName} not found in registry`);
      }

      const action = component.actions?.find(a => a.name === actionName);
      if (!action) {
        throw new Error(`Action ${actionName} not found in component ${componentName}`);
      }

      // Exécuter le composant selon son type
      let result;
      if (this.client && component.auth) {
        // Utiliser l'API Pipedream si disponible
        result = await this.executeViaAPI(component, action, params, context);
      } else {
        // Exécuter localement le composant
        result = await this.executeLocally(component, action, params, context);
      }

      logger.info('Component execution completed', {
        executionId,
        componentName,
        actionName,
        success: true
      });

      return {
        success: true,
        executionId,
        result,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Component execution failed', {
        componentName,
        actionName,
        error: error.message,
        userId: context.userId
      });

      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Exécute un composant via l'API Pipedream
   */
  async executeViaAPI(component, action, params, context) {
    if (!this.client) {
      throw new Error('Pipedream client not initialized');
    }

    // Implementation spécifique à l'API Pipedream
    // Cette partie nécessiterait l'accès à l'API Connect de Pipedream
    throw new Error('API execution not yet implemented');
  }

  /**
   * Exécute un composant localement
   */
  async executeLocally(component, action, params, context) {
    // Simulation d'exécution locale pour les composants de base
    switch (component.name) {
      case 'http':
        return await this.executeHttpAction(action, params);
      
      case 'slack':
        return await this.executeSlackAction(action, params, context);
      
      case 'discord':
        return await this.executeDiscordAction(action, params, context);
      
      case 'google-sheets':
        return await this.executeGoogleSheetsAction(action, params, context);
      
      case 'gmail':
        return await this.executeGmailAction(action, params, context);
      
      default:
        throw new Error(`Local execution not implemented for component ${component.name}`);
    }
  }

  /**
   * Exécute une action HTTP
   */
  async executeHttpAction(action, params) {
    const { url, method = 'GET', headers = {}, data } = params;
    
    const response = await axios({
      method,
      url,
      headers,
      data: method === 'GET' ? undefined : data
    });

    return {
      status: response.status,
      data: response.data,
      headers: response.headers
    };
  }

  /**
   * Exécute une action Slack
   */
  async executeSlackAction(action, params, context) {
    // Nécessite une intégration Slack configurée
    const integration = await this.getIntegration('slack', context.userId);
    if (!integration) {
      throw new Error('Slack integration not configured');
    }

    switch (action.name) {
      case 'send-message':
        return await this.sendSlackMessage(params, integration);
      default:
        throw new Error(`Slack action ${action.name} not implemented`);
    }
  }

  /**
   * Détermine la catégorie d'un composant
   */
  determineCategory(componentName) {
    const categories = {
      'communication': ['slack', 'discord', 'telegram', 'whatsapp'],
      'email': ['gmail', 'outlook', 'sendgrid', 'mailgun'],
      'productivity': ['google-sheets', 'notion', 'airtable', 'trello'],
      'social': ['twitter', 'facebook', 'instagram', 'linkedin'],
      'storage': ['dropbox', 'google-drive', 'aws-s3', 'onedrive'],
      'triggers': ['http', 'webhook', 'schedule', 'email']
    };

    for (const [category, components] of Object.entries(categories)) {
      if (components.some(comp => componentName.includes(comp))) {
        return category;
      }
    }

    return 'other';
  }

  /**
   * Formate un nom d'action en nom d'affichage
   */
  formatDisplayName(name) {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Récupère une intégration utilisateur
   */
  async getIntegration(serviceName, userId) {
    // Cette méthode devra être connectée au système d'intégrations existant
    // Pour l'instant, retourne null
    return null;
  }

  /**
   * Envoie un message Slack
   */
  async sendSlackMessage(params, integration) {
    // Implementation Slack basique
    const { channel, text, username } = params;
    
    // Utiliser le webhook ou l'API Slack selon la configuration
    if (integration.webhookUrl) {
      const response = await axios.post(integration.webhookUrl, {
        channel,
        text,
        username: username || 'FlowForge'
      });
      
      return { success: true, response: response.data };
    }
    
    throw new Error('Slack webhook URL not configured');
  }

  /**
   * Récupère la liste des composants disponibles
   */
  getAvailableComponents() {
    return Array.from(this.componentRegistry.values()).map(component => ({
      name: component.name,
      displayName: component.displayName,
      description: component.description,
      category: component.category,
      actionsCount: component.actions?.length || 0,
      sourcesCount: component.sources?.length || 0,
      hasAuth: !!component.auth
    }));
  }

  /**
   * Récupère les détails d'un composant
   */
  getComponentDetails(componentName) {
    return this.componentRegistry.get(componentName);
  }

  /**
   * Vérifie si l'adaptateur est initialisé
   */
  isInitialized() {
    return this.initialized;
  }
}

// Instance singleton
export const pipedreamAdapter = new PipedreamAdapter();