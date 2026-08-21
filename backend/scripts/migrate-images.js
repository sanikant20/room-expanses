/**
 * Migration: Upload existing base64 partner/user images to Cloudinary.
 *
 * Run once:  node scripts/migrate-images.js
 *
 * Finds all Partner and User documents whose `image` field looks like a
 * base64 string (starts with /9j/, iVBOR, or data:image), uploads each to
 * Cloudinary under the we-roomies folder, and replaces the stored value
 * with the returned secure URL.
 *
 * Safe to re-run — only touches documents whose image doesn't start with "http".
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

dotenv.config({ path: new URL("../.env", import.meta.url) });

const FOLDER = "we-roomies";

const configure = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.error("Missing CLOUDINARY_* env vars in .env");
    process.exit(1);
  }
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
};

const isBase64 = (val) => {
  if (!val || typeof val !== "string") return false;
  if (val.startsWith("http")) return false;
  return true;
};

const uploadBase64 = async (base64String, publicId) => {
  const dataUrl = base64String.startsWith("data:")
    ? base64String
    : `data:image/jpeg;base64,${base64String}`;

  const result = await cloudinary.uploader.upload(dataUrl, {
    folder: FOLDER,
    public_id: publicId,
    resource_type: "image",
    transformation: [
      { width: 400, height: 400, crop: "limit" },
      { quality: "auto", fetch_format: "auto" },
    ],
  });

  return result.secure_url;
};

const migrateCollection = async (Model, name) => {
  const docs = await Model.find({ image: { $exists: true, $ne: null } });
  const base64Docs = docs.filter((d) => isBase64(d.image));

  console.log(`${name}: ${docs.length} total with image, ${base64Docs.length} base64 to migrate`);

  for (const doc of base64Docs) {
    try {
      const publicId = `${name.toLowerCase()}-${doc._id}`;
      const url = await uploadBase64(doc.image, publicId);
      await Model.updateOne({ _id: doc._id }, { $set: { image: url } });
      console.log(`  ✓ ${doc.name || doc._id} → ${url}`);
    } catch (err) {
      console.error(`  ✗ ${doc.name || doc._id}: ${err.message}`);
    }
  }
};

const main = async () => {
  configure();

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI in .env");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB\n");

  const partnerSchema = new mongoose.Schema({ image: String }, { strict: false });
  const userSchema = new mongoose.Schema({ image: String }, { strict: false });

  const Partner = mongoose.model("Partner", partnerSchema, "partners");
  const User = mongoose.model("User", userSchema, "users");

  await migrateCollection(Partner, "Partner");
  await migrateCollection(User, "User");

  await mongoose.disconnect();
  console.log("\nDone.");
};

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
