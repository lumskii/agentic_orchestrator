/**
 * Debug routes for checking database state
 */

import type { FastifyPluginAsync } from 'fastify';
import { db } from '../services/db.js';
import { logger } from '../utils/logger.js';

const debugRoutes: FastifyPluginAsync = async (fastify) => {
  // Check database state
  fastify.get('/db-state', async (request, reply) => {
    try {
      // Count documents
      const countResult = await db.query('SELECT COUNT(*) as count FROM documents;');
      const documentCount = countResult.rows[0].count;

      // Get sample documents
      const sampleResult = await db.query(`
        SELECT id, title, LEFT(content, 100) as content_preview, metadata
        FROM documents 
        ORDER BY id 
        LIMIT 5;
      `);

      // Check file uploads
      const fileResult = await db.query('SELECT COUNT(*) as count FROM file_uploads;');
      const fileCount = fileResult.rows[0].count;

      // Test BM25 search
      const searchResult = await db.query(`
        SELECT 
          id,
          title,
          ts_rank(to_tsvector('english', content), plainto_tsquery('english', $1)) as bm25_score
        FROM documents
        WHERE to_tsvector('english', content) @@ plainto_tsquery('english', $1)
        ORDER BY bm25_score DESC
        LIMIT 3;
      `, ['customer']);

      return {
        success: true,
        data: {
          documentCount: parseInt(documentCount),
          fileCount: parseInt(fileCount),
          sampleDocuments: sampleResult.rows,
          testSearch: {
            query: 'customer',
            results: searchResult.rows
          }
        }
      };
    } catch (error) {
      logger.error('Failed to get database state', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to get database state'
      });
    }
  });

  // Reset database for testing
  fastify.post('/reset-db', async (request, reply) => {
    try {
      await db.query('DELETE FROM documents;');
      await db.query('DELETE FROM file_uploads;');
      
      return {
        success: true,
        message: 'Database reset successfully'
      };
    } catch (error) {
      logger.error('Failed to reset database', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to reset database'
      });
    }
  });
};

export default debugRoutes;