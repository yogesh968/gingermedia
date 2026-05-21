export declare class AnalysisService {
    private blurService;
    private brightnessService;
    private ocrService;
    private duplicateService;
    private heuristicsService;
    runAllChecks(mediaId: string, imagePath: string): Promise<{
        blurScore: number;
        blurConfidence: number;
        brightnessScore: number;
        isDuplicate: boolean;
        perceptualHash: string;
        ocrResult: string;
        plateNumber: string | null;
        isPlateValid: boolean;
        isScreenshot: boolean;
        isTampered: boolean;
        dimensions: {
            width: number;
            height: number;
        };
        rawResult: {
            heuristics: {
                dimensions: {
                    width: number;
                    height: number;
                };
                isScreenshot: boolean;
                isTampered: boolean;
                format: any;
                aspectRatio: number;
                qualityThresholdMet: boolean;
            };
            brightness: {
                score: number;
                isLowLight: boolean;
                isOverexposed: boolean;
            };
            blur: {
                score: number;
                confidence: number;
                isBlurry: boolean;
            };
            plateValidation: {
                isValid: boolean;
                plates: [] | RegExpMatchArray;
            };
        };
    }>;
}
