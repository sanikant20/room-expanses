import { cloudinary, isConfigured } from "../config/cloudinary.js";

const FOLDER = process.env.NODE_ENV === "production" ? "we-roomies" : "we-roomies-test";

/**
 * Upload a buffer to Cloudinary.
 * Returns the secure URL on success, or null on failure.
 * Never throws — callers should treat null as "upload skipped".
 */
export const uploadBuffer = async (buffer, filename = "avatar") => {
  if (!isConfigured || !buffer) return null;

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: FOLDER,
          public_id: `${filename}-${Date.now()}`,
          resource_type: "image",
          transformation: [
            { width: 400, height: 400, crop: "limit" },
            { quality: "auto", fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(buffer);
    });

    return result.secure_url;
  } catch (error) {
    console.error("[upload] Cloudinary upload failed:", error.message);
    return null;
  }
};

/**
 * Delete an image from Cloudinary by URL.
 * Best-effort — never throws.
 */
export const deleteImage = async (url) => {
  if (!isConfigured || !url || !url.includes("cloudinary.com")) return;

  try {
    const parts = url.split("/");
    const filename = parts.at(-1)?.split(".")?.[0];
    const folder = parts.at(-2);
    if (filename && folder) {
      await cloudinary.uploader.destroy(`${folder}/${filename}`);
    }
  } catch (error) {
    console.error("[upload] Cloudinary delete failed:", error.message);
  }
};
