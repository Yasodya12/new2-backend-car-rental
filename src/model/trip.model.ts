import mongoose from "mongoose";

const tripSchema = new mongoose.Schema({

    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },

    customerId: {
        type: mongoose.Schema.Types.ObjectId,
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
        enum: ['Pending', 'Accepted', 'Processing', 'Completed', 'Cancelled', 'Rejected'],
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
    rejectedDrivers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Trip = mongoose.model("Trip", tripSchema);
export default Trip;
