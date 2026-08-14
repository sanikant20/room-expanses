import mongoose, { Schema } from "mongoose";

const partnerSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    image: { type: String },
    bsJoiningDate: { type: String },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    notes: { type: String },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Partner = mongoose.model("Partner", partnerSchema);
