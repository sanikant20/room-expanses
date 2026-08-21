import { Router } from "express";
import { login, logout, getMe, changePassword, partnerLogin, refreshAccessToken, updateProfile } from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { uploadAvatar } from "../middlewares/upload.middleware.js";

export const router = Router();

router.post("/login", login);
router.post("/partner-login", partnerLogin);
router.post("/refresh", refreshAccessToken);
router.post("/logout", verifyJWT, logout);
router.get("/me", verifyJWT, getMe);
router.put("/profile", verifyJWT, uploadAvatar, updateProfile);
router.put("/change-password", verifyJWT, changePassword);
