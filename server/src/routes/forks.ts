/**
 * API routes for Tiger Cloud fork management
 * Handles zero-copy database forking operations
 */

import type { FastifyPluginAsync } from 'fastify';
import { tigerWrapper } from '../services/tigerWrapper.js';
import { logger } from '../utils/logger.js';

const forksRoutes: FastifyPluginAsync = async (fastify) => {
  // List all services
  fastify.get('/services', async (request, reply) => {
    try {
      const services = await tigerWrapper.listServices();
      return { success: true, data: services };
    } catch (error) {
      logger.error('Failed to list services', error);
      reply.code(500).send({ success: false, error: 'Failed to list services' });
    }
  });

  // Create a fork
  fastify.post('/', async (request, reply) => {
    try {
      const { serviceId, name } = request.body as { serviceId: string; name: string };
      
      if (!serviceId || !name) {
        return reply.code(400).send({ 
          success: false, 
          error: 'serviceId and name are required' 
        });
      }
      
      const fork = await tigerWrapper.createFork(serviceId, name);
      return { success: true, data: fork };
    } catch (error) {
      logger.error('Failed to create fork', error);
      reply.code(500).send({ success: false, error: 'Failed to create fork' });
    }
  });

  // Delete a service/fork
  fastify.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      await tigerWrapper.deleteService(id);
      
      return { success: true, message: 'Service deleted' };
    } catch (error) {
      logger.error('Failed to delete service', error);
      reply.code(500).send({ success: false, error: 'Failed to delete service' });
    }
  });

  // Merge fork back to parent
  fastify.post('/:forkId/merge', async (request, reply) => {
    try {
      const { forkId } = request.params as { forkId: string };
      const { parentServiceId } = request.body as { parentServiceId: string };
      
      if (!parentServiceId) {
        return reply.code(400).send({ 
          success: false, 
          error: 'parentServiceId is required' 
        });
      }
      
      await tigerWrapper.mergeFork(forkId, parentServiceId);
      return { success: true, message: 'Fork merged successfully' };
    } catch (error) {
      logger.error('Failed to merge fork', error);
      reply.code(500).send({ success: false, error: 'Failed to merge fork' });
    }
  });
};

export default forksRoutes;
