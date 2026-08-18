import express from "express";
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

app.use(errorHandler);

export default app;