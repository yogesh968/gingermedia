export declare class BlurService {
    /**
     * Detects blur using Laplacian variance heuristic.
     * Higher variance = sharper image.
     * Lower variance = blurrier image.
     */
    detectBlur(imagePath: string): Promise<{
        score: number;
        confidence: number;
        isBlurry: boolean;
    }>;
}
