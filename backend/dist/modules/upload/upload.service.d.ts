export declare class UploadService {
    handleUpload(file: Express.Multer.File): Promise<{
        processingId: string;
        status: import(".prisma/client").$Enums.ProcessingStatus;
    }>;
}
