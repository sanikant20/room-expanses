import { router as authRoutes } from "./routes/auth.routes.js";
import { partnerRouter } from "./routes/partner.routes.js";
import { groupRouter } from "./routes/group.routes.js";
import { expenseRouter } from "./routes/expense.routes.js";
import { dashboardRouter } from "./routes/dashboard.routes.js";
import { reportRouter } from "./routes/report.routes.js";
import { settlementRouter } from "./routes/settlement.routes.js";
import { turnRouter } from "./routes/turn.routes.js";
import mongoose from "mongoose";

export const baseRoutes = (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/partners", partnerRouter);
  app.use("/api/groups", groupRouter);
  app.use("/api/expenses", expenseRouter);
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/reports", reportRouter);
  app.use("/api/settlement", settlementRouter);
  app.use("/api/turn", turnRouter);

  app.use("/api/health", (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbConnected = dbState === 1;
    res.status(dbConnected ? 200 : 503).json({
      success: dbConnected,
      status: "ok",
      db: ["disconnected", "connected", "connecting", "disconnecting"][dbState] || "unknown",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/api", (req, res) => {
    res.status(404).json({ success: false, message: "API route not found" });
  });
};
