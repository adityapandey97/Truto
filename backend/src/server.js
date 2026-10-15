import app from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

let server;

async function bootstrap() {
  try {
    await connectDatabase();

    server = app.listen(env.PORT, () => {
      logger.info(`🚀 CodePilot AI Backend listening on port ${env.PORT} [${env.NODE_ENV}]`);
      logger.info(`📡 API Endpoints active at http://localhost:${env.PORT}/api/v1 and http://localhost:${env.PORT}/api`);
      logger.info(`🩺 Health check accessible at http://localhost:${env.PORT}/health`);
    });

    // Handle unexpected runtime rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error({
        msg: 'Unhandled Promise Rejection detected',
        reason: reason instanceof Error ? reason.message : reason,
        stack: reason instanceof Error ? reason.stack : undefined,
      });
      gracefulShutdown('UNHANDLED_REJECTION');
    });

    process.on('uncaughtException', (err) => {
      logger.error({
        msg: 'Uncaught Exception detected',
        err: err.message,
        stack: err.stack,
      });
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (err) {
    logger.error(`Fatal application startup error: ${err.message}`);
    process.exit(1);
  }
}

async function gracefulShutdown(signal) {
  logger.info(`Received ${signal}. Initiating graceful server shutdown...`);

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed. Releasing active database connections...');
      await disconnectDatabase();
      logger.info('Graceful shutdown completed successfully. Exiting.');
      process.exit(0);
    });

    // Force exit if graceful shutdown takes longer than 10 seconds
    setTimeout(() => {
      logger.error('Graceful shutdown timed out after 10s. Forcing exit.');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
}

bootstrap();
