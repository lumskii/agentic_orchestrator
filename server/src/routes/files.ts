/**
 * Enhanced file upload routes using native TigerDB storage
 * Provides binary file storage, processing, and analytics
 */

import type { FastifyPluginAsync } from 'fastify';
import { tigerFileService } from '../services/tigerFileService.js';
import { logger } from '../utils/logger.js';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

const fileRoutes: FastifyPluginAsync = async (fastify) => {
  // Initialize file storage on startup
  await tigerFileService.initializeFileStorage();

  // Upload file with native TigerDB storage (Base64 approach)
  fastify.post('/upload', async (request, reply) => {
    try {
      const { filename, content, mimeType, metadata } = request.body as {
        filename: string;
        content: string; // Base64 or text content
        mimeType: string;
        metadata?: Record<string, any>;
      };

      if (!filename || !content) {
        return reply.code(400).send({
          success: false,
          error: 'filename and content are required'
        });
      }

      // Determine if content is base64 or direct text
      let fileBuffer: Buffer;
      if (mimeType.includes('text/') || mimeType.includes('json') || mimeType.includes('csv')) {
        // For text files, store as UTF-8
        fileBuffer = Buffer.from(content, 'utf-8');
      } else {
        // For binary files, expect base64
        fileBuffer = Buffer.from(content, 'base64');
      }

      // Store file in TigerDB
      const fileId = await tigerFileService.storeFile(
        filename,
        fileBuffer,
        mimeType,
        metadata || {}
      );

      // Process file and extract documents
      const documents = await tigerFileService.processStoredFile(fileId);

      return {
        success: true,
        data: {
          fileId,
          filename,
          size: fileBuffer.length,
          documentsExtracted: documents.length,
          documents: documents.slice(0, 3)
        }
      };
    } catch (error) {
      logger.error('Failed to upload file', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to upload file'
      });
    }
  });

  // Upload file via Base64 (for drag-and-drop from frontend)
  fastify.post('/upload-base64', async (request, reply) => {
    try {
      const { filename, content, mimeType, metadata } = request.body as {
        filename: string;
        content: string; // Base64 encoded
        mimeType: string;
        metadata?: Record<string, any>;
      };

      if (!filename || !content) {
        return reply.code(400).send({
          success: false,
          error: 'filename and content are required'
        });
      }

      // Decode base64 content
      const fileBuffer = Buffer.from(content, 'base64');

      // Store file in TigerDB
      const fileId = await tigerFileService.storeFile(
        filename,
        fileBuffer,
        mimeType,
        metadata || {}
      );

      // Process file and extract documents
      const documents = await tigerFileService.processStoredFile(fileId);

      return {
        success: true,
        data: {
          fileId,
          filename,
          size: fileBuffer.length,
          documentsExtracted: documents.length,
          documents: documents.slice(0, 3)
        }
      };
    } catch (error) {
      logger.error('Failed to upload base64 file', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to upload file'
      });
    }
  });

  // List uploaded files
  fastify.get('/files', async (request, reply) => {
    try {
      const { limit } = request.query as { limit?: string };
      const files = await tigerFileService.listStoredFiles(
        limit ? parseInt(limit, 10) : 50
      );

      return {
        success: true,
        data: files
      };
    } catch (error) {
      logger.error('Failed to list files', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to list files'
      });
    }
  });

  // Get file upload analytics
  fastify.get('/analytics', async (request, reply) => {
    try {
      const analytics = await tigerFileService.getUploadAnalytics();

      return {
        success: true,
        data: analytics
      };
    } catch (error) {
      logger.error('Failed to get analytics', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to get analytics'
      });
    }
  });

  // Create analysis fork
  fastify.post('/create-fork', async (request, reply) => {
    try {
      const { forkName } = request.body as { forkName: string };

      if (!forkName) {
        return reply.code(400).send({
          success: false,
          error: 'forkName is required'
        });
      }

      const connectionString = await tigerFileService.createAnalysisFork(forkName);

      return {
        success: true,
        data: {
          forkName,
          connectionString,
          message: 'Analysis fork created successfully'
        }
      };
    } catch (error) {
      logger.error('Failed to create analysis fork', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to create analysis fork'
      });
    }
  });

  // Process existing file by ID
  fastify.post('/process/:fileId', async (request, reply) => {
    try {
      const { fileId } = request.params as { fileId: string };
      const documents = await tigerFileService.processStoredFile(parseInt(fileId, 10));

      return {
        success: true,
        data: {
          fileId: parseInt(fileId, 10),
          documentsExtracted: documents.length,
          documents
        }
      };
    } catch (error) {
      logger.error('Failed to process file', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to process file'
      });
    }
  });
};

export default fileRoutes;