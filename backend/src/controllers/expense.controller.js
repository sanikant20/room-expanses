import { Expense } from "../models/expense.model.js";
import { Partner } from "../models/partner.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// bsDate is expected in "YYYY/MM/DD" (Bikram Sambat). Returns { bsYear, bsMonth } or null.
export const parseBsDate = (bsDate) => {
  if (!bsDate) return null;
  const match = String(bsDate).match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (!match) return null;
  const bsYear = Number(match[1]);
  const bsMonth = Number(match[2]);
  if (bsYear < 2000 || bsYear > 2090 || bsMonth < 1 || bsMonth > 12) return null;
  return { bsYear, bsMonth };
};

const normalizeExpensePayload = (body) => {
  const { title, amount, category, paidBy, applicablePartners = [], excludedPartners = [], bsDate, description, notes } = body;

  if (!title) throw new ApiError(400, "Expense title is required");
  if (amount === undefined || Number(amount) <= 0) {
    throw new ApiError(400, "Amount must be greater than zero");
  }
  if (!paidBy) throw new ApiError(400, "Paid by partner is required");
  if (!bsDate) throw new ApiError(400, "BS date is required");

  const parsed = parseBsDate(bsDate);
  if (!parsed) throw new ApiError(400, "Invalid BS date. Expected format YYYY/MM/DD");

  return {
    title,
    amount: Number(amount),
    category: category || "primary",
    paidBy,
    applicablePartners,
    excludedPartners,
    bsDate: String(bsDate).replace(/-/g, "/"),
    bsYear: parsed.bsYear,
    bsMonth: parsed.bsMonth,
    description,
    notes,
  };
};

const populateOptions = () => [
  { path: "paidBy", select: "name image" },
  { path: "applicablePartners", select: "name image" },
  { path: "excludedPartners", select: "name image" },
];

const withPopulates = (query) => query.populate(populateOptions());

export const createExpense = asyncHandler(async (req, res) => {
  const payload = normalizeExpensePayload(req.body);

  if (payload.applicablePartners.length === 0) {
    throw new ApiError(400, "At least one applicable partner is required");
  }

  const validPartners = await Partner.countDocuments({ _id: { $in: payload.applicablePartners } });
  if (validPartners !== payload.applicablePartners.length) {
    throw new ApiError(400, "One or more applicable partners are invalid");
  }

  const expense = await Expense.create({ ...payload, createdBy: req.user._id });

  const populated = await withPopulates(Expense.findById(expense._id));

  return res.status(201).json({
    success: true,
    message: "Expense created successfully",
    expense: populated,
  });
});

export const getExpenses = asyncHandler(async (req, res) => {
  const { bsYear, bsMonth, category, paidBy, search } = req.query;

  const filter = {};
  if (bsYear) filter.bsYear = Number(bsYear);
  if (bsMonth) filter.bsMonth = Number(bsMonth);
  if (category) filter.category = category;
  if (paidBy) filter.paidBy = paidBy;
  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }

  const expenses = await withPopulates(Expense.find(filter))
    .sort({ bsYear: -1, bsMonth: -1, createdAt: -1 });

  return res.status(200).json({
    success: true,
    message: "Expenses fetched successfully",
    expenses,
  });
});

export const getExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) throw new ApiError(400, "Invalid expense id");

  const expense = await withPopulates(Expense.findById(id));
  if (!expense) throw new ApiError(404, "Expense not found");

  return res.status(200).json({
    success: true,
    message: "Expense fetched successfully",
    expense,
  });
});

export const updateExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) throw new ApiError(400, "Invalid expense id");

  const existing = await Expense.findById(id);
  if (!existing) throw new ApiError(404, "Expense not found");

  const payload = normalizeExpensePayload(req.body);

  if (payload.applicablePartners.length === 0) {
    throw new ApiError(400, "At least one applicable partner is required");
  }

  const updated = await Expense.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  const populated = await withPopulates(Expense.findById(updated._id));

  return res.status(200).json({
    success: true,
    message: "Expense updated successfully",
    expense: populated,
  });
});

export const deleteExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) throw new ApiError(400, "Invalid expense id");

  const expense = await Expense.findByIdAndDelete(id);
  if (!expense) throw new ApiError(404, "Expense not found");

  return res.status(200).json({
    success: true,
    message: "Expense deleted successfully",
  });
});
