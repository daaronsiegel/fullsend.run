export class ImageProcessor {
    static MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    static TARGET_SIZE = 200; // 200x200px
    static JPEG_QUALITY = 0.8;
    static ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    /**
     * Validates an image file
     */
    static validateImageFile(file) {
        if (!this.ACCEPTED_TYPES.includes(file.type)) {
            return {
                valid: false,
                error: 'Please upload a JPG, PNG, or WEBP image.'
            };
        }
        if (file.size > this.MAX_FILE_SIZE) {
            return {
                valid: false,
                error: 'File size must be less than 5MB.'
            };
        }
        return { valid: true };
    }
    /**
     * Processes an image file: resizes to 200x200px, compresses to JPEG, returns Base64 data URL
     */
    static async processImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    try {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        if (!ctx) {
                            reject(new Error('Failed to get canvas context'));
                            return;
                        }
                        // Set canvas to target size
                        canvas.width = this.TARGET_SIZE;
                        canvas.height = this.TARGET_SIZE;
                        // Calculate cropping for center-crop to square
                        const sourceSize = Math.min(img.width, img.height);
                        const sourceX = (img.width - sourceSize) / 2;
                        const sourceY = (img.height - sourceSize) / 2;
                        // Draw image centered and cropped to square
                        ctx.drawImage(img, sourceX, sourceY, sourceSize, sourceSize, 0, 0, this.TARGET_SIZE, this.TARGET_SIZE);
                        // Convert to JPEG data URL
                        const dataUrl = canvas.toDataURL('image/jpeg', this.JPEG_QUALITY);
                        resolve(dataUrl);
                    }
                    catch (error) {
                        reject(error);
                    }
                };
                img.onerror = () => {
                    reject(new Error('Failed to load image'));
                };
                img.src = e.target?.result;
            };
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            reader.readAsDataURL(file);
        });
    }
    /**
     * Calculates the storage size of a Base64 data URL in bytes
     */
    static getDataUrlSize(dataUrl) {
        // Remove data URL prefix to get just the Base64 string
        const base64 = dataUrl.split(',')[1];
        if (!base64)
            return 0;
        // Base64 encoding increases size by ~33%, calculate actual size
        const padding = (base64.match(/=/g) || []).length;
        return (base64.length * 3) / 4 - padding;
    }
    /**
     * Formats bytes to human-readable string
     */
    static formatBytes(bytes) {
        if (bytes < 1024)
            return bytes + ' B';
        if (bytes < 1024 * 1024)
            return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
}
