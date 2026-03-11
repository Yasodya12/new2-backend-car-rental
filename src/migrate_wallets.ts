import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import Trip from "./model/trip.model";
import User from "./model/user.model";

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

        // Get all drivers
        const drivers = await User.find({ role: "driver" });
        console.log(`Found ${drivers.length} drivers.`);

        for (const driver of drivers) {
            // Find all completed/paid trips for this driver
            const trips = await Trip.find({
                driverId: driver._id,
                status: { $in: ["Completed", "Paid"] }
            });

            // Calculate total earnings from driverFee
            const totalEarnings = trips.reduce((sum, trip) => sum + (trip.driverFee || 0), 0);

            console.log(`Driver ${driver.name} (${driver._id}): Found ${trips.length} completed trips. Total Earnings: ${totalEarnings}`);

            // Update driver wallet balance
            await User.findByIdAndUpdate(driver._id, { walletBalance: totalEarnings });
        }

        console.log("Wallet migration completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

migrate();
