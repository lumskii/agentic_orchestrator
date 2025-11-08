/**
 * Database initialization service
 * Ensures required extensions and tables are created on startup
 */

import { db } from './db.js';
import { logger } from '../utils/logger.js';
import { sqlTemplates } from '../utils/sqlTemplates.js';

export class DatabaseInitializer {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.debug('Database already initialized, skipping...');
      return;
    }

    try {
      logger.info('🚀 Initializing database...');

      // Enable required extensions
      logger.info('📦 Installing PostgreSQL extensions...');
      await this.enableExtensions();

      // Create required tables
      logger.info('🏗️ Creating database tables...');
      await this.createTables();

      // Validate setup
      logger.info('✅ Validating database setup...');
      await this.validateSetup();

      this.initialized = true;
      logger.info('✨ Database initialization complete!');
    } catch (error) {
      logger.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  private async enableExtensions(): Promise<void> {
    try {
      // Try pgvector first (most common)
      await db.query('CREATE EXTENSION IF NOT EXISTS vector;');
      logger.info('  ✅ pgvector extension enabled');
    } catch (error) {
      logger.warn('  ⚠️ pgvector not available, trying alternatives...', error);
      
      try {
        // Try pgvectorscale for Tiger Cloud
        await db.query('CREATE EXTENSION IF NOT EXISTS vectorscale;');
        logger.info('  ✅ pgvectorscale extension enabled');
      } catch (vectorscaleError) {
        logger.warn('  ⚠️ pgvectorscale not available, vector search disabled');
        logger.warn('  📝 To enable vector search, install pgvector or pgvectorscale extension');
      }
    }

    // Enable text search extensions
    try {
      await db.query('CREATE EXTENSION IF NOT EXISTS pg_trgm;');
      logger.info('  ✅ pg_trgm extension enabled');
    } catch (error) {
      logger.warn('  ⚠️ pg_trgm extension failed:', error);
    }

    // Additional extensions for full functionality
    try {
      await db.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
      logger.info('  ✅ uuid-ossp extension enabled');
    } catch (error) {
      logger.debug('  📝 uuid-ossp extension not available (optional)', error);
    }
  }

  private async createTables(): Promise<void> {
    // Create documents table for hybrid search
    // Try with vector column first, fallback to text if vector extension not available
    try {
      const createDocumentsSQL = `
        CREATE TABLE IF NOT EXISTS documents (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          embedding vector(1536),
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `;
      await db.query(createDocumentsSQL);
      logger.info('  ✅ Documents table created with vector support');
    } catch (error) {
      logger.warn('  ⚠️ Vector column failed, creating table without vector support:', error);
      
      // Fallback: create table without vector column
      const createDocumentsNoVectorSQL = `
        CREATE TABLE IF NOT EXISTS documents (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          embedding TEXT,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `;
      
      try {
        await db.query(createDocumentsNoVectorSQL);
        logger.info('  ✅ Documents table created (vector search disabled)');
      } catch (fallbackError) {
        logger.error('  ❌ Failed to create documents table:', fallbackError);
        throw fallbackError;
      }
    }

    // Create indexes for better performance
    try {
      // BM25 full-text search index
      await db.query(`
        CREATE INDEX IF NOT EXISTS idx_documents_content_fts 
        ON documents USING GIN (to_tsvector('english', content));
      `);
      logger.info('  ✅ Full-text search index created');

      // Try to create vector similarity index
      try {
        await db.query(`
          CREATE INDEX IF NOT EXISTS idx_documents_embedding_cosine 
          ON documents USING ivfflat (embedding vector_cosine_ops) 
          WITH (lists = 100);
        `);
        logger.info('  ✅ Vector similarity index created');
      } catch (vectorIndexError) {
        logger.warn('  ⚠️ Vector index creation skipped (extension not available)', vectorIndexError);
        
        // Try creating a simpler index without vector-specific operators
        try {
          await db.query(`
            CREATE INDEX IF NOT EXISTS idx_documents_embedding_simple 
            ON documents (embedding);
          `);
          logger.info('  ✅ Simple embedding index created');
        } catch (simpleIndexError) {
          logger.warn('  📝 No embedding index created - vector search may be slow');
        }
      }

      // Metadata index for category filtering
      await db.query(`
        CREATE INDEX IF NOT EXISTS idx_documents_metadata 
        ON documents USING GIN (metadata);
      `);
      logger.info('  ✅ Metadata index created');

    } catch (error) {
      logger.warn('  ⚠️ Some indexes could not be created:', error);
    }
  }

  private async validateSetup(): Promise<void> {
    // Check if documents table exists
    const tableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'documents'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      throw new Error('Documents table not found after creation');
    }

    // Check vector extension availability
    const vectorCheck = await db.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_extension 
        WHERE extname IN ('vector', 'vectorscale')
      );
    `);

    const hasVectorSupport = vectorCheck.rows[0].exists;
    logger.info(`  📊 Vector search support: ${hasVectorSupport ? 'Available' : 'Disabled'}`);

    // Check pg_trgm for BM25
    const triggramCheck = await db.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_extension 
        WHERE extname = 'pg_trgm'
      );
    `);

    const hasBM25Support = triggramCheck.rows[0].exists;
    logger.info(`  🔍 BM25 search support: ${hasBM25Support ? 'Available' : 'Disabled'}`);

    if (!hasBM25Support && !hasVectorSupport) {
      logger.warn('  ⚠️ No search extensions available - search functionality will be limited');
    }
  }

  async checkHealth(): Promise<{ 
    status: 'healthy' | 'degraded' | 'unhealthy'; 
    extensions: string[];
    tables: string[];
    message?: string;
  }> {
    try {
      // Check extensions
      const extensionsResult = await db.query(`
        SELECT extname FROM pg_extension 
        WHERE extname IN ('vector', 'vectorscale', 'pg_trgm', 'uuid-ossp');
      `);
      const extensions = extensionsResult.rows.map(row => row.extname);

      // Check tables
      const tablesResult = await db.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('documents', 'runs', 'forks');
      `);
      const tables = tablesResult.rows.map(row => row.table_name);

      const hasVectorSupport = extensions.includes('vector') || extensions.includes('vectorscale');
      const hasBM25Support = extensions.includes('pg_trgm');
      const hasDocuments = tables.includes('documents');

      if (hasDocuments && (hasVectorSupport || hasBM25Support)) {
        return {
          status: 'healthy',
          extensions,
          tables,
          message: 'All database features available'
        };
      } else if (hasDocuments) {
        return {
          status: 'degraded',
          extensions,
          tables,
          message: 'Basic functionality available, search features limited'
        };
      } else {
        return {
          status: 'unhealthy',
          extensions,
          tables,
          message: 'Database not properly initialized'
        };
      }
    } catch (error) {
      logger.error('Database health check failed:', error);
      return {
        status: 'unhealthy',
        extensions: [],
        tables: [],
        message: `Health check failed: ${error}`
      };
    }
  }
}

export const dbInitializer = new DatabaseInitializer();