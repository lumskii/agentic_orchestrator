/**
 * Main server entry point
 * Initializes Fastify server with routes and middleware
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './utils/config.js';
import { logger } from './utils/logger.js';
import { dbInitializer } from './services/dbInit.js';
import runsRoutes from './routes/runs.js';
import forksRoutes from './routes/forks.js';
import questionsRoutes from './routes/questions.js';

const fastify = Fastify({
  logger: true
});

// Start server
const start = async () => {
  try {
    // Initialize database first
    logger.info('🗄️ Initializing database...');
    await dbInitializer.initialize();

    // Register CORS
    await fastify.register(cors, {
      origin: config.frontendUrl,
      credentials: true
    });

    // Enhanced health check with database status
    fastify.get('/health', async () => {
      const dbHealth = await dbInitializer.checkHealth();
      return { 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        database: dbHealth
      };
    });

    // Register routes
    await fastify.register(runsRoutes, { prefix: '/api/runs' });
    await fastify.register(forksRoutes, { prefix: '/api/forks' });
    await fastify.register(questionsRoutes, { prefix: '/api/questions' });
    
    await fastify.listen({ port: config.port, host: '0.0.0.0' });
    logger.info(`Server listening on port ${config.port}`);
    logger.info(`Environment: ${config.nodeEnv}`);
  } catch (err) {
    if (err instanceof Error) {
      logger.error(err);
    } else {
      logger.error(String(err));
    }
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  await fastify.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await fastify.close();
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
});

start().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
