const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               parseInt(process.env.DB_PORT) || 5432,
  database:           process.env.DB_NAME     || 'document_vault',
  user:               process.env.DB_USER     || 'vault_user',
  password:           process.env.DB_PASSWORD || '',
  max:                parseInt(process.env.DB_POOL_MAX) || 10,
  idleTimeoutMillis:  parseInt(process.env.DB_POOL_IDLE_TIMEOUT) || 30000,
  connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONN_TIMEOUT) || 2000,
});

pool.on('connect', () => {
  logger.debug('New database connection established');
});

pool.on('error', (err) => {
  logger.error('Unexpected database pool error', { error: err.message });
  process.exit(-1);
});

/**
 * Execute a parameterized query.
 * @param {string} text  - SQL query with $1, $2 placeholders
 * @param {Array}  params - Query parameters
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Query executed', { duration: `${duration}ms`, rows: result.rowCount });
    return result;
  } catch (error) {
    logger.error('Database query error', { error: error.message, query: text });
    throw error;
  }
};

/**
 * Get a client from the pool (for transactions).
 */
const getClient = () => pool.connect();

/**
 * Initialize DB — verify connection on startup.
 */
const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    logger.info('Database connection verified');

    // Run schema creation (idempotent)
    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(__dirname, 'init.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schema);
      logger.info('Database schema initialized');
    }

    client.release();
  } catch (error) {
    logger.error('Failed to initialize database', { error: error.message });
    throw error;
  }
};

module.exports = { query, getClient, initializeDatabase, pool };
