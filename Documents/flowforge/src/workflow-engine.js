import { pipedreamAdapter } from './pipedream-adapter.js';
import { logger } from './utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * FlowForge v2.1 - Moteur de Workflow Avancé
 * Support des branches complexes et intégration Pipedream
 */
export class WorkflowEngine {
  constructor() {
    this.activeExecutions = new Map();
    this.executionHistory = new Map();
    this.initialized = false;
  }

  /**
   * Initialise le moteur de workflow
   */
  async initialize() {
    try {
      // Initialiser l'adaptateur Pipedream
      await pipedreamAdapter.initialize();
      
      this.initialized = true;
      logger.info('Workflow engine initialized with Pipedream support');
    } catch (error) {
      logger.error('Failed to initialize workflow engine', { error: error.message });
      throw error;
    }
  }

  /**
   * Exécute un workflow complet
   */
  async executeWorkflow(workflow, triggerData, context = {}) {
    const executionId = uuidv4();
    const execution = {
      id: executionId,
      workflowId: workflow.id,
      status: 'running',
      startTime: Date.now(),
      triggerData,
      context,
      executionPath: [],
      results: new Map(),
      errors: []
    };

    this.activeExecutions.set(executionId, execution);

    try {
      logger.info('Starting workflow execution', {
        executionId,
        workflowId: workflow.id,
        workflowName: workflow.name,
        userId: context.userId
      });

      // Valider la structure du workflow
      this.validateWorkflow(workflow);

      // Exécuter les nœuds selon la topologie
      const result = await this.executeNodes(workflow, execution);

      // Finaliser l'exécution
      execution.status = 'completed';
      execution.endTime = Date.now();
      execution.duration = execution.endTime - execution.startTime;

      logger.info('Workflow execution completed', {
        executionId,
        duration: execution.duration,
        nodesExecuted: execution.executionPath.length
      });

      return {
        success: true,
        executionId,
        result,
        duration: execution.duration,
        executionPath: execution.executionPath
      };

    } catch (error) {
      execution.status = 'failed';
      execution.endTime = Date.now();
      execution.duration = execution.endTime - execution.startTime;
      execution.errors.push({
        message: error.message,
        timestamp: Date.now(),
        stack: error.stack
      });

      logger.error('Workflow execution failed', {
        executionId,
        error: error.message,
        duration: execution.duration
      });

      return {
        success: false,
        executionId,
        error: error.message,
        duration: execution.duration,
        executionPath: execution.executionPath
      };

    } finally {
      // Déplacer vers l'historique après un délai
      setTimeout(() => {
        this.executionHistory.set(executionId, execution);
        this.activeExecutions.delete(executionId);
      }, 60000); // Garder 1 minute en mémoire active
    }
  }

  /**
   * Exécute les nœuds du workflow selon la topologie
   */
  async executeNodes(workflow, execution) {
    const nodes = workflow.nodes || {};
    const connections = workflow.connections || [];
    
    // Trouver le nœud de démarrage
    const startNode = this.findStartNode(nodes);
    if (!startNode) {
      throw new Error('No start node found in workflow');
    }

    // Contexte d'exécution partagé
    const executionContext = {
      data: execution.triggerData,
      variables: new Map(),
      userId: execution.context.userId,
      executionId: execution.id
    };

    // Exécuter à partir du nœud de démarrage
    return await this.executeNode(startNode, nodes, connections, executionContext, execution);
  }

  /**
   * Exécute un nœud individuel
   */
  async executeNode(node, allNodes, connections, context, execution) {
    const nodeId = node.id;
    const nodeType = node.type;

    logger.debug('Executing node', {
      nodeId,
      nodeType,
      executionId: execution.id
    });

    // Ajouter à l'historique d'exécution
    execution.executionPath.push({
      nodeId,
      nodeType,
      timestamp: Date.now(),
      input: { ...context.data }
    });

    let result;

    try {
      // Exécuter selon le type de nœud
      switch (nodeType) {
        case 'trigger':
          result = await this.executeTriggerNode(node, context);
          break;
        
        case 'pipedream':
          result = await this.executePipedreamNode(node, context);
          break;
        
        case 'condition':
          result = await this.executeConditionNode(node, context);
          break;
        
        case 'switch':
          result = await this.executeSwitchNode(node, context);
          break;
        
        case 'merge':
          result = await this.executeMergeNode(node, context);
          break;
        
        case 'code':
          result = await this.executeCodeNode(node, context);
          break;
        
        case 'delay':
          result = await this.executeDelayNode(node, context);
          break;
        
        case 'email':
          result = await this.executeEmailNode(node, context);
          break;
        
        default:
          throw new Error(`Unknown node type: ${nodeType}`);
      }

      // Sauvegarder le résultat
      execution.results.set(nodeId, result);
      
      // Mettre à jour le contexte
      if (result && typeof result === 'object') {
        context.data = { ...context.data, ...result };
      }

      // Trouver et exécuter les nœuds suivants
      const nextNodes = this.findNextNodes(nodeId, connections, allNodes, result);
      
      if (nextNodes.length === 0) {
        // Nœud terminal
        return result;
      } else if (nextNodes.length === 1) {
        // Exécution séquentielle
        return await this.executeNode(nextNodes[0], allNodes, connections, context, execution);
      } else {
        // Exécution parallèle (branches multiples)
        const parallelResults = await Promise.all(
          nextNodes.map(nextNode => 
            this.executeNode(nextNode, allNodes, connections, { ...context }, execution)
          )
        );
        
        return parallelResults;
      }

    } catch (error) {
      logger.error('Node execution failed', {
        nodeId,
        nodeType,
        error: error.message,
        executionId: execution.id
      });
      
      // Ajouter l'erreur à l'historique
      execution.executionPath[execution.executionPath.length - 1].error = error.message;
      
      throw error;
    }
  }

  /**
   * Exécute un nœud Pipedream
   */
  async executePipedreamNode(node, context) {
    const { componentName, actionName, parameters } = node.config;
    
    if (!pipedreamAdapter.isInitialized()) {
      throw new Error('Pipedream adapter not initialized');
    }

    // Interpoler les paramètres avec les données du contexte
    const interpolatedParams = this.interpolateParameters(parameters, context);
    
    // Exécuter le composant Pipedream
    const result = await pipedreamAdapter.executeComponent(
      componentName,
      actionName,
      interpolatedParams,
      {
        userId: context.userId,
        executionId: context.executionId
      }
    );

    if (!result.success) {
      throw new Error(`Pipedream component execution failed: ${result.error}`);
    }

    return result.result;
  }

  /**
   * Exécute un nœud de condition
   */
  async executeConditionNode(node, context) {
    const { conditions, operator = 'AND' } = node.config;
    
    const results = conditions.map(condition => {
      const { field, operator: condOp, value } = condition;
      const fieldValue = this.getFieldValue(field, context);
      
      return this.evaluateCondition(fieldValue, condOp, value);
    });
    
    const result = operator === 'AND' 
      ? results.every(r => r)
      : results.some(r => r);
    
    return { conditionResult: result, evaluatedConditions: results };
  }

  /**
   * Exécute un nœud switch
   */
  async executeSwitchNode(node, context) {
    const { field, cases, defaultCase } = node.config;
    const fieldValue = this.getFieldValue(field, context);
    
    // Chercher une correspondance exacte
    const matchingCase = cases.find(c => c.value === fieldValue);
    const selectedCase = matchingCase || defaultCase;
    
    return {
      switchValue: fieldValue,
      selectedCase: selectedCase?.name || 'default',
      caseValue: selectedCase?.value
    };
  }

  /**
   * Exécute un nœud de fusion
   */
  async executeMergeNode(node, context) {
    const { strategy = 'merge' } = node.config;
    
    // Pour l'instant, simple fusion des données
    return {
      mergeStrategy: strategy,
      mergedData: context.data,
      timestamp: Date.now()
    };
  }

  /**
   * Exécute un nœud de code JavaScript
   */
  async executeCodeNode(node, context) {
    const { code } = node.config;
    
    if (!code) {
      throw new Error('No code provided for code node');
    }

    try {
      // Créer un contexte sécurisé pour l'exécution
      const sandbox = {
        data: context.data,
        variables: Object.fromEntries(context.variables),
        console: {
          log: (...args) => logger.info('Code node output', { output: args })
        },
        // Utilitaires disponibles
        moment: null, // À implémenter si nécessaire
        fetch: null   // À implémenter si nécessaire
      };

      // Exécuter le code dans un contexte restreint
      const func = new Function('context', `
        with (context) {
          ${code}
        }
      `);
      
      const result = func(sandbox);
      
      return {
        codeResult: result,
        modifiedData: sandbox.data
      };
      
    } catch (error) {
      throw new Error(`Code execution failed: ${error.message}`);
    }
  }

  /**
   * Exécute un nœud de délai
   */
  async executeDelayNode(node, context) {
    const { delay, unit = 'seconds' } = node.config;
    
    const multipliers = {
      seconds: 1000,
      minutes: 60000,
      hours: 3600000
    };
    
    const delayMs = delay * (multipliers[unit] || 1000);
    
    logger.info('Executing delay', { delay, unit, delayMs });
    
    await new Promise(resolve => setTimeout(resolve, delayMs));
    
    return {
      delayed: true,
      delayDuration: delayMs,
      unit
    };
  }

  /**
   * Exécute un nœud email
   */
  async executeEmailNode(node, context) {
    // Utiliser le composant Pipedream pour l'email si disponible
    return await this.executePipedreamNode({
      ...node,
      config: {
        componentName: 'gmail',
        actionName: 'send-email',
        parameters: node.config
      }
    }, context);
  }

  /**
   * Exécute un nœud trigger
   */
  async executeTriggerNode(node, context) {
    // Le trigger a déjà été déclenché, on passe simplement les données
    return context.data;
  }

  /**
   * Trouve le nœud de démarrage
   */
  findStartNode(nodes) {
    return Object.values(nodes).find(node => 
      node.type === 'trigger' || node.isStart === true
    );
  }

  /**
   * Trouve les nœuds suivants selon les connexions
   */
  findNextNodes(currentNodeId, connections, allNodes, executionResult) {
    const outgoingConnections = connections.filter(conn => conn.source === currentNodeId);
    
    return outgoingConnections
      .filter(conn => this.shouldFollowConnection(conn, executionResult))
      .map(conn => allNodes[conn.target])
      .filter(node => node); // Éliminer les nœuds inexistants
  }

  /**
   * Détermine si une connexion doit être suivie
   */
  shouldFollowConnection(connection, executionResult) {
    // Si pas de condition, toujours suivre
    if (!connection.condition) {
      return true;
    }

    // Évaluer la condition de la connexion
    const { type, value } = connection.condition;
    
    switch (type) {
      case 'always':
        return true;
      
      case 'success':
        return executionResult && !executionResult.error;
      
      case 'error':
        return executionResult && !!executionResult.error;
      
      case 'condition':
        return executionResult && executionResult.conditionResult === true;
      
      case 'switch':
        return executionResult && executionResult.selectedCase === value;
      
      default:
        return true;
    }
  }

  /**
   * Interpole les paramètres avec les données du contexte
   */
  interpolateParameters(parameters, context) {
    if (!parameters || typeof parameters !== 'object') {
      return parameters;
    }

    const interpolated = {};
    
    for (const [key, value] of Object.entries(parameters)) {
      if (typeof value === 'string' && value.includes('{{')) {
        // Interpolation de template
        interpolated[key] = this.interpolateTemplate(value, context);
      } else if (typeof value === 'object') {
        // Interpolation récursive pour objets imbriqués
        interpolated[key] = this.interpolateParameters(value, context);
      } else {
        interpolated[key] = value;
      }
    }
    
    return interpolated;
  }

  /**
   * Interpole un template avec les données du contexte
   */
  interpolateTemplate(template, context) {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, field) => {
      const fieldValue = this.getFieldValue(field.trim(), context);
      return fieldValue !== undefined ? String(fieldValue) : match;
    });
  }

  /**
   * Récupère la valeur d'un champ depuis le contexte
   */
  getFieldValue(field, context) {
    const parts = field.split('.');
    let value = context.data;
    
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  /**
   * Évalue une condition
   */
  evaluateCondition(fieldValue, operator, expectedValue) {
    switch (operator) {
      case 'equals':
      case '==':
        return fieldValue == expectedValue;
      
      case 'not_equals':
      case '!=':
        return fieldValue != expectedValue;
      
      case 'greater_than':
      case '>':
        return Number(fieldValue) > Number(expectedValue);
      
      case 'less_than':
      case '<':
        return Number(fieldValue) < Number(expectedValue);
      
      case 'contains':
        return String(fieldValue).includes(String(expectedValue));
      
      case 'starts_with':
        return String(fieldValue).startsWith(String(expectedValue));
      
      case 'ends_with':
        return String(fieldValue).endsWith(String(expectedValue));
      
      case 'exists':
        return fieldValue !== undefined && fieldValue !== null;
      
      case 'empty':
        return !fieldValue || fieldValue === '';
      
      default:
        return false;
    }
  }

  /**
   * Valide la structure d'un workflow
   */
  validateWorkflow(workflow) {
    if (!workflow.nodes || Object.keys(workflow.nodes).length === 0) {
      throw new Error('Workflow must contain at least one node');
    }

    // Vérifier qu'il y a un nœud de démarrage
    const startNode = this.findStartNode(workflow.nodes);
    if (!startNode) {
      throw new Error('Workflow must contain a start/trigger node');
    }

    // Valider les connexions
    const connections = workflow.connections || [];
    const nodeIds = Object.keys(workflow.nodes);
    
    for (const connection of connections) {
      if (!nodeIds.includes(connection.source)) {
        throw new Error(`Invalid connection: source node ${connection.source} not found`);
      }
      if (!nodeIds.includes(connection.target)) {
        throw new Error(`Invalid connection: target node ${connection.target} not found`);
      }
    }
  }

  /**
   * Récupère le statut d'une exécution
   */
  getExecutionStatus(executionId) {
    const active = this.activeExecutions.get(executionId);
    if (active) {
      return {
        status: active.status,
        startTime: active.startTime,
        duration: Date.now() - active.startTime,
        nodesExecuted: active.executionPath.length
      };
    }

    const historical = this.executionHistory.get(executionId);
    if (historical) {
      return {
        status: historical.status,
        startTime: historical.startTime,
        endTime: historical.endTime,
        duration: historical.duration,
        nodesExecuted: historical.executionPath.length
      };
    }

    return null;
  }

  /**
   * Récupère les statistiques d'exécution
   */
  getExecutionStats() {
    return {
      activeExecutions: this.activeExecutions.size,
      historicalExecutions: this.executionHistory.size,
      totalExecutions: this.activeExecutions.size + this.executionHistory.size
    };
  }

  /**
   * Vérifie si le moteur est initialisé
   */
  isInitialized() {
    return this.initialized;
  }
}

// Instance singleton
export const workflowEngine = new WorkflowEngine();