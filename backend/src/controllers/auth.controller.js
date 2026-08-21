import { User } from "../models/user.model.js";
import { Partner } from "../models/partner.model.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { generateTokens } from "../services/auth.service.js";
import { uploadBuffer, deleteImage } from "../services/upload.service.js";

const isProduction = process.env.NODE_ENV === "production";

// Token cookies must be invisible to JavaScript; the user cookie holds only
// public profile data and must stay readable by document.cookie.
const tokenCookieOptions = (maxAge, path = "/") => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: "Lax",
  maxAge,
  path,
});

const userCookieOptions = (maxAge, path = "/") => ({
  httpOnly: false,
  secure: isProduction,
  sameSite: "Lax",
  maxAge,
  path,
});

const ACCESS_MAX_AGE = 24 * 60 * 60 * 1000; // 1 day
const REFRESH_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  image: user.image,
  isActive: user.isActive,
  createdAt: user.createdAt,
  accountType: "user",
});

const publicPartner = (partner) => ({
  _id: partner._id,
  name: partner.name,
  email: partner.email,
  phone: partner.phone,
  image: partner.image,
  status: partner.status,
  bsJoiningDate: partner.bsJoiningDate,
  notes: partner.notes,
  createdAt: partner.createdAt,
  accountType: "partner",
});

const setAuthCookies = (res, accessToken, refreshToken, user) => {
  res.cookie("accessToken", accessToken, tokenCookieOptions(ACCESS_MAX_AGE));
  res.cookie("refreshToken", refreshToken, tokenCookieOptions(REFRESH_MAX_AGE, "/api/auth"));
  res.cookie("user", JSON.stringify(user), userCookieOptions(REFRESH_MAX_AGE));
};

const clearAuthCookies = (res) => {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/api/auth" });
  res.clearCookie("user", { path: "/" });
};

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

  const { accessToken, refreshToken } = await generateTokens(user);

  setAuthCookies(res, accessToken, refreshToken, publicUser(user));

  return res.status(200).json({
    success: true,
    message: "Login successful",
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
  const refreshToken = partner.generateRefreshToken();

  partner.refreshToken = refreshToken;
  await partner.save({ validateBeforeSave: false });

  setAuthCookies(res, accessToken, refreshToken, publicPartner(partner));

  return res.status(200).json({
    success: true,
    message: "Login successful",
  });
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, "Refresh token not found");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  if (decoded.type === "partner") {
    const partner = await Partner.findById(decoded._id).select("+refreshToken");
    if (!partner || partner.refreshToken !== token) {
      throw new ApiError(401, "Refresh token revoked");
    }

    const accessToken = partner.generateAccessToken();
    const newRefreshToken = partner.generateRefreshToken();

    partner.refreshToken = newRefreshToken;
    await partner.save({ validateBeforeSave: false });

    setAuthCookies(res, accessToken, newRefreshToken, publicPartner(partner));

    return res.status(200).json({ success: true, message: "Token refreshed" });
  }

  const user = await User.findById(decoded._id).select("+refreshToken");
  if (!user || user.refreshToken !== token) {
    throw new ApiError(401, "Refresh token revoked");
  }

  const { accessToken: newAccess, refreshToken: newRefresh } = await generateTokens(user);

  setAuthCookies(res, newAccess, newRefresh, publicUser(user));

  return res.status(200).json({ success: true, message: "Token refreshed" });
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
      if (decoded.type === "partner") {
        await Partner.findByIdAndUpdate(decoded._id, { $unset: { refreshToken: 1 } });
      } else {
        await User.findByIdAndUpdate(decoded._id, { $unset: { refreshToken: 1 } });
      }
    } catch {
      // token already invalid — still clear cookies
    }
  }

  clearAuthCookies(res);

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export const getMe = asyncHandler(async (req, res) => {
  if (req.userType === "partner") {
    return res.status(200).json({
      success: true,
      message: "Current user fetched",
      user: publicPartner(req.user),
    });
  }

  const user = await User.findById(req.user._id).select("-password -refreshToken");
  return res.status(200).json({
    success: true,
    message: "Current user fetched",
    user: publicUser(user),
  });
});

/**
 * Update the logged-in account's own profile (name, phone, avatar).
 * Email is intentionally immutable. Accepts multipart with an optional image file.
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;

  if (!name || !String(name).trim()) {
    throw new ApiError(400, "Name is required");
  }

  if (req.userType === "partner") {
    const partner = await Partner.findById(req.user._id);
    if (!partner) throw new ApiError(404, "Partner not found");

    const previousImage = partner.image;
    let imageUrl = previousImage;
    if (req.file) {
      imageUrl = await uploadBuffer(req.file.buffer, "partner");
    }

    partner.name = String(name).trim();
    partner.phone = phone !== undefined ? phone : partner.phone;
    partner.image = imageUrl || previousImage || undefined;
    await partner.save({ validateBeforeSave: false });

    if (req.file && imageUrl && previousImage && imageUrl !== previousImage) {
      deleteImage(previousImage);
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: publicPartner(partner),
    });
  }

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  const previousImage = user.image;
  let imageUrl = previousImage;
  if (req.file) {
    imageUrl = await uploadBuffer(req.file.buffer, "user");
  }

  user.name = String(name).trim();
  user.phone = phone !== undefined ? phone : user.phone;
  user.image = imageUrl || previousImage || undefined;
  await user.save({ validateBeforeSave: false });

  if (req.file && imageUrl && previousImage && imageUrl !== previousImage) {
    deleteImage(previousImage);
  }

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully",
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

    const accessToken = partner.generateAccessToken();
    const refreshToken = partner.generateRefreshToken();
    partner.refreshToken = refreshToken;
    await partner.save({ validateBeforeSave: false });

    setAuthCookies(res, accessToken, refreshToken, publicPartner(partner));

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

  const { accessToken, refreshToken } = await generateTokens(user);
  setAuthCookies(res, accessToken, refreshToken, publicUser(user));

  return res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});
