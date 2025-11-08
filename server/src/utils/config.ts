/**
 * Configuration management
 * Loads and validates environment variables
 */

import { config as loadEnv } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root (parent of server directory)
loadEnv({ path: join(__dirname, '../../../.env') });

export const config = {
  // Server
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Tiger Cloud
  tigerApiKey: process.env.TIGER_API_KEY || '',
  serviceId: process.env.SERVICE_ID || '',
  
  // Database
  databaseUrl: process.env.DATABASE_URL || '',
  
  // OpenAI
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  
  // Feature flags
  enableMCP: process.env.ENABLE_MCP === 'true',
  enableVectorSearch: process.env.ENABLE_VECTOR_SEARCH !== 'false',
} as const;

// Validate required config
const validateConfig = () => {
  const required = ['databaseUrl'];
  const missing = required.filter(key => !config[key as keyof typeof config]);
  
  if (missing.length > 0) {
    console.warn(`Missing configuration: ${missing.join(', ')}`);
    console.warn('Some features may not work correctly.');
  }
};

validateConfig();
