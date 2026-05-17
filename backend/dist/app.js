"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const config_1 = require("./config");
const logger_1 = require("./config/logger");
const error_middleware_1 = require("./middleware/error.middleware");
const upload_routes_1 = __importDefault(require("./modules/upload/upload.routes"));
const vehicle_routes_1 = __importDefault(require("./modules/vehicle/vehicle.routes"));
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: config_1.config.FRONTEND_URL,
    credentials: true,
}));
app.use(express_1.default.json());
// Request logging middleware
app.use((req, res, next) => {
    logger_1.logger.info({ method: req.method, url: req.url }, 'Incoming request');
    next();
});
// Swagger Setup
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Intelligent Media Processing Pipeline API',
            version: '1.0.0',
            description: 'API for vehicle image processing and AI analysis',
        },
        servers: [{ url: `http://localhost:${config_1.config.PORT}` }],
    },
    apis: ['./src/modules/**/*.ts'],
};
const swaggerDocs = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocs));
// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));
// Routes
app.use('/api/v1/upload', upload_routes_1.default);
app.use('/api/v1', vehicle_routes_1.default);
// Error Handling
app.use(error_middleware_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map