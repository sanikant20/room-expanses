import { Router } from "express";
import {
  createPartner,
  getPartners,
  getPartner,
  updatePartner,
  deletePartner,
  togglePartnerStatus,
  resetPartnerPassword,
  getPartnerExpenses,
} from "../controllers/partner.controller.js";
import { verifyJWT, verifyUserOnly } from "../middlewares/auth.middleware.js";
import { uploadAvatar } from "../middlewares/upload.middleware.js";

export const partnerRouter = Router();

partnerRouter.use(verifyJWT);

partnerRouter.post("/", verifyUserOnly, uploadAvatar, createPartner);
partnerRouter.get("/", getPartners);
partnerRouter.get("/:id/expenses", getPartnerExpenses);
partnerRouter.get("/:id", getPartner);
partnerRouter.put("/:id", verifyUserOnly, uploadAvatar, updatePartner);
partnerRouter.put("/:id/toggle", verifyUserOnly, togglePartnerStatus);
partnerRouter.put("/:id/reset-password", verifyUserOnly, resetPartnerPassword);
partnerRouter.delete("/:id", verifyUserOnly, deletePartner);
