/**
 * Client-Side Image Upload & Processing Utility
 * Converts user-selected image files from computer/mobile into optimized Base64 Data URLs
 * that work seamlessly on any static or cloud web hosting without external storage buckets.
 */

export async function processImageFile(file: File, maxDimension = 1200, quality = 0.85): Promise<{ dataUrl: string; name: string }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please select an image file (PNG, JPG, WEBP, etc.)'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const rawUrl = e.target?.result as string;
      if (!rawUrl) {
        reject(new Error('Empty image file'));
        return;
      }

      // Try optimizing via canvas
      const img = new Image();
      img.onerror = () => {
        // Fallback to raw data url if image decode fails
        resolve({ dataUrl: rawUrl, name: file.name });
      };
      img.onload = () => {
        try {
          const width = img.naturalWidth || img.width;
          const height = img.naturalHeight || img.height;

          // If within bounds, we can return or scale down
          let newWidth = width;
          let newHeight = height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              newWidth = maxDimension;
              newHeight = Math.round((height * maxDimension) / width);
            } else {
              newHeight = maxDimension;
              newWidth = Math.round((width * maxDimension) / height);
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = newWidth;
          canvas.height = newHeight;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve({ dataUrl: rawUrl, name: file.name });
            return;
          }

          // High quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, newWidth, newHeight);

          // Output as JPEG for high compression with clean quality
          const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          const optimizedDataUrl = canvas.toDataURL(outputType, quality);
          resolve({ dataUrl: optimizedDataUrl, name: file.name });
        } catch {
          // If canvas tainted or error, fallback to raw
          resolve({ dataUrl: rawUrl, name: file.name });
        }
      };
      img.src = rawUrl;
    };
    reader.readAsDataURL(file);
  });
}
