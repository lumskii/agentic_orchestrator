/**
 * Hybrid search service combining BM25 and vector similarity
 * Implements Reciprocal Rank Fusion (RRF) for result merging
 */

import { db } from './db.js';
import { sqlTemplates } from '../utils/sqlTemplates.js';
import { logger } from '../utils/logger.js';
import type { SearchResult } from '../types.js';

class SearchService {
  /**
   * Generate embedding vector for text using OpenAI
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      logger.debug(`Generating embedding for text: ${text.substring(0, 50)}...`);
      
      // TODO: Implement actual OpenAI embedding generation
      // const response = await openai.embeddings.create({
      //   model: 'text-embedding-3-small',
      //   input: text,
      // });
      // return response.data[0].embedding;
      
      // Mock embedding (1536 dimensions for text-embedding-3-small)
      return Array.from({ length: 1536 }, () => Math.random());
    } catch (error) {
      logger.error('Failed to generate embedding', error);
      throw error;
    }
  }

  /**
   * Perform BM25 full-text search
   */
  async bm25Search(query: string, limit: number = 10): Promise<SearchResult[]> {
    try {
      logger.info(`Executing BM25 search: ${query}`);
      
      const result = await db.query(sqlTemplates.bm25Search, [query, limit]);
      
      return result.rows.map(row => ({
        id: row.id,
        content: row.content,
        bm25Score: row.bm25_score,
        vectorScore: 0,
        hybridScore: row.bm25_score,
        metadata: row.metadata,
      }));
    } catch (error) {
      logger.error('BM25 search failed', error);
      throw error;
    }
  }

  /**
   * Perform vector similarity search
   */
  async vectorSearch(query: string, limit: number = 10): Promise<SearchResult[]> {
    try {
      logger.info(`Executing vector search: ${query}`);
      
      const embedding = await this.generateEmbedding(query);
      const result = await db.query(sqlTemplates.vectorSearch, [JSON.stringify(embedding), limit]);
      
      return result.rows.map(row => ({
        id: row.id,
        content: row.content,
        bm25Score: 0,
        vectorScore: row.similarity_score,
        hybridScore: row.similarity_score,
        metadata: row.metadata,
      }));
    } catch (error) {
      logger.error('Vector search failed', error);
      throw error;
    }
  }

  /**
   * Perform hybrid search (BM25 + Vector with RRF)
   */
  async hybridSearch(query: string, limit: number = 10): Promise<SearchResult[]> {
    try {
      logger.info(`Executing hybrid search: ${query}`);
      
      const embedding = await this.generateEmbedding(query);
      const result = await db.query(sqlTemplates.hybridSearch, [
        query,
        JSON.stringify(embedding),
        limit,
      ]);
      
      return result.rows.map(row => ({
        id: row.id,
        content: row.content,
        bm25Score: row.bm25_score,
        vectorScore: row.vector_score,
        hybridScore: row.hybrid_score,
        metadata: row.metadata,
      }));
    } catch (error) {
      logger.error('Hybrid search failed', error);
      throw error;
    }
  }

  /**
   * Index a document with its vector embedding
   */
  async indexDocument(
    title: string,
    content: string,
    metadata: Record<string, any> = {}
  ): Promise<string> {
    try {
      logger.info(`Indexing document: ${title}`);
      
      const embedding = await this.generateEmbedding(content);
      const result = await db.query(sqlTemplates.insertDocument, [
        title,
        content,
        JSON.stringify(embedding),
        JSON.stringify(metadata),
      ]);
      
      const docId = result.rows[0].id;
      logger.info(`Document indexed with ID: ${docId}`);
      return docId;
    } catch (error) {
      logger.error('Failed to index document', error);
      throw error;
    }
  }
}

export const searchService = new SearchService();
