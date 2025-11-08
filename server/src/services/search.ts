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
   * Generate deterministic mock embedding based on text content
   * Useful for testing and when OpenAI API is not available
   */
  private generateDeterministicEmbedding(text: string): number[] {
    // Create a simple hash-based embedding that's deterministic
    const normalizedText = text.toLowerCase().trim();
    const embedding = new Array(1536);
    
    // Use text characteristics to generate consistent embeddings
    for (let i = 0; i < 1536; i++) {
      let value = 0;
      
      // Factor in character codes
      for (let j = 0; j < normalizedText.length; j++) {
        value += normalizedText.charCodeAt(j) * (i + 1) * (j + 1);
      }
      
      // Factor in text length and position
      value += normalizedText.length * i;
      value += normalizedText.includes('coordination') ? 0.1 * i : 0;
      value += normalizedText.includes('database') ? 0.15 * i : 0;
      value += normalizedText.includes('workflow') ? 0.12 * i : 0;
      
      // Normalize to [-1, 1] range
      embedding[i] = (Math.sin(value) + Math.cos(value * 0.7)) / 2;
    }
    
    return embedding;
  }
  /**
   * Generate embedding vector for text using OpenAI
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      logger.debug(`Generating embedding for text: ${text.substring(0, 50)}...`);
      
      // Check if OpenAI API key is available
      const openaiApiKey = process.env.OPENAI_API_KEY;
      
      if (openaiApiKey) {
        // Use actual OpenAI API
        const response = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'text-embedding-3-small',
            input: text,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.statusText}`);
        }
        
        const data = await response.json() as { data: Array<{ embedding: number[] }> };
        return data.data[0].embedding;
      } else {
        // Fallback to deterministic mock embedding based on text content
        logger.warn('No OpenAI API key found, using deterministic mock embeddings');
        return this.generateDeterministicEmbedding(text);
      }
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
        title: row.title,
        content: row.content,
        bm25Score: row.bm25_score,
        vectorScore: 0,
        hybridScore: row.bm25_score,
        score: row.bm25_score,
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
        title: row.title,
        content: row.content,
        bm25Score: 0,
        vectorScore: row.similarity_score,
        hybridScore: row.similarity_score,
        score: row.similarity_score,
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
        title: row.title,
        content: row.content,
        bm25Score: row.bm25_score,
        vectorScore: row.vector_score,
        hybridScore: row.hybrid_score,
        score: row.hybrid_score,
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
