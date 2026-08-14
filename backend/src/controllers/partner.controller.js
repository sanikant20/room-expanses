import { Partner } from "../models/partner.model.js";
import { Expense } from "../models/expense.model.js";
import { Group } from "../models/group.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const hashPassword = async (password) => bcrypt.hash(password, 10);

export const createPartner = asyncHandler(async (req, res) => {
  const { name, phone, email, image, bsJoiningDate, notes, password } = req.body;

  if (!name) {
    throw new ApiError(400, "Name is required");
  }

  const resolvedPassword = password || phone;
  if (!resolvedPassword) {
    throw new ApiError(400, "Phone number or password is required to set a partner login");
  }

  const partner = await Partner.create({
    name,
    phone,
    email,
    image,
    bsJoiningDate,
    status: "active",
    notes,
    password: resolvedPassword,
    createdBy: req.user._id,
  });

  return res.status(201).json({
    success: true,
    message: "Partner created successfully",
    partner,
  });
});

export const getPartners = asyncHandler(async (req, res) => {
  const { status = "all" } = req.query;

  const filter = {};
  if (status === "active" || status === "inactive") {
    filter.status = status;
  }

  const partners = await Partner.find(filter).sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    message: "Partners fetched successfully",
    partners,
  });
});

export const getPartner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) throw new ApiError(400, "Invalid partner id");

  const partner = await Partner.findById(id);
  if (!partner) throw new ApiError(404, "Partner not found");

  return res.status(200).json({
    success: true,
    message: "Partner fetched successfully",
    partner,
  });
});

export const updatePartner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) throw new ApiError(400, "Invalid partner id");

  const { name, phone, email, image, bsJoiningDate, status, notes, password } = req.body;

  const update = {
    name,
    phone,
    email,
    image,
    bsJoiningDate,
    status,
    notes,
  };

  if (password) {
    update.password = await hashPassword(password);
  }

  const partner = await Partner.findByIdAndUpdate(
    id,
    update,
    { new: true, runValidators: true }
  );

  if (!partner) throw new ApiError(404, "Partner not found");

  return res.status(200).json({
    success: true,
    message: "Partner updated successfully",
    partner,
  });
});

export const deletePartner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) throw new ApiError(400, "Invalid partner id");

  const hasExpenses = await Expense.exists({
    $or: [{ paidBy: id }, { applicablePartners: id }, { excludedPartners: id }],
  });

  if (hasExpenses) {
    throw new ApiError(409, "Cannot delete partner with recorded expenses. Set them inactive instead.");
  }

  const inGroup = await Group.exists({ partners: id });
  if (inGroup) {
    throw new ApiError(409, "Cannot delete partner that belongs to a group. Remove them from groups first.");
  }

  const partner = await Partner.findByIdAndDelete(id);
  if (!partner) throw new ApiError(404, "Partner not found");

  return res.status(200).json({
    success: true,
    message: "Partner deleted successfully",
  });
});

export const togglePartnerStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!isValidId(id)) throw new ApiError(400, "Invalid partner id");
  if (!["active", "inactive"].includes(status)) {
    throw new ApiError(400, "Status must be active or inactive");
  }

  const partner = await Partner.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );

  if (!partner) throw new ApiError(404, "Partner not found");

  return res.status(200).json({
    success: true,
    message: `Partner ${status === "active" ? "activated" : "inactivated"} successfully`,
    partner,
  });
});

export const resetPartnerPassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) throw new ApiError(400, "Invalid partner id");

  const partner = await Partner.findById(id);
  if (!partner) throw new ApiError(404, "Partner not found");

  if (!partner.phone) {
    throw new ApiError(400, "Partner has no phone number to use as the default password");
  }

  partner.password = partner.phone;
  await partner.save();

  return res.status(200).json({
    success: true,
    message: `Password reset successfully. Default password is the phone number: ${partner.phone}`,
  });
});

export const getPartnerExpenses = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) throw new ApiError(400, "Invalid partner id");

  const { bsYear, bsMonth } = req.query;
  const filter = {
    $or: [{ paidBy: id }, { applicablePartners: id }],
  };
  if (bsYear) filter.bsYear = Number(bsYear);
  if (bsMonth) filter.bsMonth = Number(bsMonth);

  const expenses = await Expense.find(filter)
    .populate("paidBy", "name image")
    .populate("applicablePartners", "name image")
    .sort({ bsDate: -1 });

  return res.status(200).json({
    success: true,
    message: "Partner expenses fetched successfully",
    expenses,
  });
});
