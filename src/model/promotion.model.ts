import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    discountType: {
        type: String,
        enum: ['Percentage', 'Fixed'],
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    maxDiscount: {
        type: Number,
        default: 0 // 0 means no limit for Fixed, or used as cap for Percentage
    },
    minTripAmount: {
        type: Number,
        default: 0
    },
    expiryDate: {
        type: Date,
        required: true
    },
    usageLimit: {
        type: Number,
        default: 100
    },
    usedCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Promotion = mongoose.model("Promotion", promotionSchema);
export default Promotion;
