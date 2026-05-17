import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './config';
import { logger } from './config/logger';
import { errorHandler } from './middleware/error.middleware';
import uploadRoutes from './modules/upload/upload.routes';
import vehicleRoutes from './modules/vehicle/vehicle.routes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());

import path from 'path';

// Request logging middleware
app.use((req, res, next) => {
  logger.info({ method: req.method, url: req.url }, 'Incoming request');
  next();
});

// Serve local uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Swagger Setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Intelligent Media Processing Pipeline API',
      version: '1.0.0',
      description: 'API for vehicle image processing and AI analysis',
    },
    servers: [{ url: `http://localhost:${config.PORT}` }],
  },
  apis: ['./src/modules/**/*.ts'],
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Routes
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1', vehicleRoutes);

// Error Handling
app.use(errorHandler);

export default app;
