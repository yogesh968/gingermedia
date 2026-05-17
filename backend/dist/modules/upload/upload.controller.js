"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const upload_service_1 = require("./upload.service");
const logger_1 = require("../../config/logger");
const uploadService = new upload_service_1.UploadService();
const uploadImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }
        const result = await uploadService.handleUpload(req.file);
        return res.status(202).json(result);
    }
    catch (error) {
        logger_1.logger.error(error, 'Error in uploadImage controller');
        next(error);
    }
};
exports.uploadImage = uploadImage;
//# sourceMappingURL=upload.controller.js.map