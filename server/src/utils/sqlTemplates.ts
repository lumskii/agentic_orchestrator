/**
 * SQL query templates for common operations
 * Supports BM25, vector search, and hybrid retrieval
 */

export const sqlTemplates = {
  // Enable required extensions
  enableExtensions: `
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
    CREATE EXTENSION IF NOT EXISTS vector;
    CREATE EXTENSION IF NOT EXISTS pgvector;
  `,

  // Create sample documents table with vector column
  createDocumentsTable: `
    CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      embedding vector(1536),
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS documents_content_idx ON documents USING GIN (to_tsvector('english', content));
    CREATE INDEX IF NOT EXISTS documents_embedding_idx ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
  `,

  // BM25 full-text search
  bm25Search: `
    SELECT 
      id,
      title,
      content,
      ts_rank(to_tsvector('english', content), plainto_tsquery('english', $1)) as bm25_score
    FROM documents
    WHERE to_tsvector('english', content) @@ plainto_tsquery('english', $1)
    ORDER BY bm25_score DESC
    LIMIT $2;
  `,

  // Vector similarity search
  vectorSearch: `
    SELECT 
      id,
      title,
      content,
      1 - (embedding <=> $1::vector) as similarity_score
    FROM documents
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> $1::vector
    LIMIT $2;
  `,

  // Hybrid search (BM25 + Vector with RRF - Reciprocal Rank Fusion)
  hybridSearch: `
    WITH bm25_results AS (
      SELECT 
        id,
        ROW_NUMBER() OVER (ORDER BY ts_rank(to_tsvector('english', content), plainto_tsquery('english', $1)) DESC) as rank
      FROM documents
      WHERE to_tsvector('english', content) @@ plainto_tsquery('english', $1)
      LIMIT 100
    ),
    vector_results AS (
      SELECT 
        id,
        ROW_NUMBER() OVER (ORDER BY embedding <=> $2::vector) as rank
      FROM documents
      WHERE embedding IS NOT NULL
      LIMIT 100
    )
    SELECT 
      COALESCE(b.id, v.id) as id,
      d.title,
      d.content,
      COALESCE(1.0 / (60 + b.rank), 0) as bm25_score,
      COALESCE(1.0 / (60 + v.rank), 0) as vector_score,
      (COALESCE(1.0 / (60 + b.rank), 0) + COALESCE(1.0 / (60 + v.rank), 0)) as hybrid_score
    FROM bm25_results b
    FULL OUTER JOIN vector_results v ON b.id = v.id
    JOIN documents d ON d.id = COALESCE(b.id, v.id)
    ORDER BY hybrid_score DESC
    LIMIT $3;
  `,

  // Insert document with embedding
  insertDocument: `
    INSERT INTO documents (title, content, embedding, metadata)
    VALUES ($1, $2, $3, $4)
    RETURNING id;
  `,

  // Get document by ID
  getDocument: `
    SELECT * FROM documents WHERE id = $1;
  `,
};

export type SQLTemplate = keyof typeof sqlTemplates;
