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
exports.checkAndReassignPendingTrips = exports.updateTripLocation = exports.updateTripStatus = exports.validateTrip = exports.updateTrip = exports.deleteTrip = exports.getTripById = exports.saveTrip = exports.getAllTrips = exports.getTripsByDriverId = void 0;
const trip_model_1 = __importDefault(require("../model/trip.model"));
const vehicle_model_1 = __importDefault(require("../model/vehicle.model"));
const email_1 = require("../utils/email");
const email_templates_1 = require("../utils/email.templates");
const pricingUtils_1 = require("../utils/pricingUtils");
const user_service_1 = require("./user.service");
const notification_service_1 = require("./notification.service");
const getTripsByDriverId = (driverId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Checking trips for Driver:", driverId);
    // Debug: Check count of broadcast trips in general
    const broadcastCount = yield trip_model_1.default.countDocuments({ isBroadcast: true, status: "Pending" });
    console.log(`Total Pending Broadcast Trips in DB: ${broadcastCount}`);
    const query = {
        $or: [
            { driverId: driverId },
            {
                isBroadcast: true,
                rejectedDrivers: { $ne: driverId },
                status: "Pending"
            }
        ]
    };
    // console.log("Query:", JSON.stringify(query));
    const trips = yield trip_model_1.default.find(query)
        .populate("driverId", "_id name email averageRating totalRatings experience provincesVisited")
        .populate("vehicleId", "_id brand model name category pricePerKm")
        .populate("customerId", "_id name email")
        .lean();
    return trips;
});
exports.getTripsByDriverId = getTripsByDriverId;
const getAllTrips = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filter = {}) {
    const trips = yield trip_model_1.default.find(filter)
        .populate("driverId", "_id name email averageRating totalRatings experience provincesVisited")
        .populate("vehicleId", "_id brand model name category pricePerKm")
        .populate("customerId", "_id name email")
        .lean();
    return trips;
});
exports.getAllTrips = getAllTrips;
const saveTrip = (trip) => __awaiter(void 0, void 0, void 0, function* () {
    // Auto-calculate price based on vehicle category and distance
    if (trip.vehicleId && trip.distance && !trip.price) {
        // Extract numeric distance (handle "50 km" or "50")
        const distanceStr = trip.distance.toString().replace(/[^\d.]/g, '');
        const distanceKm = parseFloat(distanceStr);
        if (!isNaN(distanceKm) && distanceKm > 0) {
            // Fetch vehicle to get category
            const vehicle = yield vehicle_model_1.default.findById(trip.vehicleId);
            if (vehicle && vehicle.category) {
                trip.price = (0, pricingUtils_1.calculateTripPrice)(distanceKm, vehicle.category);
            }
        }
    }
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
        status: { $nin: ["Completed", "Cancelled", "Rejected", "Pending"] }
    };
    if (queryEndDate) {
        // Extended Trip requesting...
        const conflictConditions = [
            {
                // Existing Extended Trips that overlap (Accepted or Processing)
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
        const conflictConditions = [
            // Active Quick Rides block immediately
            {
                status: "Processing",
                endDate: { $exists: false }
            },
            // Accepted Quick Rides also block immediately
            {
                status: "Accepted",
                tripType: "Instant",
                endDate: { $exists: false }
            }
        ];
        // Accepted or Processing Extended Trips that cover the Quick Ride time
        const now = new Date();
        conflictConditions.push({
            date: { $lte: now },
            endDate: { $gte: now },
            status: { $in: ["Accepted", "Processing"] }
        });
        conflictQuery.$or = conflictConditions;
    }
    const conflictingTrip = yield trip_model_1.default.findOne(conflictQuery);
    if (conflictingTrip) {
        return "Driver is already busy with another trip during this time.";
    }
    // Check for Vehicle Availability Conflict
    const vehicleId = trip.vehicleId;
    const vehicleConflictQuery = {
        vehicleId: vehicleId,
        status: { $nin: ["Completed", "Cancelled", "Rejected", "Pending"] }
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
        const conflictConditions = [
            // Active Quick Rides block immediately
            {
                status: "Processing",
                endDate: { $exists: false }
            }
        ];
        // Accepted or Processing Extended Trips that cover the Quick Ride time
        const now = new Date();
        conflictConditions.push({
            date: { $lte: now },
            endDate: { $gte: now },
            status: { $in: ["Accepted", "Processing"] }
        });
        vehicleConflictQuery.$or = conflictConditions;
    }
    const conflictingVehicleTrip = yield trip_model_1.default.findOne(vehicleConflictQuery);
    if (conflictingVehicleTrip) {
        return "Vehicle is already in use during this time.";
    }
    return null;
});
exports.validateTrip = validateTrip;
const updateTripStatus = (id, data, actingUserId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // Fetch trip first to handle Broadcast logic
    const tripToUpdate = yield trip_model_1.default.findById(id);
    if (tripToUpdate && tripToUpdate.isBroadcast && data.status === "Accepted") {
        if (!actingUserId) {
            throw new Error("User ID required to accept broadcast trip");
        }
        // Race Condition Check
        if (tripToUpdate.driverId) {
            throw new Error("Trip already accepted by another driver");
        }
        // Assign Driver
        tripToUpdate.driverId = actingUserId;
        tripToUpdate.isBroadcast = false;
        yield tripToUpdate.save();
    }
    const updatedTrip = yield trip_model_1.default.findByIdAndUpdate(id, { status: data.status }, { new: true })
        .populate("driverId")
        .populate("customerId")
        .populate("vehicleId")
        .lean();
    if (updatedTrip && updatedTrip.customerId) {
        const customer = updatedTrip.customerId;
        const customerEmail = customer.email;
        const customerName = customer.name;
        // Handle Trip Accepted (for Extended Trips or confirmed bookings)
        if ((data.status === "Accepted" || data.status === "Processing") && updatedTrip.driverId) {
            const driver = updatedTrip.driverId;
            const vehicle = updatedTrip.vehicleId;
            // --- AUTO-DECLINE OVERLAPPING QUICK RIDES ---
            // If this is an Instant trip, find other pending instant trips for this driver and "decline" them
            if (updatedTrip.tripType === "Instant") {
                const driverId = ((_a = driver._id) === null || _a === void 0 ? void 0 : _a.toString()) || driver.toString();
                // Find other pending instant trips for this same driver
                const collidingTrips = yield trip_model_1.default.find({
                    _id: { $ne: id },
                    driverId: driverId,
                    status: "Pending",
                    tripType: "Instant"
                });
                for (const collidingTrip of collidingTrips) {
                    console.log(`Auto-declining colliding trip ${collidingTrip._id} for driver ${driverId}`);
                    collidingTrip.status = "Rejected";
                    collidingTrip.rejectionReason = "Driver accepted another job";
                    if (!collidingTrip.rejectedDrivers)
                        collidingTrip.rejectedDrivers = [];
                    if (!collidingTrip.rejectedDrivers.includes(driverId)) {
                        collidingTrip.rejectedDrivers.push(driverId);
                    }
                    yield collidingTrip.save();
                    // Notify customer
                    if (collidingTrip.customerId) {
                        yield (0, notification_service_1.createNotification)(collidingTrip.customerId.toString(), "Driver Unavailable", `The driver has accepted another trip. Please click here to select a new driver for your trip from ${collidingTrip.startLocation}.`, "Warning", `/trips?reassign=${collidingTrip._id}`);
                    }
                }
            }
            // ----------------------------------------------
            if (driver && vehicle) {
                const html = (0, email_templates_1.tripAcceptedTemplate)(customerName, updatedTrip._id.toString(), driver.name, vehicle.brand, vehicle.model, vehicle.number || "Unknown", updatedTrip.startLocation, updatedTrip.endLocation, updatedTrip.date.toString(), updatedTrip.price || 0);
                yield (0, email_1.sendEmail)(customerEmail, "Trip Request Accepted! 🚗", "", html);
            }
        }
        // Handle Trip Processing (for active trips)
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
            const html = (0, email_templates_1.tripCompletedTemplate)(customerName, updatedTrip._id.toString(), price, updatedTrip.startLocation, updatedTrip.endLocation, updatedTrip.date.toString(), (_b = updatedTrip.distance) === null || _b === void 0 ? void 0 : _b.toString());
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
const updateTripLocation = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    return trip_model_1.default.findByIdAndUpdate(id, {
        currentLat: data.currentLat,
        currentLng: data.currentLng,
        currentProgress: data.currentProgress
    }, { new: true }).lean();
});
exports.updateTripLocation = updateTripLocation;
const checkAndReassignPendingTrips = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        console.log("Running Auto-Reassignment Job...");
        // 1. Find trips pending for more than 1 minute (Reduced for testing)
        // const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const fiveMinutesAgo = new Date(Date.now() - 1 * 60 * 1000);
        const pendingTrips = yield trip_model_1.default.find({
            status: "Pending",
            tripType: "Instant", // Only auto-reassign Quick Rides
            isBroadcast: { $ne: true }, // Only broadcast trips that are currently assigned to a specific driver
            updatedAt: { $lt: fiveMinutesAgo }
        }).populate("driverId");
        if (pendingTrips.length > 0) {
            console.log(`Found ${pendingTrips.length} pending trips to reassign.`);
        }
        for (const trip of pendingTrips) {
            console.log(`Processing Trip ${trip._id}: Current Driver ${(_a = trip.driverId) === null || _a === void 0 ? void 0 : _a._id}`);
            // 2. Blacklist current driver
            const currentDriverId = (_b = trip.driverId) === null || _b === void 0 ? void 0 : _b._id;
            if (currentDriverId) {
                if (!trip.rejectedDrivers)
                    trip.rejectedDrivers = [];
                // Avoid duplicates
                if (!trip.rejectedDrivers.includes(currentDriverId)) {
                    trip.rejectedDrivers.push(currentDriverId);
                }
            }
            // 3. Find candidates
            const nearbyDrivers = yield (0, user_service_1.getDriversNearby)(trip.startLat || 0, trip.startLng || 0, 10, trip.date, trip.endDate || undefined, ((_d = (_c = trip.customerId) === null || _c === void 0 ? void 0 : _c._id) === null || _d === void 0 ? void 0 : _d.toString()) || ((_e = trip.customerId) === null || _e === void 0 ? void 0 : _e.toString()));
            // 4. Filter out rejected/blacklisted drivers
            const candidates = nearbyDrivers.filter(d => {
                var _a;
                const dId = (_a = d._id) === null || _a === void 0 ? void 0 : _a.toString();
                // Check against blacklist
                const isBlacklisted = trip.rejectedDrivers.some(rd => rd.toString() === dId);
                const isCurrent = dId === (currentDriverId === null || currentDriverId === void 0 ? void 0 : currentDriverId.toString());
                return !isBlacklisted && !isCurrent;
            });
            if (candidates.length > 0) {
                // BROADCAST MODE: Market Place Logic
                // Instead of assigning to one, we open it up to ALL.
                console.log(`Broadcasting Trip ${trip._id} to ${candidates.length} drivers.`);
                // 5. Update Trip to Broadcast Mode
                trip.driverId = null; // Unassign current driver
                trip.isBroadcast = true; // Enable Marketplace
                trip.status = "Pending"; // Keep as Pending
                yield trip.save();
                // 6. Notify ALL Candidates
                for (const candidate of candidates) {
                    if (candidate._id) {
                        yield (0, notification_service_1.createNotification)(candidate._id.toString(), "New Trip Available (Marketplace)", `A trip is available nearby: ${trip.startLocation} to ${trip.endLocation}. First to accept gets it!`, "Info", `/trips/${trip._id}`);
                    }
                }
                // Notify Old Driver (that they missed it)
                if (currentDriverId) {
                    yield (0, notification_service_1.createNotification)(currentDriverId.toString(), "Trip Missed", `You did not accept the trip in time. It is now open to other drivers.`, "Warning", `/trips`);
                }
                // Notify Customer
                if (trip.customerId) {
                    yield (0, notification_service_1.createNotification)(trip.customerId.toString(), "Searching for Drivers...", `We have broadcasted your trip to ${candidates.length} drivers nearby.`, "Info", `/trips/${trip._id}`);
                }
            }
            else {
                console.log(`No available drivers found for Trip ${trip._id} to broadcast.`);
                // Notify Customer
                if (trip.customerId) {
                    yield (0, notification_service_1.createNotification)(trip.customerId.toString(), "No Drivers Found", `We could not find any available drivers right now. Please try again later.`, "Error", `/trips/${trip._id}`);
                }
            }
        }
    }
    catch (error) {
        console.error("Error in Auto-Reassignment Job:", error);
    }
});
exports.checkAndReassignPendingTrips = checkAndReassignPendingTrips;
