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

/**
 * Downscale and optimize an image data URL for AI processing payloads.
 */
export const downscaleImage = (dataUrl: string, maxSide = 1536, quality = 0.88): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const scale = Math.min(1, maxSide / Math.max(w, h));
      if (scale === 1) return resolve(dataUrl);

      const canvas = document.createElement('canvas');
      canvas.width = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
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
