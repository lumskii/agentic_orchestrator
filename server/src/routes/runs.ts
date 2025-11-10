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

  // Approve merge for a run
  fastify.post('/:id/approve-merge', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const run = await orchestrator.getRun(id);
      
      if (!run) {
        return reply.code(404).send({ success: false, error: 'Run not found' });
      }

      if (run.status !== 'completed') {
        return reply.code(400).send({ success: false, error: 'Run must be completed before merge approval' });
      }

      // Check if merge step exists and was successful
      const mergeStep = run.steps?.find(step => step.name === 'merge');
      if (mergeStep && mergeStep.status === 'completed' && mergeStep.output?.status === 'success') {
        // Already merged successfully, return the existing merge data
        const existingMergeResult = {
          runId: id,
          mergedAt: mergeStep.output.mergedAt,
          status: 'already_approved',
          productionChanges: mergeStep.output.changesApplied || 0,
          performanceImprovement: mergeStep.output.performanceImprovement || '0%',
          rollbackAvailable: true,
          message: 'This run has already been successfully merged to production'
        };
        
        return { success: true, data: existingMergeResult };
      }

      // Simulate merge approval process
      logger.info(`Approving merge for run: ${id}`);
      
      // In a real implementation, this would:
      // 1. Validate all changes are safe
      // 2. Create a backup point
      // 3. Apply changes to production
      // 4. Verify changes were applied correctly
      
      const mergeResult = {
        runId: id,
        mergedAt: new Date().toISOString(),
        status: 'approved',
        productionChanges: run.steps?.filter(step => step.name === 'dba')?.[0]?.output?.appliedChanges || [],
        performanceImprovement: run.steps?.filter(step => step.name === 'dba')?.[0]?.output?.performanceMetrics?.queryTime?.improvement || '0%',
        rollbackAvailable: true
      };
      
      return { success: true, data: mergeResult };
    } catch (error) {
      logger.error('Failed to approve merge', error);
      reply.code(500).send({ success: false, error: 'Failed to approve merge' });
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
