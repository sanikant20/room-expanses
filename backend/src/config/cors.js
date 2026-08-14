import cors from "cors";

export const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
};