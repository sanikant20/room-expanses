import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers?.authorization;
    let token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      token = req.cookies?.accessToken;
    }

    if (!token) throw new ApiError(401, "Unauthorized");

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded._id).select("-password -refreshToken");
    if (!user) throw new ApiError(401, "User not found");

    req.user = user;
    next();
  } catch (error) {
    next(new ApiError(401, "Invalid or expired token"));
  }
};
