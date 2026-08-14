import { Router } from "express";
import { getSummary } from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

export const dashboardRouter = Router();

dashboardRouter.use(verifyJWT);

dashboardRouter.get("/summary", getSummary);
