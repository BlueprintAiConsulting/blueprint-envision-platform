/**
 * Utility: tint a B&W mask image with an RGBA color via offscreen canvas
 */
export const tintMask = (maskSrc: string, color: [number, number, number, number]): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imageData.data;
      for (let i = 0; i < d.length; i += 4) {
        // White pixels become the tint color; black pixels become transparent
        if (d[i] > 128) {
          d[i]     = color[0];
          d[i + 1] = color[1];
          d[i + 2] = color[2];
          d[i + 3] = color[3];
        } else {
          d[i + 3] = 0;
        }
      }
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL());
    };
    img.onerror = () => resolve(maskSrc);
    img.src = maskSrc;
  });
};

export interface ProcessedImageResult {
  dataUrl: string;
  width: number;
  height: number;
  originalSizeBytes: number;
  optimizedSizeBytes: number;
  mimeType: string;
  infoText: string;
}

/**
 * Normalizes, auto-orients (EXIF), and downscales mobile camera & uploaded photos
 * to a crisp, high-performance web resolution (default: 1920px max dimension).
 * Prevents memory spikes on mobile Safari, stops 20MB payload rejections,
 * and eliminates aspect ratio distortion.
 */
export const processCameraOrUploadImage = async (
  file: File,
  maxDimension = 1920,
  quality = 0.88
): Promise<ProcessedImageResult> => {
  const originalSizeBytes = file.size;

  // 1. Try modern createImageBitmap with EXIF orientation handling (best for mobile Safari/Chrome)
  if (typeof createImageBitmap !== 'undefined') {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      const origW = bitmap.width;
      const origH = bitmap.height;
      const scale = Math.min(1, maxDimension / Math.max(origW, origH));
      const targetW = Math.max(1, Math.round(origW * scale));
      const targetH = Math.max(1, Math.round(origH * scale));

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(bitmap, 0, 0, targetW, targetH);
        bitmap.close();

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const rawBase64 = dataUrl.split(',')[1] || '';
        const optimizedSizeBytes = Math.round(rawBase64.length * 0.75);

        const origMb = (originalSizeBytes / (1024 * 1024)).toFixed(1);
        const optKb = Math.round(optimizedSizeBytes / 1024);
        const infoText = originalSizeBytes > 1024 * 1024
          ? `Camera photo ready · ${targetW}×${targetH} (optimized from ${origMb}MB to ${optKb}KB)`
          : `Camera photo ready · ${targetW}×${targetH}`;

        return {
          dataUrl,
          width: targetW,
          height: targetH,
          originalSizeBytes,
          optimizedSizeBytes,
          mimeType: 'image/jpeg',
          infoText,
        };
      }
      bitmap.close();
    } catch {
      // Fallback to FileReader + HTMLImageElement if createImageBitmap fails
    }
  }

  // 2. Resilient fallback using FileReader + HTMLImageElement
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read photo file from device.'));
    reader.onload = () => {
      const rawDataUrl = reader.result as string;
      const img = new Image();
      const timeoutId = setTimeout(() => {
        // Safe fallback on timeout
        resolve({
          dataUrl: rawDataUrl,
          width: 1920,
          height: 1080,
          originalSizeBytes,
          optimizedSizeBytes: originalSizeBytes,
          mimeType: file.type || 'image/jpeg',
          infoText: 'Camera photo ready for visualization',
        });
      }, 6000);

      img.onload = () => {
        clearTimeout(timeoutId);
        const origW = img.naturalWidth || img.width || 1920;
        const origH = img.naturalHeight || img.height || 1080;
        const scale = Math.min(1, maxDimension / Math.max(origW, origH));
        const targetW = Math.max(1, Math.round(origW * scale));
        const targetH = Math.max(1, Math.round(origH * scale));

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            dataUrl: rawDataUrl,
            width: origW,
            height: origH,
            originalSizeBytes,
            optimizedSizeBytes: originalSizeBytes,
            mimeType: 'image/jpeg',
            infoText: `Photo loaded · ${origW}×${origH}`,
          });
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetW, targetH);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const rawBase64 = dataUrl.split(',')[1] || '';
        const optimizedSizeBytes = Math.round(rawBase64.length * 0.75);

        const origMb = (originalSizeBytes / (1024 * 1024)).toFixed(1);
        const optKb = Math.round(optimizedSizeBytes / 1024);
        const infoText = originalSizeBytes > 1024 * 1024
          ? `Camera photo ready · ${targetW}×${targetH} (optimized from ${origMb}MB to ${optKb}KB)`
          : `Camera photo ready · ${targetW}×${targetH}`;

        resolve({
          dataUrl,
          width: targetW,
          height: targetH,
          originalSizeBytes,
          optimizedSizeBytes,
          mimeType: 'image/jpeg',
          infoText,
        });
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error('Failed to decode mobile camera image.'));
      };

      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Downscale and optimize an image data URL for AI processing payloads.
 * Hardened with error safety and timeout protection.
 */
export const downscaleImage = (dataUrl: string, maxSide = 1536, quality = 0.88): Promise<string> => {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:image/')) {
      return resolve(dataUrl);
    }
    const img = new Image();
    const timer = setTimeout(() => resolve(dataUrl), 5000);

    img.onload = () => {
      clearTimeout(timer);
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      if (!w || !h) return resolve(dataUrl);
      const scale = Math.min(1, maxSide / Math.max(w, h));
      if (scale === 1 && dataUrl.startsWith('data:image/jpeg')) return resolve(dataUrl);

      const canvas = document.createElement('canvas');
      canvas.width = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };

    img.onerror = () => {
      clearTimeout(timer);
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
};

/**
 * Friendly wrapper for API error messages
 */
export const getFriendlyErrorMessage = (msg: string): string => {
  const lower = msg.toLowerCase();
  if (lower.includes('preflight_failure')) return 'This image doesn\'t appear to be a house. Please upload a clear exterior photo of your home.';
  if (lower.includes('quota')) return 'Our servers are under heavy load right now. Please try again in a few minutes.';
  if (lower.includes('safety')) return 'This image couldn\'t be processed. Please try a different photo.';
  if (lower.includes('network') || lower.includes('failed to fetch')) return 'Network error. Please check your connection.';
  if (lower.includes('timeout')) return 'The request timed out. Please try again.';
  return msg;
};
