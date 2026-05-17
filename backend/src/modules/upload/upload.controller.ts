import { Request, Response, NextFunction } from 'express';
import { UploadService } from './upload.service';
import { logger } from '../../config/logger';

const uploadService = new UploadService();

export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const result = await uploadService.handleUpload(req.file);
    
    return res.status(202).json(result);
  } catch (error) {
    logger.error(error, 'Error in uploadImage controller');
    next(error);
  }
};
