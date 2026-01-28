import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL as string;

export const DBConnection = async () => {
    try {
        console.log("Connecting to MongoDB...");
        const connection = await mongoose.connect(MONGODB_URL, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            connectTimeoutMS: 10000,
        });
        return `Successfully connected to DB ${connection.connection.host}`
    } catch (error) {
        console.error("MongoDB Connection Error details:", error);
        throw error; // Throwing error instead of returning string
    }
};