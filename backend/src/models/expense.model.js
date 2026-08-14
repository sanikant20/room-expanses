import mongoose, { Schema } from "mongoose";

const expenseSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    category: {
      type: String,
      enum: ["primary", "secondary"],
      required: true,
      default: "primary",
    },
    group: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },
    paidBy: {
      type: Schema.Types.ObjectId,
      ref: "Partner",
      required: true,
    },
    applicablePartners: [
      {
        type: Schema.Types.ObjectId,
        ref: "Partner",
      },
    ],
    excludedPartners: [
      {
        type: Schema.Types.ObjectId,
        ref: "Partner",
      },
    ],
    bsDate: {
      type: String,
      required: [true, "BS date is required"],
    },
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
    description: { type: String },
    notes: { type: String },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

expenseSchema.index({ bsYear: 1, bsMonth: 1 });
expenseSchema.index({ paidBy: 1 });

export const Expense = mongoose.model("Expense", expenseSchema);
