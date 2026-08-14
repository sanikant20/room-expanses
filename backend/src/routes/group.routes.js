import { Router } from "express";
import {
  createGroup,
  deleteGroup,
  getGroup,
  getGroups,
  updateGroup,
} from "../controllers/group.controller.js";
import { verifyJWT, verifyUserOnly } from "../middlewares/auth.middleware.js";

export const groupRouter = Router();

groupRouter.use(verifyJWT);

groupRouter.post("/", verifyUserOnly, createGroup);
groupRouter.get("/", getGroups);
groupRouter.get("/:id", getGroup);
groupRouter.put("/:id", verifyUserOnly, updateGroup);
groupRouter.delete("/:id", verifyUserOnly, deleteGroup);
