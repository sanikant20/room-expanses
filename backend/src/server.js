import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import app from "./app.js";
import { startAutoSettleJob } from "./services/autoSettle.service.js";

dotenv.config();

const PORT = process.env.PORT || 8000;

const startServer = async () => {
    try {
        await connectDB();

        startAutoSettleJob();

        const server = app.listen(PORT, () => {
            console.log(`Server running on PORT: ${PORT}`);
        });

        const shutdown = async (signal) => {
            console.log(`\n${signal} received. Shutting down gracefully...`);
            server.close(async () => {
                await mongoose.connection.close();
                console.log("MongoDB connection closed.");
                process.exit(0);
            });
            setTimeout(() => {
                console.error("Forced shutdown after timeout.");
                process.exit(1);
            }, 10000);
        };

        process.on("SIGTERM", () => shutdown("SIGTERM"));
        process.on("SIGINT", () => shutdown("SIGINT"));
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

startServer();