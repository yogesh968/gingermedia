export declare class OCRService {
    extractText(imagePath: string): Promise<string>;
    validateIndianPlate(text: string): {
        isValid: boolean;
        plates: [] | RegExpMatchArray;
    };
}
