import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            process.env.MONGODB_URI,
            {
                dbName: process.env.DB_NAME,
                maxPoolSize: 10,
                minPoolSize: 2,
                maxIdleTimeMS: 30000,
                serverSelectionTimeoutMS: 5000,
            }
        );

        console.log("MongoDB Connected Successfully!");

        console.log(`DB Host: ${connectionInstance.connection.host}`);
        console.log(`DB Name: ${connectionInstance.connection.name}`);

    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

export default connectDB;