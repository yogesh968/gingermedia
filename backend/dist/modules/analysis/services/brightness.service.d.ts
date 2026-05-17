export declare class BrightnessService {
    /**
     * Analyzes image brightness.
     * Return score (0-255).
     */
    analyzeBrightness(imagePath: string): Promise<{
        score: number;
        isLowLight: boolean;
        isOverexposed: boolean;
    }>;
}
