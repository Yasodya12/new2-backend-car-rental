import mongoose from "mongoose";

const vehicleModel = new mongoose.Schema({
    brand: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    seats: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    location: {
        lat: {
            type: Number
        },
        lng: {
            type: Number
        },
        address: {
            type: String
        }
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    category: {
        type: String,
        enum: ['Economy', 'Standard', 'Luxury', 'Premium'],
        required: true,
        default: 'Standard'
    },
    pricePerKm: {
        type: Number,
        required: true
    },
    maintenance: [{
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        reason: {
            type: String
        }
    }]
})
const Vehicle = mongoose.model('Vehicle', vehicleModel);
export default Vehicle