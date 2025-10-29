/**
 * API routes for question answering with hybrid search
 * Demonstrates RAG (Retrieval-Augmented Generation)
 */

import type { FastifyPluginAsync } from 'fastify';
import { searchService } from '../services/search.js';
import { logger } from '../utils/logger.js';

const questionsRoutes: FastifyPluginAsync = async (fastify) => {
  // Ask a question using hybrid search
  fastify.post('/', async (request, reply) => {
    try {
      const { question, method } = request.body as { 
        question: string; 
        method?: 'bm25' | 'vector' | 'hybrid' 
      };
      
      if (!question) {
        return reply.code(400).send({ 
          success: false, 
          error: 'question is required' 
        });
      }
      
      const searchMethod = method || 'hybrid';
      let results;
      
      switch (searchMethod) {
        case 'bm25':
          results = await searchService.bm25Search(question);
          break;
        case 'vector':
          results = await searchService.vectorSearch(question);
          break;
        case 'hybrid':
        default:
          results = await searchService.hybridSearch(question);
          break;
      }
      
      // TODO: Pass results to LLM to generate answer
      // const answer = await generateAnswer(question, results);
      const answer = `Based on the search results using ${searchMethod} method, here's what I found...`;
      
      return { 
        success: true, 
        data: {
          question,
          answer,
          sources: results,
          method: searchMethod,
        }
      };
    } catch (error) {
      logger.error('Failed to answer question', error);
      reply.code(500).send({ success: false, error: 'Failed to answer question' });
    }
  });

  // Index a new document
  fastify.post('/index', async (request, reply) => {
    try {
      const { title, content, metadata } = request.body as { 
        title: string; 
        content: string;
        metadata?: Record<string, any>;
      };
      
      if (!title || !content) {
        return reply.code(400).send({ 
          success: false, 
          error: 'title and content are required' 
        });
      }
      
      const docId = await searchService.indexDocument(title, content, metadata);
      
      return { 
        success: true, 
        data: { id: docId, message: 'Document indexed successfully' }
      };
    } catch (error) {
      logger.error('Failed to index document', error);
      reply.code(500).send({ success: false, error: 'Failed to index document' });
    }
  });
};

export default questionsRoutes;
