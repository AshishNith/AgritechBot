import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';
import { logger } from '../utils/logger';

// Configure Cloudinary
if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  logger.info('Cloudinary configured successfully');
} else {
  logger.warn('Cloudinary credentials missing; image upload will be disabled');
}

export interface CloudinaryUploadResponse {
  url: string;
  publicId: string;
}

export const cloudinaryService = {
  /**
   * Uploads a base64 image to Cloudinary
   * @param base64Data Raw base64 string or data URL
   * @param folder Destination folder in Cloudinary
   */
  uploadImage: async (base64Data: string, folder: string = 'anaaj-ai/scans'): Promise<CloudinaryUploadResponse | null> => {
    try {
      if (!env.CLOUDINARY_CLOUD_NAME) {
        logger.warn('Attempted to upload to Cloudinary but credentials are not configured');
        return null;
      }

      // Ensure data URL prefix is present if missing, or handle raw base64
      const uploadStr = base64Data.startsWith('data:') ? base64Data : `data:image/jpeg;base64,${base64Data}`;

      const result = await cloudinary.uploader.upload(uploadStr, {
        folder: folder,
        resource_type: 'image',
        // Optional: you can add auto-tagging or transformations here
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      logger.error({ err: error }, 'Cloudinary upload failed');
      return null;
    }
  }
};
