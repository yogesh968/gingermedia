"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
const logger_1 = require("./config/logger");
const client_1 = require("./prisma/client");
const start = async () => {
    try {
        // Check DB connection
        await client_1.prisma.$connect();
        logger_1.logger.info('Connected to database');
        app_1.default.listen(config_1.config.PORT, () => {
            logger_1.logger.info(`Server is running on port ${config_1.config.PORT}`);
            logger_1.logger.info(`Swagger docs available at http://localhost:${config_1.config.PORT}/docs`);
        });
    }
    catch (error) {
        logger_1.logger.error(error, 'Failed to start server');
        process.exit(1);
    }
};
// Graceful shutdown
const shutdown = async () => {
    logger_1.logger.info('Shutting down gracefully...');
    await client_1.prisma.$disconnect();
    process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
start();
//# sourceMappingURL=index.js.map