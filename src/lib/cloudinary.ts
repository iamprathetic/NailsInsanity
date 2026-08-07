import { v2 as cloudinary } from "cloudinary";

// Configure from env. Supports either a single CLOUDINARY_URL, or the three
// separate CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET vars.
if (!process.env.CLOUDINARY_URL && process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export function isCloudinaryConfigured(): boolean {
  const c = cloudinary.config();
  return Boolean(c.cloud_name && c.api_key && c.api_secret);
}

// Upload an image buffer to Cloudinary and return its public HTTPS URL.
export function uploadToCloudinary(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder: "nailsinsanity", resource_type: "image" },
        (err, result) => {
          if (err || !result) {
            return reject(err || new Error("Cloudinary upload failed"));
          }
          resolve(result.secure_url);
        }
      )
      .end(buffer);
  });
}

export { cloudinary };
