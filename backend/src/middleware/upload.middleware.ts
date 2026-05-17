import multer from 'multer';
import path from 'path';
import { config } from '../config';

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: config.MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images are allowed (jpeg, jpg, png, webp)'));
  },
});
