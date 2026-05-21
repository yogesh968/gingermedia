"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisConnection = void 0;
const index_1 = require("./index");
exports.redisConnection = {
    host: index_1.config.REDIS_HOST,
    port: index_1.config.REDIS_PORT,
    password: index_1.config.REDIS_PASSWORD,
    tls: index_1.config.REDIS_HOST?.includes('upstash.io') ? {} : undefined,
    maxRetriesPerRequest: null,
};
//# sourceMappingURL=redis.js.map