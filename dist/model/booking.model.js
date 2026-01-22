"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bookingSchema = new mongoose_1.default.Schema({
    customerId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    tripId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Trip",
        required: true
    },
    bookingDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        default: "Pending"
    },
    notes: {
        type: String
    }
});
const Booking = mongoose_1.default.model("Booking", bookingSchema);
exports.default = Booking;
