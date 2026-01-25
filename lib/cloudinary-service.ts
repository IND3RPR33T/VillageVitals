// Cloudinary service for image uploads
// Handles image uploads to Cloudinary for both web and mobile compatibility

export interface UploadOptions {
  folder?: string;
  transformation?: string;
  quality?: 'auto' | number;
  format?: 'auto' | 'jpg' | 'png' | 'webp';
}

export interface UploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
}

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

/**
 * Upload an image to Cloudinary
 * Works with both File objects (from file input) and data URLs (from mobile)
 */
export async function uploadImage(
  file: File | string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  try {
    const formData = new FormData();
    
    // Handle different input types
    if (typeof file === 'string') {
      // Data URL from mobile app
      formData.append('file', file);
    } else {
      // File object from web
      formData.append('file', file);
    }
    
    formData.append('upload_preset', UPLOAD_PRESET);
    
    // Add optional parameters
    if (options.folder) {
      formData.append('folder', options.folder);
    }
    
    if (options.quality) {
      formData.append('quality', options.quality.toString());
    }
    
    if (options.format) {
      formData.append('format', options.format);
    }
    
    // Add transformation for optimization
    if (options.transformation) {
      formData.append('transformation', options.transformation);
    } else {
      // Default optimization
      formData.append('transformation', 'q_auto,f_auto,c_limit,w_1000');
    }

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Cloudinary upload failed:', response.status, errorText);
      let errorMessage = 'Upload failed';
      try {
        const error = JSON.parse(errorText);
        errorMessage = error.error?.message || error.message || 'Unknown error';
      } catch {
        errorMessage = `HTTP ${response.status}: ${errorText}`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('✅ Image uploaded to Cloudinary:');
    console.log('   URL:', result.secure_url);
    console.log('   Size:', result.bytes, 'bytes');
    console.log('   Dimensions:', result.width + 'x' + result.height);
    
    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      url: result.url,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      created_at: result.created_at,
    };
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    throw error;
  }
}

/**
 * Upload multiple images
 */
export async function uploadMultipleImages(
  files: File[] | string[],
  options: UploadOptions = {}
): Promise<UploadResult[]> {
  try {
    const uploadPromises = files.map(file => uploadImage(file, options));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('❌ Multiple image upload error:', error);
    throw error;
  }
}

/**
 * Delete an image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    // Note: This requires server-side implementation for security
    // For now, we'll just log it - implement server endpoint if needed
    console.log('🗑️ Image deletion requested for:', publicId);
    return true;
  } catch (error) {
    console.error('❌ Image deletion error:', error);
    return false;
  }
}

/**
 * Generate a Cloudinary URL with transformations
 */
export function generateImageUrl(
  publicId: string,
  transformations: string = 'q_auto,f_auto'
): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformations}/${publicId}`;
}

/**
 * Generate a thumbnail URL
 */
export function generateThumbnailUrl(
  publicId: string,
  width: number = 200,
  height: number = 200
): string {
  return generateImageUrl(publicId, `c_fill,w_${width},h_${height},q_auto,f_auto`);
}

/**
 * Get optimized image URLs for different screen sizes
 */
export function getResponsiveImageUrls(publicId: string) {
  return {
    thumbnail: generateThumbnailUrl(publicId, 150, 150),
    small: generateImageUrl(publicId, 'w_400,q_auto,f_auto'),
    medium: generateImageUrl(publicId, 'w_800,q_auto,f_auto'),
    large: generateImageUrl(publicId, 'w_1200,q_auto,f_auto'),
    original: generateImageUrl(publicId, 'q_auto,f_auto'),
  };
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Please upload JPG, PNG, WebP, or GIF images.',
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File too large. Please upload images smaller than 10MB.',
    };
  }

  return { isValid: true };
}

/**
 * Compress image before upload (client-side)
 */
export function compressImage(file: File, quality: number = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions (max 1200px)
      const maxWidth = 1200;
      const maxHeight = 1200;
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        } else {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          const compressedFile = new File([blob!], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        file.type,
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
}