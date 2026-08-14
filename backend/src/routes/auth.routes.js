import { Router } from "express";
import { register, login, logout, getMe, changePassword, partnerLogin } from "../controllers/auth.controller.js";
import { verifyJWT, verifyUserOnly } from "../middlewares/auth.middleware.js";

export const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/partner-login", partnerLogin);
router.post("/logout", verifyJWT, verifyUserOnly, logout);
router.get("/me", verifyJWT, verifyUserOnly, getMe);
router.post("/change-password", verifyJWT, changePassword);
router.put("/change-password", verifyJWT, changePassword);
