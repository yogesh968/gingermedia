import { Queue } from 'bullmq';
export declare const IMAGE_PROCESSING_QUEUE = "image-processing";
export declare const processingQueue: Queue<any, any, string, any, any, string>;
