import { Router } from "express";
import {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
} from "../controllers/expense.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

export const expenseRouter = Router();

expenseRouter.use(verifyJWT);

expenseRouter.post("/", createExpense);
expenseRouter.get("/", getExpenses);
expenseRouter.get("/:id", getExpense);
expenseRouter.put("/:id", updateExpense);
expenseRouter.delete("/:id", deleteExpense);
