/**
 * Enhanced TigerDB file storage service
 * Provides native PostgreSQL file storage with TimescaleDB optimizations
 */

import { db } from './db.js';
import { logger } from '../utils/logger.js';
import { tigerWrapper } from './tigerWrapper.js';

interface FileUpload {
  id: number;
  filename: string;
  fileSize: number;
  mimeType: string;
  fileData: Buffer;
  uploadTime: Date;
  processedTime?: Date;
  metadata: Record<string, any>;
}

interface ProcessedDocument {
  id: number;
  sourceFileId: number;
  title: string;
  content: string;
  chunkIndex: number;
  metadata: Record<string, any>;
}

class TigerFileService {
  /**
   * Initialize enhanced file storage tables
   */
  async initializeFileStorage(): Promise<void> {
    try {
      logger.info('🗄️ Initializing TigerDB file storage...');

      // Create file uploads table with binary storage
      await db.query(`
        CREATE TABLE IF NOT EXISTS file_uploads (
          id SERIAL PRIMARY KEY,
          filename TEXT NOT NULL,
          file_size BIGINT NOT NULL,
          mime_type TEXT,
          file_data BYTEA NOT NULL,
          upload_time TIMESTAMPTZ DEFAULT NOW(),
          processed_time TIMESTAMPTZ,
          processing_status TEXT DEFAULT 'pending',
          metadata JSONB DEFAULT '{}',
          CONSTRAINT file_size_positive CHECK (file_size > 0)
        );
      `);

      // Create index for efficient file queries
      await db.query(`
        CREATE INDEX IF NOT EXISTS idx_file_uploads_upload_time 
        ON file_uploads (upload_time DESC);
      `);

      await db.query(`
        CREATE INDEX IF NOT EXISTS idx_file_uploads_status 
        ON file_uploads (processing_status);
      `);

      // Enhance documents table with file references
      await db.query(`
        ALTER TABLE documents 
        ADD COLUMN IF NOT EXISTS source_file_id INTEGER REFERENCES file_uploads(id),
        ADD COLUMN IF NOT EXISTS chunk_index INTEGER DEFAULT 0;
      `);

      // Create time-series analytics views (TimescaleDB feature)
      await db.query(`
        CREATE OR REPLACE VIEW file_upload_analytics AS
        SELECT 
          DATE_TRUNC('hour', upload_time) as hour,
          COUNT(*) as uploads_count,
          SUM(file_size) as total_size,
          AVG(file_size) as avg_size,
          COUNT(CASE WHEN processing_status = 'completed' THEN 1 END) as processed_count
        FROM file_uploads
        GROUP BY DATE_TRUNC('hour', upload_time)
        ORDER BY hour DESC;
      `);

      logger.info('✅ TigerDB file storage initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize file storage', error);
      throw error;
    }
  }

  /**
   * Store file directly in TigerDB with metadata
   */
  async storeFile(
    filename: string,
    fileBuffer: Buffer,
    mimeType: string,
    metadata: Record<string, any> = {}
  ): Promise<number> {
    try {
      logger.info(`📁 Storing file in TigerDB: ${filename} (${fileBuffer.length} bytes)`);

      const result = await db.query(`
        INSERT INTO file_uploads (filename, file_size, mime_type, file_data, metadata)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id;
      `, [filename, fileBuffer.length, mimeType, fileBuffer, JSON.stringify(metadata)]);

      const fileId = result.rows[0].id;
      logger.info(`✅ File stored successfully with ID: ${fileId}`);
      return fileId;
    } catch (error) {
      logger.error('❌ Failed to store file', error);
      throw error;
    }
  }

  /**
   * Process stored file and extract documents
   */
  async processStoredFile(fileId: number): Promise<ProcessedDocument[]> {
    try {
      logger.info(`🔄 Processing stored file: ${fileId}`);

      // Retrieve file data
      const fileResult = await db.query(`
        SELECT filename, file_data, mime_type, metadata
        FROM file_uploads 
        WHERE id = $1
      `, [fileId]);

      if (fileResult.rows.length === 0) {
        throw new Error(`File not found: ${fileId}`);
      }

      const file = fileResult.rows[0];
      const fileBuffer = file.file_data;
      const fileContent = fileBuffer.toString('utf-8');

      // Process based on file type
      let documents: ProcessedDocument[] = [];
      
      if (file.mime_type?.includes('json') || file.filename.endsWith('.json')) {
        documents = this.processJsonContent(fileContent, fileId);
      } else if (file.mime_type?.includes('csv') || file.filename.endsWith('.csv')) {
        documents = this.processCsvContent(fileContent, fileId);
      } else {
        documents = this.processTextContent(fileContent, file.filename, fileId);
      }

      // Store processed documents
      const storedDocs = await this.storeProcessedDocuments(documents);

      // Update file processing status
      await db.query(`
        UPDATE file_uploads 
        SET processed_time = NOW(), processing_status = 'completed'
        WHERE id = $1
      `, [fileId]);

      logger.info(`✅ File processed successfully: ${documents.length} documents extracted`);
      return storedDocs;
    } catch (error) {
      logger.error('❌ Failed to process file', error);
      
      // Update file processing status to error
      await db.query(`
        UPDATE file_uploads 
        SET processing_status = 'error'
        WHERE id = $1
      `, [fileId]);
      
      throw error;
    }
  }

  /**
   * Process JSON file content
   */
  private processJsonContent(content: string, fileId: number): ProcessedDocument[] {
    const data = JSON.parse(content);
    const documents: ProcessedDocument[] = [];

    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        documents.push({
          id: 0, // Will be set during storage
          sourceFileId: fileId,
          title: item.title || item.name || `JSON Item ${index + 1}`,
          content: item.content || item.description || JSON.stringify(item),
          chunkIndex: index,
          metadata: { source: 'json_upload', originalIndex: index, ...item }
        });
      });
    } else {
      documents.push({
        id: 0,
        sourceFileId: fileId,
        title: data.title || data.name || 'JSON Document',
        content: data.content || data.description || JSON.stringify(data),
        chunkIndex: 0,
        metadata: { source: 'json_upload', ...data }
      });
    }

    return documents;
  }

  /**
   * Process CSV file content
   */
  private processCsvContent(content: string, fileId: number): ProcessedDocument[] {
    const lines = content.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const documents: ProcessedDocument[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const record: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        record[header] = values[index] || '';
      });

      documents.push({
        id: 0,
        sourceFileId: fileId,
        title: record.title || record.name || `CSV Row ${i}`,
        content: Object.entries(record)
          .map(([k, v]) => `${k}: ${v}`)
          .join('\n'),
        chunkIndex: i - 1,
        metadata: { source: 'csv_upload', row: i, ...record }
      });
    }

    return documents;
  }

  /**
   * Process text file content
   */
  private processTextContent(content: string, filename: string, fileId: number): ProcessedDocument[] {
    const chunks = content.split('\n\n').filter(chunk => chunk.trim().length > 0);
    
    return chunks.map((chunk, index) => ({
      id: 0,
      sourceFileId: fileId,
      title: `${filename} - Part ${index + 1}`,
      content: chunk.trim(),
      chunkIndex: index,
      metadata: { source: 'text_upload', filename, part: index + 1 }
    }));
  }

  /**
   * Store processed documents in enhanced documents table
   */
  private async storeProcessedDocuments(documents: ProcessedDocument[]): Promise<ProcessedDocument[]> {
    const storedDocs: ProcessedDocument[] = [];

    for (const doc of documents) {
      try {
        // Generate embedding (simplified for this example)
        const embedding = JSON.stringify(new Array(1536).fill(0.1)); // Mock embedding

        const result = await db.query(`
          INSERT INTO documents (source_file_id, title, content, embedding, chunk_index, metadata, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, NOW())
          RETURNING id;
        `, [
          doc.sourceFileId,
          doc.title,
          doc.content,
          embedding,
          doc.chunkIndex,
          JSON.stringify(doc.metadata)
        ]);

        storedDocs.push({
          ...doc,
          id: result.rows[0].id
        });
      } catch (error) {
        logger.warn(`Failed to store document: ${doc.title}`, error);
      }
    }

    return storedDocs;
  }

  /**
   * Get file upload analytics
   */
  async getUploadAnalytics(): Promise<any[]> {
    const result = await db.query(`
      SELECT * FROM file_upload_analytics 
      LIMIT 24; -- Last 24 hours
    `);
    return result.rows;
  }

  /**
   * List stored files with processing status
   */
  async listStoredFiles(limit: number = 50): Promise<FileUpload[]> {
    const result = await db.query(`
      SELECT id, filename, file_size, mime_type, upload_time, 
             processed_time, processing_status, metadata
      FROM file_uploads
      ORDER BY upload_time DESC
      LIMIT $1;
    `, [limit]);

    return result.rows.map(row => ({
      id: row.id,
      filename: row.filename,
      fileSize: row.file_size,
      mimeType: row.mime_type,
      fileData: Buffer.alloc(0), // Don't return file data in list
      uploadTime: row.upload_time,
      processedTime: row.processed_time,
      metadata: row.metadata
    }));
  }

  /**
   * Create a fork for isolated file analysis
   */
  async createAnalysisFork(forkName: string): Promise<string> {
    try {
      const serviceId = process.env.SERVICE_ID;
      if (!serviceId) {
        throw new Error('SERVICE_ID not configured for fork creation');
      }

      const fork = await tigerWrapper.createFork(serviceId, forkName);
      logger.info(`✅ Analysis fork created: ${fork.id}`);
      
      return fork.connectionString || `Mock connection for ${fork.id}`;
    } catch (error) {
      logger.error('Failed to create analysis fork', error);
      throw error;
    }
  }
}

export const tigerFileService = new TigerFileService();