"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vehicle_controller_1 = require("./vehicle.controller");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/v1/status/{id}:
 *   get:
 *     summary: Get processing status of an image
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Current status
 */
router.get('/status/:id', vehicle_controller_1.getStatus);
/**
 * @swagger
 * /api/v1/results/{id}:
 *   get:
 *     summary: Get analysis results of an image
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Analysis details
 */
router.get('/results/:id', vehicle_controller_1.getResults);
exports.default = router;
//# sourceMappingURL=vehicle.routes.js.map