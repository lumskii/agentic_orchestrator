/**
 * Configuration management
 * Loads and validates environment variables
 */

import { config as loadEnv } from 'dotenv';

loadEnv();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',

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
