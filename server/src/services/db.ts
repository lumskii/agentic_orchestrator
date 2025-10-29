/**
 * Database connection and query utilities
 * Manages PostgreSQL connection pool
 */

import pg from 'pg';
import { config } from '../utils/config.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

class Database {
  private pool: pg.Pool | null = null;

  async getPool(): Promise<pg.Pool> {
    if (!this.pool) {
      if (!config.databaseUrl) {
        throw new Error('DATABASE_URL not configured');
      }

      this.pool = new Pool({
        connectionString: config.databaseUrl,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      this.pool.on('error', (err) => {
        logger.error('Unexpected database error', err);
      });

      logger.info('Database pool created');
    }

    return this.pool;
  }

  async query<T extends pg.QueryResultRow = pg.QueryResultRow>(text: string, params?: any[]): Promise<pg.QueryResult<T>> {
    const pool = await this.getPool();
    const start = Date.now();
    
    try {
      const result = await pool.query<T>(text, params);
      const duration = Date.now() - start;
      logger.debug(`Query executed in ${duration}ms`, { text, duration });
      return result;
    } catch (error) {
      logger.error('Database query error', { text, error });
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      logger.info('Database pool closed');
    }
  }
}

export const db = new Database();

// Graceful shutdown
process.on('SIGTERM', async () => {
  await db.close();
  process.exit(0);
});
