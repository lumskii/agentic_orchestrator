/**
 * Main server entry point
 * Initializes Fastify server with routes and middleware
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './utils/config.js';
import { logger } from './utils/logger.js';
import runsRoutes from './routes/runs.js';
import forksRoutes from './routes/forks.js';
import questionsRoutes from './routes/questions.js';

const fastify = Fastify({
  logger: true
});

// Register CORS
await fastify.register(cors, {
  origin: config.frontendUrl,
  credentials: true
});

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Register routes
await fastify.register(runsRoutes, { prefix: '/api/runs' });
await fastify.register(forksRoutes, { prefix: '/api/forks' });
await fastify.register(questionsRoutes, { prefix: '/api/questions' });

// Start server
const start = async () => {
  try {
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

start();
