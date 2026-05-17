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
}

export interface ProcessingResponse {
  id: string;
  status: ProcessingStatus;
  analysis?: AnalysisResults;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadResponse {
  processingId: string;
  message: string;
}
