import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

let memServerInstance = null;

export async function connectDatabase() {
  const options = {
    serverSelectionTimeoutMS: 4000,
  };

  try {
    logger.info(`Connecting to MongoDB at: ${env.MONGODB_URI.replace(/\/\/.*@/, '//<credentials>@')}...`);
    await mongoose.connect(env.MONGODB_URI, options);
    logger.info('✅ Successfully connected to MongoDB database');
  } catch (err) {
    if (env.NODE_ENV !== 'production') {
      logger.warn(`Local MongoDB connection failed (${err.message}). Starting embedded in-memory database fallback...`);
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        memServerInstance = await MongoMemoryServer.create();
        const memUri = memServerInstance.getUri();
        await mongoose.connect(memUri);
        logger.info(`✅ Connected to embedded in-memory MongoDB at ${memUri}`);
        return;
      } catch (memErr) {
        logger.error(`Failed to start embedded in-memory database: ${memErr.message}`);
        throw memErr;
      }
    } else {
      logger.error(`❌ Critical database connection error in production: ${err.message}`);
      throw err;
    }
  }

  mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB connection error event: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB connection disconnected');
  });
}

export async function disconnectDatabase() {
  try {
    await mongoose.disconnect();
    if (memServerInstance) {
      await memServerInstance.stop();
    }
    logger.info('MongoDB disconnected cleanly');
  } catch (err) {
    logger.error(`Error during MongoDB disconnection: ${err.message}`);
  }
}
