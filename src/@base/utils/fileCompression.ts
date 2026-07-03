interface CompressionOptions {
  maxSizeKB?: number;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Compress image to WebP format with size constraint
 * For high-resolution images (e.g. newspaper pages), set maxSizeKB higher
 * and maxWidth/maxHeight larger to preserve quality.
 */
export const compressImage = (
  file: File,
  options: CompressionOptions = {}
): Promise<File> => {
  const {
    maxSizeKB = 5120,
    quality = 0.92,
    maxWidth = 4096,
    maxHeight = 4096
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;
        if (width > height) {
          width = Math.min(width, maxWidth);
          height = width / aspectRatio;
        } else {
          height = Math.min(height, maxHeight);
          width = height * aspectRatio;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      const compressWithQuality = (currentQuality: number): void => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            const sizeInKB = blob.size / 1024;
            
            if (sizeInKB <= maxSizeKB || currentQuality <= 0.1) {
              // Create new File with compressed blob
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
                type: 'image/webp',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              // Reduce quality and try again
              const newQuality = Math.max(0.1, currentQuality - 0.1);
              compressWithQuality(newQuality);
            }
          },
          'image/webp',
          currentQuality
        );
      };

      compressWithQuality(quality);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Determine file type and compress accordingly
 * Note: Video compression is skipped as browser-based re-encoding via
 * MediaRecorder produces poor quality and unreliable playback.
 * Source videos are already efficiently compressed.
 */
export const compressFile = (
  file: File,
  imageOptions?: CompressionOptions
): Promise<File> => {
  const fileType = file.type.toLowerCase();
  
  if (fileType.startsWith('image/')) {
    return compressImage(file, imageOptions);
  }
  // Videos and other files pass through uncompressed
  return Promise.resolve(file);
};

/**
 * Check if file is an image
 */
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

/**
 * Check if file is a video
 */
export const isVideoFile = (file: File): boolean => {
  return file.type.startsWith('video/');
};
