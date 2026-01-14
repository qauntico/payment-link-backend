import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUD_NAME'),
      api_key: this.configService.get<string>('API_KEY'),
      api_secret: this.configService.get<string>('API_SECRET'),
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'products', // Optional: organize images in a folder
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result && result.secure_url) {
            resolve(result.secure_url);
          } else {
            reject(new Error('Upload failed: No secure URL returned'));
          }
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async uploadImageFromUrl(imageUrl: string, publicId?: string): Promise<string> {
    try {
      const uploadResult = await cloudinary.uploader.upload(imageUrl, {
        public_id: publicId,
        folder: 'products',
      });
      return uploadResult.secure_url;
    } catch (error) {
      throw error;
    }
  }

  getOptimizedUrl(publicId: string, options?: {
    width?: number;
    height?: number;
    crop?: string;
    gravity?: string;
    quality?: string;
    fetch_format?: string;
  }): string {
    return cloudinary.url(publicId, {
      fetch_format: options?.fetch_format || 'auto',
      quality: options?.quality || 'auto',
      crop: options?.crop || 'auto',
      gravity: options?.gravity || 'auto',
      width: options?.width,
      height: options?.height,
    });
  }

  async uploadPdf(buffer: Buffer, fileName?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'receipts',
          public_id: fileName,
          format: 'pdf',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result && result.secure_url) {
            resolve(result.secure_url);
          } else {
            reject(new Error('PDF upload failed: No secure URL returned'));
          }
        },
      );

      uploadStream.end(buffer);
    });
  }
}
