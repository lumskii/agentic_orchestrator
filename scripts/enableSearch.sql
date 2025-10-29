-- Enable required extensions for search functionality
-- Run this on your Tiger Cloud database

-- Enable text search extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable vector extension (pgvector or pgvectorscale)
CREATE EXTENSION IF NOT EXISTS vector;

-- Tiger Cloud may use pgvectorscale for enhanced performance
-- CREATE EXTENSION IF NOT EXISTS vectorscale;

-- Create full-text search configuration
CREATE TEXT SEARCH CONFIGURATION IF NOT EXISTS english_custom ( COPY = english );

-- Create sample documents table with hybrid search support
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),  -- OpenAI text-embedding-3-small dimension
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for BM25 full-text search
CREATE INDEX IF NOT EXISTS idx_documents_content_fts 
    ON documents USING GIN (to_tsvector('english', content));

CREATE INDEX IF NOT EXISTS idx_documents_title_fts 
    ON documents USING GIN (to_tsvector('english', title));

-- Create index for vector similarity search
-- Using IVFFlat for faster approximate search
CREATE INDEX IF NOT EXISTS idx_documents_embedding_ivfflat 
    ON documents USING ivfflat (embedding vector_cosine_ops) 
    WITH (lists = 100);

-- Alternatively, use HNSW for even better performance (if available)
-- CREATE INDEX IF NOT EXISTS idx_documents_embedding_hnsw 
--     ON documents USING hnsw (embedding vector_cosine_ops);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_documents_updated_at 
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE ON documents TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE documents_id_seq TO your_app_user;

-- Display summary
DO $$
BEGIN
    RAISE NOTICE 'Search extensions and tables created successfully!';
    RAISE NOTICE 'Tables: documents';
    RAISE NOTICE 'Indexes: BM25 full-text search + Vector similarity (IVFFlat)';
    RAISE NOTICE 'Next step: Run populateVectors.ts to add sample data';
END $$;
