import { Router } from "express";
import {
  monthlyReport,
  partnerReport,
  categoryReport,
  settlementReport,
} from "../controllers/report.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

export const reportRouter = Router();

reportRouter.use(verifyJWT);

reportRouter.get("/monthly", monthlyReport);
reportRouter.get("/partner", partnerReport);
reportRouter.get("/category", categoryReport);
reportRouter.get("/settlement", settlementReport);
