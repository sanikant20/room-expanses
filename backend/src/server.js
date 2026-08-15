import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./app.js";
import { startAutoSettleJob } from "./services/autoSettle.service.js";

dotenv.config();

const PORT = process.env.PORT || 8000;

//
// ===================== START SERVER =====================
//

const startServer = async () => {
    try {
        await connectDB();

        startAutoSettleJob();

        app.listen(PORT, () => {
            console.log(`🚀 Server running on PORT: ${PORT}`);
        });
    } catch (error) {
        console.log("❌ MongoDB connection failed:", error);
        process.exit(1);
    }
};

startServer();