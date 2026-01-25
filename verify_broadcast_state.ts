
import mongoose from 'mongoose';
import Trip from './src/model/trip.model';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/transport-db'); // Adjust DB URI if needed
        console.log("Connected to DB");

        const trips = await Trip.find({ status: 'Pending' });
        console.log(`Found ${trips.length} Pending trips.`);

        for (const trip of trips) {
            console.log('------------------------------------------------');
            console.log(`Trip ID: ${trip._id}`);
            console.log(`Status: ${trip.status}`);
            console.log(`IsBroadcast: ${trip.isBroadcast}`);
            console.log(`DriverId: ${trip.driverId}`);
            console.log(`RejectedDrivers: ${trip.rejectedDrivers}`);
            console.log(`StartLocation: ${trip.startLocation}`);
            console.log(`CreatedAt: ${trip.createdAt}`);
            console.log('------------------------------------------------');
        }

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
