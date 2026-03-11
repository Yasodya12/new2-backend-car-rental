import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import Trip from "./model/trip.model";
import { calculateDriverFee } from "./utils/pricingUtils";

dotenv.config({ path: path.join(__dirname, "../.env") });

const migrate = async () => {
    try {
        const mongoUrl = process.env.MONGODB_URL;
        const dbName = process.env.DB_NAME || "test";

        if (!mongoUrl) {
            console.error("MONGODB_URL not found in .env");
            process.exit(1);
        }

        console.log(`Connecting to MongoDB: ${dbName}...`);
        await mongoose.connect(mongoUrl, { dbName });
        console.log("Connected successfully.");

        // Find trips that don't have driverFee or have it as 0
        const tripsToUpdate = await Trip.find({
            $or: [
                { driverFee: { $exists: false } },
                { driverFee: 0 }
            ],
            price: { $gt: 0 }
        });

        console.log(`Found ${tripsToUpdate.length} trips to update.`);

        let updatedCount = 0;
        for (const trip of tripsToUpdate) {
            const fee = calculateDriverFee(trip.price || 0);
            await Trip.findByIdAndUpdate(trip._id, { driverFee: fee });
            updatedCount++;
            if (updatedCount % 10 === 0) {
                console.log(`Updated ${updatedCount}/${tripsToUpdate.length} trips...`);
            }
        }

        console.log(`Successfully updated ${updatedCount} trips with driver fees.`);
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

migrate();
