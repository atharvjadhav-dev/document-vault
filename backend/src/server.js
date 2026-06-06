require('dotenv').config();

const app = require('./app');
const { initializeDatabase } = require('./config/database');
const logger = require('./utils/logger');

const PORT = parseInt(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    // Initialize DB connection and run schema
    logger.info('Connecting to database...');
    await initializeDatabase();
    logger.info('Database ready.');

    // Start HTTP server
    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🔐 Document Vault API running`, {
        port: PORT,
        environment: process.env.NODE_ENV,
        pid: process.pid,
      });
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });

      // Force exit after 10s
      setTimeout(() => {
        logger.error('Forcing shutdown after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

    // Unhandled rejections
    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Promise Rejection', { reason: String(reason) });
    });

  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
};

startServer();
