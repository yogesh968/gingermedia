export declare class UploadService {
    handleUpload(file: Express.Multer.File): Promise<{
        processingId: string;
        status: string;
        error: string;
    } | {
        processingId: string;
        status: string;
        error?: undefined;
    }>;
}
