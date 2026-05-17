import { Router } from 'express';
import { getStatus, getResults } from './vehicle.controller';

const router = Router();

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
router.get('/status/:id', getStatus);

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
router.get('/results/:id', getResults);

export default router;
