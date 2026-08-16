import { Expense } from "../models/expense.model.js";
import { Partner } from "../models/partner.model.js";
import { Group } from "../models/group.model.js";
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
  const { title, amount, category, group, paidBy, applicablePartners = [], excludedPartners = [], bsDate, description, notes } = body;

  if (!title) throw new ApiError(400, "Item name is required");
  if (amount === undefined || Number(amount) <= 0) {
    throw new ApiError(400, "Amount must be greater than zero");
  }
  if (!paidBy) throw new ApiError(400, "Paid by partner is required");
  if (!bsDate) throw new ApiError(400, "BS date is required");

  const parsed = parseBsDate(bsDate);
  if (!parsed) throw new ApiError(400, "Invalid BS date. Expected format YYYY/MM/DD");

  const resolvedCategory = category === "secondary" ? "secondary" : "primary";
  const resolvedGroup = resolvedCategory === "secondary" && group ? group : null;

  return {
    title,
    amount: Number(amount),
    category: resolvedCategory,
    group: resolvedGroup,
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

const validateExpenseGrouping = async (payload) => {
  const { category, group, applicablePartners, paidBy } = payload;

  const validPartners = await Partner.countDocuments({ _id: { $in: applicablePartners } });
  if (validPartners !== applicablePartners.length) {
    throw new ApiError(400, "One or more applicable partners are invalid");
  }

  if (category === "secondary") {
    if (!group) {
      throw new ApiError(400, "Group is required for secondary expenses");
    }
    if (!mongoose.Types.ObjectId.isValid(group)) {
      throw new ApiError(400, "Invalid group id");
    }

    const groupDoc = await Group.findById(group);
    if (!groupDoc) throw new ApiError(400, "Group not found");
    if (groupDoc.status !== "active") {
      throw new ApiError(400, "Group is inactive. Activate it to add expenses.");
    }

    const memberIds = new Set((groupDoc.partners || []).map((id) => String(id)));
    const payerInGroup = memberIds.has(String(paidBy));
    if (!payerInGroup) {
      throw new ApiError(400, "Paid by partner must be a member of the selected group");
    }

    const outside = applicablePartners.filter((id) => !memberIds.has(String(id)));
    if (outside.length > 0) {
      throw new ApiError(400, "Applicable partners must belong to the selected group");
    }
  }

  return payload;
};

const enforcePartnerExpenseRules = async (payload, partnerId) => {
  const { category, group, applicablePartners, paidBy } = payload;

  if (String(paidBy) !== String(partnerId)) {
    throw new ApiError(403, "You can only add expenses where you are the payer");
  }

  if (category === "primary") {
    const activePartners = await Partner.find({ status: "active" }).select("_id");
    const activeIds = new Set(activePartners.map((p) => String(p._id)));
    const appliedIds = new Set(applicablePartners.map((id) => String(id)));
    const matchesActive = appliedIds.size === activeIds.size && [...activeIds].every((id) => appliedIds.has(id));
    if (!matchesActive) {
      throw new ApiError(403, "Primary expenses must apply to all active partners");
    }
  }

  if (category === "secondary") {
    if (!group) {
      throw new ApiError(400, "Group is required for secondary expenses");
    }
    if (!applicablePartners.some((id) => String(id) === String(partnerId))) {
      throw new ApiError(403, "Secondary expenses must apply to yourself as a group member");
    }
  }
};

const populateOptions = () => [
  { path: "paidBy", select: "name image" },
  { path: "applicablePartners", select: "name image" },
  { path: "excludedPartners", select: "name image" },
  { path: "group", select: "name" },
];

const withPopulates = (query) => query.populate(populateOptions());

export const createExpense = asyncHandler(async (req, res) => {
  const payload = normalizeExpensePayload(req.body);

  if (payload.applicablePartners.length === 0) {
    throw new ApiError(400, "At least one applicable partner is required");
  }

  await validateExpenseGrouping(payload);

  if (req.userType === "partner") {
    await enforcePartnerExpenseRules(payload, req.user._id);
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
  const { bsYear, bsMonth, category, group, paidBy, search } = req.query;

  const filter = {};
  if (bsYear) filter.bsYear = Number(bsYear);
  if (bsMonth) filter.bsMonth = Number(bsMonth);
  if (category) filter.category = category;
  if (group) filter.group = group;
  if (paidBy) filter.paidBy = paidBy;
  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }

  if (req.userType === "partner") {
    filter.paidBy = req.user._id;
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

  if (existing.settled) {
    throw new ApiError(400, "Cannot edit a settled expense. Revert the settlement first.");
  }

  const payload = normalizeExpensePayload(req.body);

  if (payload.applicablePartners.length === 0) {
    throw new ApiError(400, "At least one applicable partner is required");
  }

  await validateExpenseGrouping(payload);

  if (req.userType === "partner") {
    if (String(existing.createdBy) !== String(req.user._id)) {
      throw new ApiError(403, "You can only edit your own expenses");
    }
    await enforcePartnerExpenseRules(payload, req.user._id);
  }

  const updated = await Expense.findByIdAndUpdate(id, payload, { returnDocument: "after", runValidators: true });
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

  if (req.userType === "partner") {
    const existing = await Expense.findById(id);
    if (!existing) throw new ApiError(404, "Expense not found");
    if (String(existing.createdBy) !== String(req.user._id)) {
      throw new ApiError(403, "You can only delete your own expenses");
    }
  }

  const expense = await Expense.findById(id);
  if (!expense) throw new ApiError(404, "Expense not found");
  if (expense.settled) {
    throw new ApiError(400, "Cannot delete a settled expense. Revert the settlement first.");
  }

  await Expense.findByIdAndDelete(id);

  return res.status(200).json({
    success: true,
    message: "Expense deleted successfully",
  });
});
