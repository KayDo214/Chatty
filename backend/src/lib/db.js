import mongoose from "mongoose";

export const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        // Without a database every request would hang until it timed out.
        // Crash so the failure is visible and the host can restart us.
        console.log("MongoDB connection error:", error.message);
        process.exit(1);
    }
};
