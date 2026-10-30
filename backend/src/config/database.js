const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const logger = require('../utils/logger');

const poolConfig = {
  host:               process.env.DB_HOST     || 'localhost',
  port:               parseInt(process.env.DB_PORT) || 5432,
  database:           process.env.DB_NAME     || 'document_vault',
  user:               process.env.DB_USER     || 'vault_user',
  password:           process.env.DB_PASSWORD || '',
  max:                parseInt(process.env.DB_POOL_MAX) || 10,
  idleTimeoutMillis:  parseInt(process.env.DB_POOL_IDLE_TIMEOUT) || 30000,
  connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONN_TIMEOUT) || 2000,
};

// Enable SSL with full RDS CA certificate validation when DB_SSL is enabled
if (process.env.DB_SSL === 'true' || process.env.DB_SSL === 'require') {
  const rdsCaBundlePath = process.env.DB_CA_CERT_PATH || path.join(__dirname, 'certs/global-bundle.pem');

  if (fs.existsSync(rdsCaBundlePath)) {
    poolConfig.ssl = {
      rejectUnauthorized: true,
      ca: fs.readFileSync(rdsCaBundlePath, 'utf8'),
    };
    logger.info('Database SSL enabled with Amazon RDS CA bundle certificate validation');
  } else {
    poolConfig.ssl = {
      rejectUnauthorized: true,
    };
    logger.warn(`Database SSL enabled with strict CA validation; CA bundle not found at ${rdsCaBundlePath}, using system trust store`);
  }
}

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  logger.debug('New database connection established');
});

pool.on('error', (err) => {
  logger.error('Unexpected database pool error', { error: err.message });
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
