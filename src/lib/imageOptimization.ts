/**
 * Client-side browser image conversion & compression to WebP.
 * Reduces storage footprint on Vercel Blob and speeds up mobile page load times.
 */

export interface WebPConversionResult {
  file: File;
  originalSize: number;
  webpSize: number;
  reductionPercentage: number;
  previewUrl: string;
}

/**
 * Converts an image file (PNG, JPG, HEIC, etc.) to compressed WebP format in the browser.
 * @param file The original image file from input/drop
 * @param options Configuration for quality and max dimension
 */
export async function convertImageToWebP(
  file: File,
  options: {
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
  } = {}
): Promise<WebPConversionResult> {
  const { quality = 0.82, maxWidth = 1920, maxHeight = 1080 } = options;

  return new Promise((resolve, reject) => {
    // If not an image, reject
    if (!file.type.startsWith("image/")) {
      reject(new Error("Selected file is not an image."));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio scale
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not initialize canvas context for WebP conversion."));
          return;
        }

        // Smooth image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("WebP blob conversion failed."));
              return;
            }

            const cleanBaseName = file.name
              .replace(/\.[^/.]+$/, "")
              .toLowerCase()
              .replace(/[^a-z0-9_-]/g, "-");

            const webpFileName = `${cleanBaseName}.webp`;
            const webpFile = new File([blob], webpFileName, {
              type: "image/webp",
              lastModified: Date.now(),
            });

            const reductionPercentage = Math.max(
              0,
              Math.round(((file.size - webpFile.size) / file.size) * 100)
            );

            const previewUrl = URL.createObjectURL(blob);

            resolve({
              file: webpFile,
              originalSize: file.size,
              webpSize: webpFile.size,
              reductionPercentage,
              previewUrl,
            });
          },
          "image/webp",
          quality
        );
      };

      img.onerror = () => {
        reject(new Error("Failed to load image for WebP compression."));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read image file."));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Format bytes into human readable string (e.g., 240 KB, 1.2 MB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
