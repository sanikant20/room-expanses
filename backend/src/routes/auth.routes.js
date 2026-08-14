import { Router } from "express";
import { register, login, logout, getMe, changePassword } from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

export const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", verifyJWT, logout);
router.get("/me", verifyJWT, getMe);
router.post("/change-password", verifyJWT, changePassword);
router.put("/change-password", verifyJWT, changePassword);
