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
        enum: ['Pending', 'Accepted', 'Processing', 'Completed', 'Cancelled', 'Rejected', 'Paid'],
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
    promoCode: {
        type: String
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    startLat: { type: Number },
    startLng: { type: Number },
    endLat: { type: Number },
    endLng: { type: Number },
    currentLat: { type: Number },
    currentLng: { type: Number },
    currentProgress: { type: Number, default: 0 },
    rating: { type: Number, min: 0, max: 5 },
    rejectionReason: { type: String },
    rejectedDrivers: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const Trip = mongoose_1.default.model("Trip", tripSchema);
exports.default = Trip;
