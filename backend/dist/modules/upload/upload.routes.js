"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_controller_1 = require("./upload.controller");
const upload_middleware_1 = require("../../middleware/upload.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/v1/upload:
 *   post:
 *     summary: Upload a vehicle image for processing
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       202:
 *         description: Image accepted for processing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 processingId:
 *                   type: string
 *                 status:
 *                   type: string
 */
router.post('/', upload_middleware_1.upload.single('image'), upload_controller_1.uploadImage);
exports.default = router;
//# sourceMappingURL=upload.routes.js.map