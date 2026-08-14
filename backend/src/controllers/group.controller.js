import { Group } from "../models/group.model.js";
import { Expense } from "../models/expense.model.js";
import { Partner } from "../models/partner.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const populateOptions = () => [
  { path: "partners", select: "name image status" },
];

const withPopulates = (query) => query.populate(populateOptions());

const validatePartners = async (partnerIds, { requireAtLeastOne = true } = {}) => {
  const ids = [...new Set((partnerIds || []).map((id) => String(id)))];
  if (requireAtLeastOne && ids.length === 0) {
    throw new ApiError(400, "At least one partner is required");
  }
  if (ids.length > 0) {
    const count = await Partner.countDocuments({ _id: { $in: ids } });
    if (count !== ids.length) {
      throw new ApiError(400, "One or more partners are invalid");
    }
  }
  return ids;
};

export const createGroup = asyncHandler(async (req, res) => {
  const { name, description, partners } = req.body;

  if (!name || !String(name).trim()) {
    throw new ApiError(400, "Group name is required");
  }

  const partnerIds = await validatePartners(partners);

  const group = await Group.create({
    name: String(name).trim(),
    description: description || "",
    status: "active",
    partners: partnerIds,
    createdBy: req.user._id,
  });

  const populated = await withPopulates(Group.findById(group._id));

  return res.status(201).json({
    success: true,
    message: "Group created successfully",
    group: populated,
  });
});

export const getGroups = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const filter = {};
  if (status === "active" || status === "inactive") {
    filter.status = status;
  }

  const groups = await withPopulates(Group.find(filter)).sort({ createdAt: -1 });

  const groupsWithStats = await Promise.all(
    groups.map(async (group) => {
      const expenseCount = await Expense.countDocuments({ group: group._id });
      return {
        ...group.toObject(),
        partnerCount: group.partners?.length || 0,
        expenseCount,
      };
    })
  );

  return res.status(200).json({
    success: true,
    message: "Groups fetched successfully",
    groups: groupsWithStats,
  });
});

export const getGroup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) throw new ApiError(400, "Invalid group id");

  const group = await withPopulates(Group.findById(id));
  if (!group) throw new ApiError(404, "Group not found");

  const expenseCount = await Expense.countDocuments({ group: id });

  return res.status(200).json({
    success: true,
    message: "Group fetched successfully",
    group: { ...group.toObject(), partnerCount: group.partners?.length || 0, expenseCount },
  });
});

export const updateGroup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) throw new ApiError(400, "Invalid group id");

  const { name, description, partners, status } = req.body;

  const existing = await Group.findById(id);
  if (!existing) throw new ApiError(404, "Group not found");

  if (status && !["active", "inactive"].includes(status)) {
    throw new ApiError(400, "Status must be active or inactive");
  }

  const partnerIds = await validatePartners(partners);

  const group = await Group.findByIdAndUpdate(
    id,
    {
      name: name !== undefined ? String(name).trim() : existing.name,
      description: description !== undefined ? description : existing.description,
      status: status !== undefined ? status : existing.status,
      partners: partnerIds,
    },
    { new: true, runValidators: true }
  );

  const populated = await withPopulates(Group.findById(group._id));

  return res.status(200).json({
    success: true,
    message: "Group updated successfully",
    group: populated,
  });
});

export const deleteGroup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) throw new ApiError(400, "Invalid group id");

  const hasExpenses = await Expense.exists({ group: id });
  if (hasExpenses) {
    throw new ApiError(409, "Cannot delete group with recorded expenses");
  }

  const group = await Group.findByIdAndDelete(id);
  if (!group) throw new ApiError(404, "Group not found");

  return res.status(200).json({
    success: true,
    message: "Group deleted successfully",
  });
});
