/**
 * Populate vector embeddings for documents
 * Uses OpenAI API to generate embeddings for sample documents
 */

import { config } from '../server/src/utils/config.js';
import { db } from '../server/src/services/db.js';
import { searchService } from '../server/src/services/search.js';
import { logger } from '../server/src/utils/logger.js';

// Sample documents about database management and Tiger Cloud
const sampleDocuments = [
  {
    title: 'Introduction to Zero-Copy Database Forks',
    content: `Zero-copy forks allow you to instantly create a copy of your database without duplicating data. 
    This is achieved through copy-on-write (COW) technology, where only changes are stored separately. 
    Tiger Cloud implements zero-copy forks, enabling developers to experiment safely without affecting production.
    Use cases include testing schema migrations, running analytics queries, and creating staging environments.`,
    metadata: { category: 'tiger-cloud', topic: 'forks' },
  },
  {
    title: 'Hybrid Search with BM25 and Vectors',
    content: `Hybrid search combines the best of both worlds: BM25 for keyword matching and vector similarity for semantic understanding.
    BM25 (Best Match 25) is a probabilistic ranking function used in full-text search, excelling at exact keyword matches.
    Vector search uses embeddings to find semantically similar content, even when different words are used.
    Reciprocal Rank Fusion (RRF) merges results from both methods, providing more relevant and diverse search results.`,
    metadata: { category: 'search', topic: 'hybrid-search' },
  },
  {
    title: 'Database Index Optimization Strategies',
    content: `Database indexes are crucial for query performance. B-tree indexes work well for range queries and sorting.
    Hash indexes are optimal for equality comparisons. GIN (Generalized Inverted Index) is ideal for full-text search.
    Vector indexes like IVFFlat and HNSW enable fast approximate nearest neighbor search for embeddings.
    Always analyze query patterns before creating indexes, as they consume storage and slow down writes.`,
    metadata: { category: 'database', topic: 'optimization' },
  },
  {
    title: 'PostgreSQL Full-Text Search Configuration',
    content: `PostgreSQL provides powerful full-text search capabilities through tsvector and tsquery types.
    The ts_rank function calculates relevance scores based on term frequency and position.
    You can create custom text search configurations for different languages and domain-specific vocabularies.
    GIN indexes on tsvector columns dramatically improve full-text search performance for large datasets.`,
    metadata: { category: 'postgresql', topic: 'full-text-search' },
  },
  {
    title: 'Multi-Agent Systems for Database Operations',
    content: `Multi-agent systems decompose complex database tasks into specialized agents with distinct responsibilities.
    An ETL agent handles data extraction, transformation, and loading. A search agent retrieves relevant context.
    An analyst agent generates insights and recommendations. A DBA agent applies optimizations safely.
    A merge agent integrates validated changes back to production. This orchestration enables safe, automated database management.`,
    metadata: { category: 'ai', topic: 'multi-agent' },
  },
];

async function populateVectors() {
  try {
    logger.info('🚀 Starting vector population process...');
    
    // Check OpenAI API key
    if (!config.openaiApiKey) {
      logger.warn('⚠️ OPENAI_API_KEY not configured - using mock embeddings');
    }
    
    // Clear existing documents (optional)
    const clearExisting = process.argv.includes('--clear');
    if (clearExisting) {
      logger.info('🗑️ Clearing existing documents...');
      await db.query('TRUNCATE TABLE documents RESTART IDENTITY CASCADE');
    }
    
    // Index each document
    logger.info(`📚 Indexing ${sampleDocuments.length} documents...`);
    
    for (let i = 0; i < sampleDocuments.length; i++) {
      const doc = sampleDocuments[i];
      logger.info(`[${i + 1}/${sampleDocuments.length}] Indexing: ${doc.title}`);
      
      try {
        const docId = await searchService.indexDocument(
          doc.title,
          doc.content,
          doc.metadata
        );
        logger.info(`  ✅ Indexed as document ID: ${docId}`);
      } catch (error) {
        logger.error(`  ❌ Failed to index document: ${doc.title}`, error);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Verify indexing
    const result = await db.query('SELECT COUNT(*) as count FROM documents');
    const count = result.rows[0].count;
    
    logger.info('');
    logger.info(`✨ Vector population complete!`);
    logger.info(`📊 Total documents in database: ${count}`);
    logger.info('');
    logger.info('Next steps:');
    logger.info('1. Test BM25 search: curl -X POST http://localhost:3001/api/questions -d \'{"question":"database forks","method":"bm25"}\'');
    logger.info('2. Test vector search: curl -X POST http://localhost:3001/api/questions -d \'{"question":"database forks","method":"vector"}\'');
    logger.info('3. Test hybrid search: curl -X POST http://localhost:3001/api/questions -d \'{"question":"database forks","method":"hybrid"}\'');
    
    await db.close();
    process.exit(0);
  } catch (error) {
    logger.error('❌ Vector population failed', error);
    await db.close();
    process.exit(1);
  }
}

// Run the script
populateVectors();
