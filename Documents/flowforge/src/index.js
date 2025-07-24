import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { pool } from './db/pool.js';
import { logger } from './utils/logger.js';
import { pipedreamAdapter } from './pipedream-adapter.js';
import { workflowEngine } from './workflow-engine.js';
import { integrationsManager } from './integrations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Créer l'instance Fastify
const fastify = Fastify({
  logger: false // Utiliser notre logger personnalisé
});

// Servir les fichiers statiques
await fastify.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'public'),
  prefix: '/'
});

// Middleware de logging
fastify.addHook('onRequest', async (request, reply) => {
  logger.info('Incoming request', {
    method: request.method,
    url: request.url,
    ip: request.ip
  });
});

// Middleware d'authentification (simplifié pour la démo)
const authenticateUser = async (request, reply) => {
  // En production, implémenter une vraie authentification JWT
  const userId = request.headers['x-user-id'] || '1';
  request.userId = userId;
};

/**
 * Routes API principales
 */

// Route de santé
fastify.get('/health', async (request, reply) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      pipedream: pipedreamAdapter.isInitialized(),
      workflowEngine: workflowEngine.isInitialized()
    }
  };

  try {
    await pool.query('SELECT 1');
    health.services.database = 'healthy';
  } catch (error) {
    health.services.database = 'unhealthy';
    health.status = 'degraded';
  }

  return health;
});

/**
 * Routes Intégrations avec support Pipedream
 */

// Récupérer toutes les intégrations disponibles (incluant Pipedream)
fastify.get('/v1/integrations/available', async (request, reply) => {
  try {
    const integrations = await integrationsManager.getAvailableIntegrations();
    return {
      success: true,
      data: integrations
    };
  } catch (error) {
    logger.error('Failed to get available integrations', { error: error.message });
    reply.code(500).send({
      success: false,
      error: 'Failed to retrieve available integrations'
    });
  }
});

// Récupérer les intégrations de l'utilisateur
fastify.get('/v1/integrations', { preHandler: authenticateUser }, async (request, reply) => {
  try {
    const integrations = await integrationsManager.getUserIntegrations(request.userId);
    return {
      success: true,
      data: integrations
    };
  } catch (error) {
    logger.error('Failed to get user integrations', { 
      userId: request.userId, 
      error: error.message 
    });
    reply.code(500).send({
      success: false,
      error: 'Failed to retrieve integrations'
    });
  }
});

// Créer une nouvelle intégration
fastify.post('/v1/integrations', { preHandler: authenticateUser }, async (request, reply) => {
  try {
    const integration = await integrationsManager.createIntegration(
      request.userId,
      request.body
    );
    
    return {
      success: true,
      data: integration
    };
  } catch (error) {
    logger.error('Failed to create integration', { 
      userId: request.userId, 
      error: error.message 
    });
    reply.code(400).send({
      success: false,
      error: error.message
    });
  }
});

// Tester une intégration
fastify.post('/v1/integrations/:id/test', { preHandler: authenticateUser }, async (request, reply) => {
  try {
    const testResult = await integrationsManager.testIntegration(
      request.userId,
      request.params.id
    );
    
    return {
      success: true,
      data: testResult
    };
  } catch (error) {
    logger.error('Failed to test integration', { 
      userId: request.userId,
      integrationId: request.params.id,
      error: error.message 
    });
    reply.code(500).send({
      success: false,
      error: 'Failed to test integration'
    });
  }
});

// Supprimer une intégration
fastify.delete('/v1/integrations/:id', { preHandler: authenticateUser }, async (request, reply) => {
  try {
    await integrationsManager.deleteIntegration(request.userId, request.params.id);
    
    return {
      success: true,
      message: 'Integration deleted successfully'
    };
  } catch (error) {
    logger.error('Failed to delete integration', { 
      userId: request.userId,
      integrationId: request.params.id,
      error: error.message 
    });
    reply.code(500).send({
      success: false,
      error: 'Failed to delete integration'
    });
  }
});

/**
 * Routes Composants Pipedream
 */

// Récupérer les détails d'un composant Pipedream
fastify.get('/v1/pipedream/components/:name', async (request, reply) => {
  try {
    if (!pipedreamAdapter.isInitialized()) {
      reply.code(503).send({
        success: false,
        error: 'Pipedream adapter not initialized'
      });
      return;
    }

    const component = pipedreamAdapter.getComponentDetails(request.params.name);
    
    if (!component) {
      reply.code(404).send({
        success: false,
        error: 'Component not found'
      });
      return;
    }

    return {
      success: true,
      data: component
    };
  } catch (error) {
    logger.error('Failed to get component details', { 
      componentName: request.params.name,
      error: error.message 
    });
    reply.code(500).send({
      success: false,
      error: 'Failed to retrieve component details'
    });
  }
});

// Exécuter un composant Pipedream
fastify.post('/v1/pipedream/components/:name/execute', { preHandler: authenticateUser }, async (request, reply) => {
  try {
    if (!pipedreamAdapter.isInitialized()) {
      reply.code(503).send({
        success: false,
        error: 'Pipedream adapter not initialized'
      });
      return;
    }

    const { actionName, parameters } = request.body;
    
    const result = await pipedreamAdapter.executeComponent(
      request.params.name,
      actionName,
      parameters,
      { userId: request.userId }
    );

    return {
      success: true,
      data: result
    };
  } catch (error) {
    logger.error('Failed to execute component', { 
      componentName: request.params.name,
      userId: request.userId,
      error: error.message 
    });
    reply.code(500).send({
      success: false,
      error: 'Failed to execute component'
    });
  }
});

/**
 * Routes Workflows avec support Pipedream
 */

// Exécuter un workflow
fastify.post('/v1/workflows/:id/execute', { preHandler: authenticateUser }, async (request, reply) => {
  try {
    if (!workflowEngine.isInitialized()) {
      reply.code(503).send({
        success: false,
        error: 'Workflow engine not initialized'
      });
      return;
    }

    // En production, récupérer le workflow depuis la base de données
    const workflow = {
      id: request.params.id,
      name: 'Test Workflow',
      nodes: request.body.nodes || {},
      connections: request.body.connections || []
    };

    const triggerData = request.body.triggerData || {};
    const context = { userId: request.userId };

    const result = await workflowEngine.executeWorkflow(workflow, triggerData, context);

    return {
      success: true,
      data: result
    };
  } catch (error) {
    logger.error('Failed to execute workflow', { 
      workflowId: request.params.id,
      userId: request.userId,
      error: error.message 
    });
    reply.code(500).send({
      success: false,
      error: 'Failed to execute workflow'
    });
  }
});

// Récupérer le statut d'exécution d'un workflow
fastify.get('/v1/workflows/executions/:executionId', { preHandler: authenticateUser }, async (request, reply) => {
  try {
    if (!workflowEngine.isInitialized()) {
      reply.code(503).send({
        success: false,
        error: 'Workflow engine not initialized'
      });
      return;
    }

    const status = workflowEngine.getExecutionStatus(request.params.executionId);
    
    if (!status) {
      reply.code(404).send({
        success: false,
        error: 'Execution not found'
      });
      return;
    }

    return {
      success: true,
      data: status
    };
  } catch (error) {
    logger.error('Failed to get execution status', { 
      executionId: request.params.executionId,
      error: error.message 
    });
    reply.code(500).send({
      success: false,
      error: 'Failed to retrieve execution status'
    });
  }
});

// Récupérer les statistiques du moteur de workflow
fastify.get('/v1/workflows/stats', { preHandler: authenticateUser }, async (request, reply) => {
  try {
    if (!workflowEngine.isInitialized()) {
      reply.code(503).send({
        success: false,
        error: 'Workflow engine not initialized'
      });
      return;
    }

    const stats = workflowEngine.getExecutionStats();
    const pipedreamStats = {
      initialized: pipedreamAdapter.isInitialized(),
      componentsAvailable: pipedreamAdapter.isInitialized() 
        ? pipedreamAdapter.getAvailableComponents().length 
        : 0
    };

    return {
      success: true,
      data: {
        workflows: stats,
        pipedream: pipedreamStats
      }
    };
  } catch (error) {
    logger.error('Failed to get workflow stats', { error: error.message });
    reply.code(500).send({
      success: false,
      error: 'Failed to retrieve statistics'
    });
  }
});

/**
 * Gestion des erreurs globales
 */
fastify.setErrorHandler((error, request, reply) => {
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    url: request.url,
    method: request.method
  });

  reply.code(500).send({
    success: false,
    error: 'Internal server error'
  });
});

/**
 * Initialisation et démarrage du serveur
 */
async function start() {
  try {
    logger.info('Starting FlowForge v2.1 with Pipedream integration...');

    // Initialiser les composants
    await pipedreamAdapter.initialize();
    await workflowEngine.initialize();

    // Démarrer le serveur
    await fastify.listen({ 
      port: config.port, 
      host: '0.0.0.0' 
    });

    logger.info('FlowForge server started successfully', {
      port: config.port,
      nodeEnv: config.nodeEnv,
      pipedreamEnabled: pipedreamAdapter.isInitialized(),
      workflowEngineEnabled: workflowEngine.isInitialized()
    });

  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

// Gestion propre de l'arrêt
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  
  try {
    await fastify.close();
    await pool.end();
    logger.info('Server shut down successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', { error: error.message });
    process.exit(1);
  }
});

// Démarrer le serveur
start();