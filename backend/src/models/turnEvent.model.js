import mongoose, { Schema } from "mongoose";

const turnEventSchema = new Schema(
  {
    rotation: {
      type: Schema.Types.ObjectId,
      ref: "TurnRotation",
      required: true,
    },
    cycle: {
      type: Number,
      required: true,
    },
    assignedPartner: {
      type: Schema.Types.ObjectId,
      ref: "Partner",
      required: true,
    },
    broughtByPartner: {
      type: Schema.Types.ObjectId,
      ref: "Partner",
      required: true,
    },
    completedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

turnEventSchema.index(
  { rotation: 1, cycle: 1, broughtByPartner: 1 },
  { unique: true }
);

export const TurnEvent = mongoose.model("TurnEvent", turnEventSchema);