import mongoose, { Schema } from "mongoose";

const transactionSchema = new Schema(
  {
    from: {
      type: Schema.Types.ObjectId,
      ref: "Partner",
      required: true,
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: "Partner",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount cannot be negative"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "confirmed"],
      default: "pending",
    },
    paidAt: {
      type: Date,
      default: null,
    },
    confirmedAt: {
      type: Date,
      default: null,
    },
    confirmedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    confirmedByType: {
      type: String,
      enum: ["admin", "partner", null],
      default: null,
    },
  },
  { _id: false }
);

const settleActionSchema = new Schema(
  {
    source: {
      type: String,
      enum: ["manual", "auto"],
      required: true,
    },
    settledBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    settledAt: {
      type: Date,
    },
    fromDate: {
      type: String,
      default: null,
    },
    toDate: {
      type: String,
      default: null,
    },
    expenseCount: {
      type: Number,
      default: 0,
    },
    transactions: {
      type: [transactionSchema],
      default: [],
    },
  },
  { _id: false }
);

const settlementSchema = new Schema(
  {
    bsYear: {
      type: Number,
      required: true,
    },
    bsMonth: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    category: {
      type: String,
      enum: ["primary", "secondary", null],
      default: null,
    },
    group: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },
    fromDate: {
      type: String,
      default: null,
    },
    toDate: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "settled"],
      default: "pending",
    },
    settledBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    settledAt: {
      type: Date,
    },
    transactions: {
      type: [transactionSchema],
      default: [],
    },
    settleActions: {
      type: [settleActionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

settlementSchema.index({ bsYear: 1, bsMonth: 1, category: 1, group: 1 }, { unique: true });

export const Settlement = mongoose.model("Settlement", settlementSchema);
