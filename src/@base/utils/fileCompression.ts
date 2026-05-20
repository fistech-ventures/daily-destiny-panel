interface CompressionOptions {
  maxSizeKB?: number;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

interface VideoCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  bitrate?: number;
  frameRate?: number;
}

/**
 * Compress image to WebP format with size constraint
 */
export const compressImage = (
  file: File,
  options: CompressionOptions = {}
): Promise<File> => {
  const {
    maxSizeKB = 132,
    quality = 0.9,
    maxWidth = 1920,
    maxHeight = 1080
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
 * Compress video to WebM format
 */
export const compressVideo = (
  file: File,
  options: VideoCompressionOptions = {}
): Promise<File> => {
  const {
    maxWidth = 1280,
    maxHeight = 720
  } = options;

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      video.currentTime = 0.1; // Seek to get first frame
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate new dimensions
      let { videoWidth, videoHeight } = video;
      
      if (videoWidth > maxWidth || videoHeight > maxHeight) {
        const aspectRatio = videoWidth / videoHeight;
        if (videoWidth > videoHeight) {
          videoWidth = Math.min(videoWidth, maxWidth);
          videoHeight = videoWidth / aspectRatio;
        } else {
          videoHeight = Math.min(videoHeight, maxHeight);
          videoWidth = videoHeight * aspectRatio;
        }
      }

      canvas.width = videoWidth;
      canvas.height = videoHeight;
      ctx?.drawImage(video, 0, 0, videoWidth, videoHeight);

      // For WebM compression, we'll use a simpler approach first
      // In a real implementation, you might want to use WebCodecs API or FFmpeg.wasm
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to process video'));
            return;
          }

          // For now, we'll create a WebM blob from the first frame
          // This is a simplified version - full video compression requires more complex handling
          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webm'), {
            type: 'video/webm',
            lastModified: Date.now()
          });
          
          resolve(compressedFile);
        },
        'video/webm',
        0.8
      );
    };

    video.onerror = () => reject(new Error('Failed to load video'));
    video.src = URL.createObjectURL(file);
  });
};

/**
 * Advanced video compression using MediaRecorder API
 */
export const compressVideoAdvanced = (
  file: File,
  options: VideoCompressionOptions = {},
  onProgress?: (progress: number) => void
): Promise<File> => {
  const {
    maxWidth = 1280,
    maxHeight = 720,
    bitrate = 1000000,
    frameRate = 30
  } = options;

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate new dimensions
      let { videoWidth, videoHeight } = video;
      
      if (videoWidth > maxWidth || videoHeight > maxHeight) {
        const aspectRatio = videoWidth / videoHeight;
        if (videoWidth > videoHeight) {
          videoWidth = Math.min(videoWidth, maxWidth);
          videoHeight = videoWidth / aspectRatio;
        } else {
          videoHeight = Math.min(videoHeight, maxHeight);
          videoWidth = videoHeight * aspectRatio;
        }
      }

      canvas.width = videoWidth;
      canvas.height = videoHeight;

      const stream = canvas.captureStream(frameRate);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm',
        videoBitsPerSecond: bitrate
      });

      const chunks: Blob[] = [];
      const duration = video.duration;
      let currentTime = 0;
      const frameInterval = 1000 / frameRate;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webm'), {
          type: 'video/webm',
          lastModified: Date.now()
        });
        resolve(compressedFile);
      };

      mediaRecorder.start();
      video.play();

      const captureFrame = () => {
        if (currentTime >= duration) {
          mediaRecorder.stop();
          return;
        }

        video.currentTime = currentTime;
        ctx?.drawImage(video, 0, 0, videoWidth, videoHeight);
        
        currentTime += frameInterval / 1000;
        const progress = (currentTime / duration) * 100;
        onProgress?.(Math.min(progress, 100));

        setTimeout(captureFrame, frameInterval);
      };

      captureFrame();
    };

    video.onerror = () => reject(new Error('Failed to load video'));
    video.src = URL.createObjectURL(file);
  });
};

/**
 * Determine file type and compress accordingly
 */
export const compressFile = (
  file: File,
  imageOptions?: CompressionOptions,
  videoOptions?: VideoCompressionOptions,
  onProgress?: (progress: number) => void
): Promise<File> => {
  const fileType = file.type.toLowerCase();
  
  if (fileType.startsWith('image/')) {
    return compressImage(file, imageOptions);
  } else if (fileType.startsWith('video/')) {
    return compressVideoAdvanced(file, videoOptions, onProgress);
  } else {
    return Promise.resolve(file); // Return original file for non-media files
  }
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
