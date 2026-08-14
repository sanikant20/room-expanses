import { User } from "../models/user.model.js";
import { Partner } from "../models/partner.model.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { generateTokens } from "../services/auth.service.js";

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  image: user.image,
  isActive: user.isActive,
  accountType: "user",
});

const publicPartner = (partner) => ({
  _id: partner._id,
  name: partner.name,
  email: partner.email,
  phone: partner.phone,
  image: partner.image,
  status: partner.status,
  accountType: "partner",
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email, and password are required");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, "User already exists with this email");
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    phone,
    password,
    role: req.body.role || "admin",
  });

  const { accessToken } = await generateTokens(user);

  return res.status(201).json({
    success: true,
    message: "Registration successful",
    token: accessToken,
    user: publicUser(user),
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Account is deactivated. Contact an administrator.");
  }

  const isValid = await user.isPasswordCorrect(password);
  if (!isValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const { accessToken } = await generateTokens(user);

  return res.status(200).json({
    success: true,
    message: "Login successful",
    token: accessToken,
    user: publicUser(user),
  });
});

export const partnerLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const partner = await Partner.findOne({ email: email.toLowerCase() }).select("+password");
  if (!partner) {
    throw new ApiError(404, "Partner not found with this email");
  }

  if (partner.status !== "active") {
    throw new ApiError(403, "Account is deactivated. Contact an administrator.");
  }

  const isValid = await partner.isPasswordCorrect(password);
  if (!isValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const accessToken = partner.generateAccessToken();

  return res.status(200).json({
    success: true,
    message: "Login successful",
    token: accessToken,
    user: publicPartner(partner),
  });
});

export const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -refreshToken");
  return res.status(200).json({
    success: true,
    message: "Current user fetched",
    user: publicUser(user),
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old password and new password are required");
  }

  if (req.userType === "partner") {
    const partner = await Partner.findById(req.user._id).select("+password");
    if (!partner) throw new ApiError(404, "Partner not found");

    const isValid = await partner.isPasswordCorrect(oldPassword);
    if (!isValid) throw new ApiError(401, "Current password is incorrect");

    partner.password = newPassword;
    await partner.save();
    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!user) throw new ApiError(404, "User not found");

  const isValid = await user.isPasswordCorrect(oldPassword);
  if (!isValid) throw new ApiError(401, "Current password is incorrect");

  user.password = newPassword;
  await user.save();
  return res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});
