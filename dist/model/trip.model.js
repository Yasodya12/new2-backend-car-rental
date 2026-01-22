"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const tripSchema = new mongoose_1.default.Schema({
    driverId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    vehicleId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Vehicle" },
    customerId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User"
    },
    startLocation: {
        type: String,
        required: true
    },
    endLocation: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date
    },
    status: {
        type: String,
        default: "Pending"
    },
    distance: {
        type: String
    },
    price: {
        type: Number
    },
    notes: {
        type: String
    },
    tripType: {
        type: String,
        enum: ['Instant', 'Scheduled'],
        default: 'Scheduled'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const Trip = mongoose_1.default.model("Trip", tripSchema);
exports.default = Trip;
