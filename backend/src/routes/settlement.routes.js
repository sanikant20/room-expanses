import { Router } from "express";
import {
  confirmTransactionReceipt,
  getCalculations,
  getSettlement,
  markTransactionPaid,
  resetTransactionPayment,
  revertSettlement,
  settleMonth,
} from "../controllers/settlement.controller.js";
import { verifyJWT, verifyUserOnly } from "../middlewares/auth.middleware.js";

export const settlementRouter = Router();

settlementRouter.use(verifyJWT);

settlementRouter.get("/", getSettlement);
settlementRouter.get("/calculations", getCalculations);
settlementRouter.post("/settle", verifyUserOnly, settleMonth);
settlementRouter.post("/unsettle", verifyUserOnly, revertSettlement);
settlementRouter.post("/pay", markTransactionPaid);
settlementRouter.post("/confirm", confirmTransactionReceipt);
settlementRouter.post("/reset", verifyUserOnly, resetTransactionPayment);
