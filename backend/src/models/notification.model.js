import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    partner: {
      type: Schema.Types.ObjectId,
      ref: "Partner",
      required: true,
    },
    type: {
      type: String,
      enum: ["water", "rice", "cleaning", "system"],
      default: "system",
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    refKey: { type: String },
  },
  { timestamps: true }
);

notificationSchema.index({ partner: 1, read: 1, createdAt: -1 });
notificationSchema.index({ refKey: 1 }, { unique: true, sparse: true });

export const Notification = mongoose.model("Notification", notificationSchema);