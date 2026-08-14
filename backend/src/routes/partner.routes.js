import { Router } from "express";
import {
  createPartner,
  getPartners,
  getPartner,
  updatePartner,
  deletePartner,
  togglePartnerStatus,
  getPartnerExpenses,
} from "../controllers/partner.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

export const partnerRouter = Router();

partnerRouter.use(verifyJWT);

partnerRouter.post("/", createPartner);
partnerRouter.get("/", getPartners);
partnerRouter.get("/:id/expenses", getPartnerExpenses);
partnerRouter.get("/:id", getPartner);
partnerRouter.put("/:id", updatePartner);
partnerRouter.put("/:id/toggle", togglePartnerStatus);
partnerRouter.delete("/:id", deletePartner);
