export declare class DuplicateService {
    /**
     * Generates a simple perceptual hash (Average Hash) for the image.
     */
    generateHash(imagePath: string): Promise<string>;
    findDuplicates(hash: string, currentMediaId: string): Promise<boolean>;
}
