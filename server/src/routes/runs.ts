/**
 * API routes for orchestrator runs
 * Manages workflow execution lifecycle
 */

import type { FastifyPluginAsync } from 'fastify';
import { orchestrator } from '../orchestrator/index.js';
import { logger } from '../utils/logger.js';

const runsRoutes: FastifyPluginAsync = async (fastify) => {
  // List all runs
  fastify.get('/', async (request, reply) => {
    try {
      const runs = await orchestrator.listRuns();
      return { success: true, data: runs };
    } catch (error) {
      logger.error('Failed to list runs', error);
      reply.code(500).send({ success: false, error: 'Failed to list runs' });
    }
  });

  // Get run by ID
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const run = await orchestrator.getRun(id);
      
      if (!run) {
        return reply.code(404).send({ success: false, error: 'Run not found' });
      }
      
      return { success: true, data: run };
    } catch (error) {
      logger.error('Failed to get run', error);
      reply.code(500).send({ success: false, error: 'Failed to get run' });
    }
  });

  // Start a new run
  fastify.post('/', async (request, reply) => {
    try {
      const { question, serviceId } = request.body as { question?: string; serviceId?: string };
      
      const run = await orchestrator.startRun({
        question: question || 'Analyze database performance',
        serviceId: serviceId || 'default',
      });
      
      return { success: true, data: run };
    } catch (error) {
      logger.error('Failed to start run', error);
      reply.code(500).send({ success: false, error: 'Failed to start run' });
    }
  });

  // Cancel a run
  fastify.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      await orchestrator.cancelRun(id);
      
      return { success: true, message: 'Run cancelled' };
    } catch (error) {
      logger.error('Failed to cancel run', error);
      reply.code(500).send({ success: false, error: 'Failed to cancel run' });
    }
  });
};

export default runsRoutes;
