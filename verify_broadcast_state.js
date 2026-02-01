"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const trip_model_1 = __importDefault(require("./src/model/trip.model"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/transport-db'); // Adjust DB URI if needed
        console.log("Connected to DB");
        const trips = yield trip_model_1.default.find({ status: 'Pending' });
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
    }
    catch (error) {
        console.error(error);
    }
    finally {
        yield mongoose_1.default.disconnect();
    }
});
run();
