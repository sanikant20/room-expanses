import { router as authRoutes } from "./routes/auth.routes.js";
import { partnerRouter } from "./routes/partner.routes.js";
import { expenseRouter } from "./routes/expense.routes.js";
import { dashboardRouter } from "./routes/dashboard.routes.js";
import { reportRouter } from "./routes/report.routes.js";
import { settlementRouter } from "./routes/settlement.routes.js";

export const baseRoutes = (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/partners", partnerRouter);
  app.use("/api/expenses", expenseRouter);
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/reports", reportRouter);
  app.use("/api/settlement", settlementRouter);

  app.use("/api", (req, res) => {
    res.status(404).json({ success: false, message: "API route not found" });
  });
};
