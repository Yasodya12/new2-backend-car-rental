import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL as string;

export const DBConnection = async () => {
    try {
        const connection = await mongoose.connect(MONGODB_URL);
        return `Successfully connected to DB ${connection.connection.host}`
    }catch (error){
        return "Mongo Connection Failed !!"+ error;
    }
};