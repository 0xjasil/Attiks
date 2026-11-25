/**
 * Client-side image compressor utility
 * Automatically downscales and compresses images in the browser before upload.
 * Reduces 5MB-25MB photos down to ~200KB-500KB WebP files.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/webp' | 'image/jpeg';
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.82,
    format = 'image/webp',
  } = options;

  // Do not compress SVGs or non-image types
  if (file.type === 'image/svg+xml' || !file.type.startsWith('image/')) {
    return file;
  }

  // If running in an environment without DOM/Canvas support (SSR), return original
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Calculate constrained dimensions preserving aspect ratio
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      // Draw image on canvas
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Determine target mime type
      const targetMime = format;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }

          // If compression resulted in a larger file (rare, e.g. for already-compressed tiny images), keep original
          if (blob.size >= file.size && file.type === targetMime) {
            resolve(file);
            return;
          }

          // Generate new filename with appropriate extension
          const originalBaseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
          const ext = targetMime === 'image/webp' ? '.webp' : '.jpg';
          const newFileName = `${originalBaseName}${ext}`;

          const compressedFile = new File([blob], newFileName, {
            type: targetMime,
            lastModified: Date.now(),
          });

          resolve(compressedFile);
        },
        targetMime,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // Fallback to original file on error
    };

    img.src = objectUrl;
  });
}
