import { Router } from "express";
import {
  completeTurnAction,
  createTurn,
  getPublicTurnState,
  getTurnHistory,
  getTurnState,
  resetTurnEvent,
  updateTurn,
} from "../controllers/turn.controller.js";
import { verifyJWT, verifyUserOnly } from "../middlewares/auth.middleware.js";

export const turnRouter = Router();

turnRouter.get("/public", getPublicTurnState);

turnRouter.use(verifyJWT);

turnRouter.get("/", getTurnState);
turnRouter.get("/history", getTurnHistory);
turnRouter.post("/", verifyUserOnly, createTurn);
turnRouter.put("/:id", verifyUserOnly, updateTurn);
turnRouter.post("/complete", completeTurnAction);
turnRouter.post("/reset", verifyUserOnly, resetTurnEvent);