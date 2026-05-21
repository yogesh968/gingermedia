export declare class UploadService {
    handleUpload(file: Express.Multer.File): Promise<{
        processingId: string;
        status: string;
        error?: undefined;
    } | {
        processingId: string;
        status: string;
        error: string;
    }>;
}
