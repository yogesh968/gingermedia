import { Router } from 'express';
import { uploadImage } from './upload.controller';
import { upload } from '../../middleware/upload.middleware';

const router = Router();

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
router.post('/', upload.single('image'), uploadImage);

export default router;
