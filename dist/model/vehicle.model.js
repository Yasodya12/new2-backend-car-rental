"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const vehicleModel = new mongoose_1.default.Schema({
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
    }
});
const Vehicle = mongoose_1.default.model('Vehicle', vehicleModel);
exports.default = Vehicle;
