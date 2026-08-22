import express from "express";
import path from "path";
import fs from "fs";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import { corsOptions } from "./config/cors.js";
import { baseRoutes } from "./index.js";
import { errorHandler } from "./utils/errorHandler.js";

const app = express();

app.use(cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: "15mb" }));
app.use(cookieParser());

baseRoutes(app);

// Single-origin deployment: serve the built SPA from this same origin so auth
// cookies stay first-party (cross-site cookies are blocked by modern browsers,
// which broke production logins when the frontend lived on a separate domain).
// Skipped in dev — the build folder only exists after `npm run build` in frontend/.
const clientBuild = path.resolve(process.cwd(), "../frontend/build");
if (fs.existsSync(path.join(clientBuild, "index.html"))) {
  app.use(express.static(clientBuild));
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api")) return next();
    res.sendFile(path.join(clientBuild, "index.html"));
  });
}

app.use(errorHandler);

export default app;