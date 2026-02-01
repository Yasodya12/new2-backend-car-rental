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
exports.reassignTrip = exports.rejectTrip = exports.updateTripLocation = exports.getTripsByDriverId = exports.deleteTrip = exports.updateTrip = exports.saveTrip = exports.getTripById = exports.getAllTrips = exports.updateTripStatus = void 0;
const tripService = __importStar(require("../service/trip.services"));
const trip_services_1 = require("../service/trip.services");
const payment_model_1 = __importDefault(require("../model/payment.model"));
const promotion_model_1 = __importDefault(require("../model/promotion.model"));
const notification_service_1 = require("../service/notification.service");
const updateTripStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const { status } = req.body;
        if (!status) {
            return res.status(400).send({ error: "Status is required" });
        }
        const updatedTrip = yield (0, trip_services_1.updateTripStatus)(id, { status });
        if (!updatedTrip) {
            return res.status(404).send({ error: "Trip not found" });
        }
        // Helper to get ID string whether populated or not
        const customerIdStr = updatedTrip.customerId && updatedTrip.customerId._id
            ? updatedTrip.customerId._id.toString()
            : (updatedTrip.customerId ? updatedTrip.customerId.toString() : null);
        const driverIdStr = updatedTrip.driverId && updatedTrip.driverId._id
            ? updatedTrip.driverId._id.toString()
            : (updatedTrip.driverId ? updatedTrip.driverId.toString() : null);
        // Auto-generate Invoice if Trip is Completed
        if (status === "Completed") {
            const existingPayment = yield payment_model_1.default.findOne({ tripId: id });
            if (!existingPayment && updatedTrip.price && updatedTrip.userId) {
                yield payment_model_1.default.create({
                    tripId: id,
                    userId: updatedTrip.userId, // Assuming trip has reference to the customer
                    amount: updatedTrip.price,
                    status: 'Pending',
                    method: 'Cash'
                });
                console.log(`Auto-generated invoice for Trip ${id}`);
                // Notify customer about invoice generation
                if (customerIdStr) {
                    yield (0, notification_service_1.createNotification)(customerIdStr, "Invoice Generated", `Your trip from ${updatedTrip.startLocation} to ${updatedTrip.endLocation} has been completed. Invoice amount: Rs. ${updatedTrip.price}`, "Info", `/trips/${id}`);
                }
                // Notify driver about payment
                if (driverIdStr) {
                    yield (0, notification_service_1.createNotification)(driverIdStr, "Trip Completed", `Trip from ${updatedTrip.startLocation} to ${updatedTrip.endLocation} completed. Payment: Rs. ${updatedTrip.price}`, "Success", `/trips/${id}`);
                }
            }
        }
        // Notify on status changes
        if (status === "Accepted" && customerIdStr) {
            yield (0, notification_service_1.createNotification)(customerIdStr, "Trip Accepted", `Your trip has been accepted and confirmed!`, "Success", `/trips/${id}`);
        }
        if (status === "Processing" && customerIdStr) {
            yield (0, notification_service_1.createNotification)(customerIdStr, "Trip Started", `Your trip from ${updatedTrip.startLocation} to ${updatedTrip.endLocation} has started!`, "Info", `/trips/${id}`);
        }
        if (status === "Cancelled") {
            // Notify customer
            if (customerIdStr) {
                yield (0, notification_service_1.createNotification)(customerIdStr, "Trip Cancelled", `Your trip from ${updatedTrip.startLocation} to ${updatedTrip.endLocation} has been cancelled.`, "Warning", `/trips?rebook=${id}`);
            }
            // Notify driver
            if (driverIdStr) {
                yield (0, notification_service_1.createNotification)(driverIdStr, "Trip Cancelled", `Trip from ${updatedTrip.startLocation} to ${updatedTrip.endLocation} has been cancelled.`, "Warning", `/trips?rebook=${id}`);
            }
        }
        return res.status(200).send(updatedTrip);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.updateTripStatus = updateTripStatus;
const getAllTrips = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        let filter = {};
        if (user && user.role === "driver") {
            filter = { driverId: user.id };
        }
        else if (user && user.role === "customer") {
            filter = { customerId: user.id };
        }
        // Admins see all trips (empty filter)
        const trips = yield tripService.getAllTrips(filter);
        return res.status(200).send(trips);
    }
    catch (error) {
        return res.status(500).send({ error: error.message });
    }
});
exports.getAllTrips = getAllTrips;
const getTripById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const trip = yield tripService.getTripById(id);
        if (!trip) {
            return res.status(404).send({ error: "Trip not found" });
        }
        return res.status(200).send(trip);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.getTripById = getTripById;
const saveTrip = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const trip = req.body;
        const validationError = yield tripService.validateTrip(trip);
        if (validationError) {
            return res.status(400).send({ error: validationError });
        }
        const savedTrip = yield tripService.saveTrip(trip);
        // If promo code was used, increment usedCount and re-validate for safety
        if (trip.promoCode) {
            const promo = yield promotion_model_1.default.findOne({ code: trip.promoCode.toUpperCase(), isActive: true });
            if (promo) {
                // Verify discount is not manipulated (basic check)
                let expectedDiscount = 0;
                const tripAmount = trip.price + trip.discountAmount; // Original price
                if (promo.discountType === 'Percentage') {
                    expectedDiscount = (tripAmount * promo.value) / 100;
                    if (promo.maxDiscount > 0 && expectedDiscount > promo.maxDiscount) {
                        expectedDiscount = promo.maxDiscount;
                    }
                }
                else {
                    expectedDiscount = promo.value;
                }
                if (Math.abs(expectedDiscount - trip.discountAmount) > 1) {
                    console.warn(`Potential price manipulation detected for promo ${trip.promoCode}. Expected ${expectedDiscount}, got ${trip.discountAmount}`);
                    // Force the correct discount for safety
                    trip.discountAmount = expectedDiscount;
                    trip.price = tripAmount - expectedDiscount;
                }
                yield promotion_model_1.default.findOneAndUpdate({ code: trip.promoCode.toUpperCase() }, { $inc: { usedCount: 1 } });
            }
        }
        // Notify customer about trip creation
        if (trip.customerId) {
            yield (0, notification_service_1.createNotification)(trip.customerId, "Trip Created", `Your trip from ${trip.startLocation} to ${trip.endLocation} has been created successfully.`, "Success", `/trips/${savedTrip._id}`);
        }
        // Notify driver about trip assignment
        if (trip.driverId) {
            yield (0, notification_service_1.createNotification)(trip.driverId, "New Trip Assigned", `You have been assigned a trip from ${trip.startLocation} to ${trip.endLocation}.`, "Info", `/trips/${savedTrip._id}`);
        }
        return res.status(201).send(savedTrip);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.saveTrip = saveTrip;
const updateTrip = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const trip = req.body;
        const validationError = yield tripService.validateTrip(trip);
        if (validationError) {
            return res.status(400).send({ error: validationError });
        }
        const updatedTrip = yield tripService.updateTrip(id, trip);
        if (!updatedTrip) {
            return res.status(404).send({ error: "Trip not found" });
        }
        return res.status(200).send(updatedTrip);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.updateTrip = updateTrip;
const deleteTrip = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const deletedTrip = yield tripService.deleteTrip(id);
        if (!deletedTrip) {
            return res.status(404).send({ error: "Trip not found" });
        }
        return res.status(200).send(deletedTrip);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.deleteTrip = deleteTrip;
const getTripsByDriverId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const driverId = req.params.driverId;
        console.log("Controller get trips by driverId", driverId);
        const trips = yield tripService.getTripsByDriverId(driverId);
        return res.status(200).send(trips);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.getTripsByDriverId = getTripsByDriverId;
const updateTripLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const { currentLat, currentLng, currentProgress } = req.body;
        const updatedTrip = yield tripService.updateTripLocation(id, {
            currentLat,
            currentLng,
            currentProgress
        });
        if (!updatedTrip) {
            return res.status(404).send({ error: "Trip not found" });
        }
        return res.status(200).send(updatedTrip);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.updateTripLocation = updateTripLocation;
const rejectTrip = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    try {
        const tripId = req.params.id;
        const driverId = req.user.id;
        const { reason } = req.body;
        const trip = yield tripService.getTripById(tripId);
        if (!trip) {
            return res.status(404).send({ error: "Trip not found" });
        }
        // Verify the driver is assigned to this trip
        const assignedDriverId = ((_b = (_a = trip.driverId) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString()) || ((_c = trip.driverId) === null || _c === void 0 ? void 0 : _c.toString());
        if (assignedDriverId !== driverId) {
            return res.status(403).send({ error: "You are not assigned to this trip" });
        }
        // Update trip status to Rejected
        trip.status = "Rejected";
        trip.rejectionReason = reason || "No reason provided";
        // Add driver to rejectedDrivers array if not already there
        if (!trip.rejectedDrivers) {
            trip.rejectedDrivers = [];
        }
        if (!trip.rejectedDrivers.includes(driverId)) {
            trip.rejectedDrivers.push(driverId);
        }
        yield trip.save();
        // Notify customer about rejection
        const customerIdStr = ((_e = (_d = trip.customerId) === null || _d === void 0 ? void 0 : _d._id) === null || _e === void 0 ? void 0 : _e.toString()) || ((_f = trip.customerId) === null || _f === void 0 ? void 0 : _f.toString());
        if (customerIdStr) {
            yield (0, notification_service_1.createNotification)(customerIdStr, "Trip Rejected by Driver", `Your trip from ${trip.startLocation} to ${trip.endLocation} was rejected. Click to select a new driver or cancel.`, "Warning", `/trips?reassign=${tripId}`);
        }
        return res.status(200).send({ message: "Trip rejected successfully", trip });
    }
    catch (error) {
        return res.status(500).send({ error: error.message });
    }
});
exports.rejectTrip = rejectTrip;
const reassignTrip = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const tripId = req.params.id;
        const { newDriverId } = req.body;
        const userId = req.user.id;
        if (!newDriverId) {
            return res.status(400).send({ error: "New driver ID is required" });
        }
        const trip = yield tripService.getTripById(tripId);
        if (!trip) {
            return res.status(404).send({ error: "Trip not found" });
        }
        // Verify the user is the customer or admin
        const customerIdStr = ((_b = (_a = trip.customerId) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString()) || ((_c = trip.customerId) === null || _c === void 0 ? void 0 : _c.toString());
        const userRole = req.user.role;
        if (customerIdStr !== userId && userRole !== 'admin') {
            return res.status(403).send({ error: "Not authorized to reassign this trip" });
        }
        // Check if new driver hasn't already rejected this trip
        if (trip.rejectedDrivers && trip.rejectedDrivers.includes(newDriverId)) {
            return res.status(400).send({ error: "This driver has already rejected this trip" });
        }
        // Reassign trip to new driver
        trip.driverId = newDriverId;
        trip.status = "Pending";
        trip.rejectionReason = undefined;
        yield trip.save();
        // Notify new driver
        yield (0, notification_service_1.createNotification)(newDriverId, "New Trip Assigned", `You have been assigned a trip from ${trip.startLocation} to ${trip.endLocation}.`, "Info", `/trips/${tripId}`);
        // Notify customer
        if (customerIdStr) {
            yield (0, notification_service_1.createNotification)(customerIdStr, "Trip Reassigned", `Your trip has been reassigned to a new driver.`, "Success", `/trips/${tripId}`);
        }
        return res.status(200).send({ message: "Trip reassigned successfully", trip });
    }
    catch (error) {
        return res.status(500).send({ error: error.message });
    }
});
exports.reassignTrip = reassignTrip;
