import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 500 * 1024; // 500 KB

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only JPG, PNG, or WebP images are allowed"));
  }
};

const multerUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single("image");

/**
 * Wraps multer so upload errors become clean JSON ApiErrors
 * instead of unhandled HTML 500 responses.
 */
export const uploadAvatar = (req, res, next) => {
  multerUpload(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return next(new ApiError(400, "Image must be smaller than 500 KB"));
    }
    next(err instanceof ApiError ? err : new ApiError(400, err.message || "Invalid image upload"));
  });
};
