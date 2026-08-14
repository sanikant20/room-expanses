import { Router } from "express";
import { getCalculations, getSettlement, revertSettlement, settleMonth } from "../controllers/settlement.controller.js";
import { verifyJWT, verifyUserOnly } from "../middlewares/auth.middleware.js";

export const settlementRouter = Router();

settlementRouter.use(verifyJWT);

settlementRouter.get("/", getSettlement);
settlementRouter.get("/calculations", getCalculations);
settlementRouter.post("/settle", verifyUserOnly, settleMonth);
settlementRouter.post("/unsettle", verifyUserOnly, revertSettlement);
