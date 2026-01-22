"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.updateTripStatus = exports.validateTrip = exports.updateTrip = exports.deleteTrip = exports.getTripById = exports.saveTrip = exports.getAllTrips = exports.getTripsByDriverId = void 0;
const trip_model_1 = __importDefault(require("../model/trip.model"));
const email_1 = require("../utils/email");
const email_templates_1 = require("../utils/email.templates");
const getTripsByDriverId = (driverId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("driverId", driverId);
    const trips = yield trip_model_1.default.find({ driverId })
        .populate("driverId", "_id name email averageRating totalRatings experience provincesVisited")
        .populate("vehicleId", "_id brand model name")
        .populate("customerId", "_id name email")
        .lean();
    return trips;
});
exports.getTripsByDriverId = getTripsByDriverId;
const getAllTrips = () => __awaiter(void 0, void 0, void 0, function* () {
    const trips = yield trip_model_1.default.find()
        .populate("driverId", "_id name email averageRating totalRatings experience provincesVisited")
        .populate("vehicleId", "_id brand model name")
        .populate("customerId", "_id name email")
        .lean();
    return trips;
});
exports.getAllTrips = getAllTrips;
const saveTrip = (trip) => __awaiter(void 0, void 0, void 0, function* () {
    return trip_model_1.default.create(trip);
});
exports.saveTrip = saveTrip;
const getTripById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return trip_model_1.default.findById(id);
});
exports.getTripById = getTripById;
const deleteTrip = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return trip_model_1.default.findByIdAndDelete(id);
});
exports.deleteTrip = deleteTrip;
const updateTrip = (id, trip) => __awaiter(void 0, void 0, void 0, function* () {
    return trip_model_1.default.findByIdAndUpdate(id, trip, { new: true });
});
exports.updateTrip = updateTrip;
const validateTrip = (trip) => __awaiter(void 0, void 0, void 0, function* () {
    if (!trip.driverId || !trip.vehicleId || !trip.startLocation || !trip.endLocation || !trip.date) {
        return "Please provide all required fields";
    }
    // Validate endDate if provided
    if (trip.endDate) {
        const startDate = new Date(trip.date);
        const endDate = new Date(trip.endDate);
        if (endDate < startDate) {
            return "End date cannot be before start date";
        }
    }
    // Check for Driver Availability Conflict
    const driverId = trip.driverId;
    const queryDate = new Date(trip.date);
    const queryEndDate = trip.endDate ? new Date(trip.endDate) : null;
    // Find conflicting trips
    const conflictQuery = {
        driverId: driverId,
        status: { $nin: ["Completed", "Cancelled", "Rejected"] }
    };
    if (queryEndDate) {
        // Extended Trip requesting...
        const conflictConditions = [
            {
                // Existing trip overlaps with requested window
                date: { $lt: queryEndDate },
                endDate: { $gt: queryDate }
            }
        ];
        // Only check for active instant trips if the requested trip starts SOON (within 2 hours)
        const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);
        if (queryDate < twoHoursFromNow) {
            conflictConditions.push({
                endDate: { $exists: false },
                status: "Processing"
            });
        }
        conflictQuery.$or = conflictConditions;
    }
    else {
        // Quick Ride requesting...
        conflictQuery.$or = [
            { status: "Processing" },
            {
                date: { $lte: queryDate },
                endDate: { $gte: queryDate }
            }
        ];
    }
    const conflictingTrip = yield trip_model_1.default.findOne(conflictQuery);
    if (conflictingTrip) {
        return "Driver is already busy with another trip during this time.";
    }
    // Check for Vehicle Availability Conflict
    const vehicleId = trip.vehicleId;
    const vehicleConflictQuery = {
        vehicleId: vehicleId,
        status: { $nin: ["Completed", "Cancelled", "Rejected"] }
    };
    if (queryEndDate) {
        // Extended Trip requesting...
        const conflictConditions = [
            { date: { $lt: queryEndDate }, endDate: { $gt: queryDate } }
        ];
        // 2-hour buffer rule
        const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);
        if (queryDate < twoHoursFromNow) {
            conflictConditions.push({ endDate: { $exists: false }, status: "Processing" });
        }
        vehicleConflictQuery.$or = conflictConditions;
    }
    else {
        // Quick Ride
        vehicleConflictQuery.$or = [
            { status: "Processing" },
            { date: { $lte: queryDate }, endDate: { $gte: queryDate } }
        ];
    }
    const conflictingVehicleTrip = yield trip_model_1.default.findOne(vehicleConflictQuery);
    if (conflictingVehicleTrip) {
        return "Vehicle is already in use during this time.";
    }
    return null;
});
exports.validateTrip = validateTrip;
const updateTripStatus = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const updatedTrip = yield trip_model_1.default.findByIdAndUpdate(id, { status: data.status }, { new: true })
        .populate("driverId")
        .populate("customerId")
        .populate("vehicleId")
        .lean();
    if (updatedTrip && updatedTrip.customerId) {
        const customer = updatedTrip.customerId;
        const customerEmail = customer.email;
        const customerName = customer.name;
        // Handle Trip Accepted (Processing)
        if (data.status === "Processing" && updatedTrip.driverId) {
            const driver = updatedTrip.driverId;
            const vehicle = updatedTrip.vehicleId;
            if (driver && vehicle) {
                const html = (0, email_templates_1.tripAcceptedTemplate)(customerName, updatedTrip._id.toString(), driver.name, vehicle.brand, vehicle.model, vehicle.number || "Unknown", updatedTrip.startLocation, updatedTrip.endLocation, updatedTrip.date.toString(), updatedTrip.price || 0);
                yield (0, email_1.sendEmail)(customerEmail, "Trip Request Accepted! 🚗", "", html);
            }
        }
        // Handle Trip Cancelled
        if (data.status === "Cancelled") {
            const html = (0, email_templates_1.tripCancelledTemplate)(customerName, updatedTrip._id.toString(), updatedTrip.startLocation, updatedTrip.endLocation, updatedTrip.date.toString());
            yield (0, email_1.sendEmail)(customerEmail, "Trip Cancelled ❌", "", html);
        }
        // Handle Trip Completed
        if (data.status === "Completed") {
            const price = updatedTrip.price || 0;
            const html = (0, email_templates_1.tripCompletedTemplate)(customerName, updatedTrip._id.toString(), price, updatedTrip.startLocation, updatedTrip.endLocation, updatedTrip.date.toString(), (_a = updatedTrip.distance) === null || _a === void 0 ? void 0 : _a.toString());
            yield (0, email_1.sendEmail)(customerEmail, "Your Trip Bill 📄", "", html);
        }
    }
    // If trip is completed, update driver experience
    if (data.status === "Completed" && updatedTrip) {
        const User = (yield Promise.resolve().then(() => __importStar(require("../model/user.model")))).default;
        const driver = updatedTrip.driverId;
        if (driver && driver._id) {
            // Extract province from location (format: "District, Province")
            const startProvince = updatedTrip.startLocation.split(", ")[1] || "";
            const endProvince = updatedTrip.endLocation.split(", ")[1] || "";
            const driverDoc = yield User.findById(driver._id);
            if (driverDoc) {
                const currentProvinces = driverDoc.provincesVisited || [];
                // Use a Set to ensure we only count a province once per trip
                const provincesToUpdate = new Set();
                if (startProvince)
                    provincesToUpdate.add(startProvince);
                if (endProvince)
                    provincesToUpdate.add(endProvince);
                provincesToUpdate.forEach(pName => {
                    const existing = currentProvinces.find((p) => p.province === pName);
                    if (existing) {
                        existing.count += 1;
                    }
                    else {
                        currentProvinces.push({ province: pName, count: 1 });
                    }
                });
                yield User.findByIdAndUpdate(driver._id, {
                    $inc: { experience: 1 },
                    $set: { provincesVisited: currentProvinces }
                });
            }
        }
    }
    return updatedTrip;
});
exports.updateTripStatus = updateTripStatus;
