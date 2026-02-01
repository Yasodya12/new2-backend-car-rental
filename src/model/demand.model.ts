import mongoose from 'mongoose';

const demandSignalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    address: {
        type: String,
        required: true
    },
    lat: {
        type: Number,
        required: true
    },
    lng: {
        type: Number,
        required: true
    },
    reason: {
        type: String, // 'no_drivers', 'no_vehicles', 'both'
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const DemandSignal = mongoose.model('DemandSignal', demandSignalSchema);
export default DemandSignal;
