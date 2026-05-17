export type ProcessingStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface AnalysisResults {
  blurScore: number;
  brightnessScore: number;
  isPlateValid: boolean;
  plateNumber: string | null;
  isScreenshot: boolean;
  isTampered: boolean;
  dimensions: {
    width: number;
    height: number;
  };
  rawResult?: any;
  ocrResult?: string;
  perceptualHash?: string;
}

export interface ProcessingResponse {
  id: string;
  status: ProcessingStatus;
  analysis?: AnalysisResults;
  imageUrl?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadResponse {
  processingId: string;
  message: string;
}
