import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Partner } from "../models/partner.model.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyJWT = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.headers?.authorization?.replace("Bearer ", "");

    if (!token) throw new ApiError(401, "Unauthorized");

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (decoded.type === "partner") {
      const partner = await Partner.findById(decoded._id).select("-password -refreshToken");
      if (!partner) throw new ApiError(401, "Partner not found");
      if (partner.status !== "active") throw new ApiError(403, "Account is deactivated");
      req.user = partner;
      req.userType = "partner";
      next();
      return;
    }

    const user = await User.findById(decoded._id).select("-password -refreshToken");
    if (!user) throw new ApiError(401, "User not found");

    req.user = user;
    req.userType = "user";
    next();
  } catch (error) {
    if (error instanceof ApiError) return next(error);
    next(new ApiError(401, "Invalid or expired token"));
  }
};

export const verifyUserOnly = (req, _res, next) => {
  if (req.userType !== "user") {
    throw new ApiError(403, "Only admin users can perform this action");
  }
  next();
};
