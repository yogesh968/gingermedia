import app from './app';
import { config } from './config';
import { logger } from './config/logger';
import { prisma } from './prisma/client';
const start = async () => {
  try {
    // Check DB connection
    await prisma.$connect();
    logger.info('Connected to database');

    app.listen(config.PORT, () => {
      logger.info(`Server is running on port ${config.PORT}`);
      logger.info(`Swagger docs available at http://localhost:${config.PORT}/docs`);
    });
  } catch (error) {
    logger.error(error, 'Failed to start server');
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

start();
