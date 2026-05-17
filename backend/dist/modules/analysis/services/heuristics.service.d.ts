import sharp from 'sharp';
export declare class HeuristicsService {
    analyze(imagePath: string): Promise<{
        dimensions: {
            width: number;
            height: number;
        };
        isScreenshot: boolean;
        isTampered: boolean;
        format: keyof sharp.FormatEnum | undefined;
        aspectRatio: number;
        qualityThresholdMet: boolean;
    }>;
}
