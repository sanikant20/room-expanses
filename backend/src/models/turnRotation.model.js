import mongoose, { Schema } from "mongoose";

const turnRotationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["water"],
      required: true,
      default: "water",
    },
    partners: [
      {
        type: Schema.Types.ObjectId,
        ref: "Partner",
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

turnRotationSchema.index({ type: 1, status: 1 });

export const TurnRotation = mongoose.model("TurnRotation", turnRotationSchema);