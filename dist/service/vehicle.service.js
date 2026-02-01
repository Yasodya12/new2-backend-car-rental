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
exports.getVehiclesNearby = exports.validateVehicle = exports.updateVehicle = exports.deleteVehicle = exports.getVehicleById = exports.getAllVehicles = exports.saveVehicle = void 0;
const vehicle_model_1 = __importDefault(require("../model/vehicle.model"));
const distanceUtils_1 = require("../utils/distanceUtils");
const pricingUtils_1 = require("../utils/pricingUtils");
const saveVehicle = (vehicle) => __awaiter(void 0, void 0, void 0, function* () {
    // Automatically set pricePerKm based on category if not provided
    if (!vehicle.pricePerKm && vehicle.category) {
        vehicle.pricePerKm = (0, pricingUtils_1.getPricePerKm)(vehicle.category);
    }
    return vehicle_model_1.default.create(vehicle);
});
exports.saveVehicle = saveVehicle;
const getAllVehicles = () => __awaiter(void 0, void 0, void 0, function* () {
    return vehicle_model_1.default.find();
});
exports.getAllVehicles = getAllVehicles;
const getVehicleById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return vehicle_model_1.default.findById(id);
});
exports.getVehicleById = getVehicleById;
const deleteVehicle = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return vehicle_model_1.default.findByIdAndDelete(id);
});
exports.deleteVehicle = deleteVehicle;
const updateVehicle = (id, vehicle) => __awaiter(void 0, void 0, void 0, function* () {
    return vehicle_model_1.default.findByIdAndUpdate(id, vehicle, { new: true });
});
exports.updateVehicle = updateVehicle;
const validateVehicle = (vehicle) => __awaiter(void 0, void 0, void 0, function* () {
    if (!vehicle.brand || !vehicle.name || !vehicle.model || !vehicle.year ||
        !vehicle.color || !vehicle.seats || !vehicle.description || !vehicle.image ||
        !vehicle.category) {
        return "Please provide all required fields";
    }
    return null;
});
exports.validateVehicle = validateVehicle;
const getVehiclesNearby = (lat_1, lng_1, ...args_1) => __awaiter(void 0, [lat_1, lng_1, ...args_1], void 0, function* (lat, lng, radiusKm = 5, date, endDate) {
    // Get all vehicles first (only available ones)
    const allVehicles = yield vehicle_model_1.default.find({ isAvailable: { $ne: false } });
    // Filter by distance using Haversine formula
    let nearbyVehicles = (0, distanceUtils_1.filterByDistance)(allVehicles, lat, lng, radiusKm);
    // Filter by availability (Busy Check & Maintenance Check)
    if (nearbyVehicles.length > 0) {
        const Trip = (yield Promise.resolve().then(() => __importStar(require("../model/trip.model")))).default;
        const vehicleIds = nearbyVehicles.map(v => v._id);
        const queryDate = date ? new Date(date) : new Date();
        const queryEndDate = endDate ? new Date(endDate) : null;
        // 1. Check for Maintenance Conflicts
        // We filter out any vehicle where the requested trip overlaps with a maintenance period
        nearbyVehicles = nearbyVehicles.filter(v => {
            if (!v.maintenance || v.maintenance.length === 0)
                return true;
            // Check if any maintenance period overlaps with the requested trip dates
            const hasMaintenanceConflict = v.maintenance.some(m => {
                const maintenanceStart = new Date(m.startDate);
                const maintenanceEnd = new Date(m.endDate);
                if (queryEndDate) {
                    // Extended Trip: Check for date range overlap
                    // (StartA <= EndB) and (EndA >= StartB)
                    return (queryDate <= maintenanceEnd && queryEndDate >= maintenanceStart);
                }
                else {
                    // Quick Ride (Instant): Check if current time falls within maintenance
                    // Just check if queryDate (now) is inside the maintenance window
                    return (queryDate >= maintenanceStart && queryDate <= maintenanceEnd);
                }
            });
            return !hasMaintenanceConflict; // Keep vehicle if NO conflict
        });
        // Re-calculate vehicle IDs after maintenance filtering
        const availableVehicleIdsAfterMaintenance = nearbyVehicles.map(v => v._id);
        if (availableVehicleIdsAfterMaintenance.length === 0) {
            return [];
        }
        // 2. Check for Trip Conflicts (Existing Logic)
        const conflictQuery = {
            vehicleId: { $in: availableVehicleIdsAfterMaintenance },
            status: { $nin: ["Completed", "Cancelled", "Rejected"] }
        };
        if (queryEndDate) {
            // Extended Trip Search: Check for overlap
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
            // Quick Ride Search (Now)
            conflictQuery.$or = [
                { status: "Processing" },
                {
                    date: { $lte: queryDate },
                    endDate: { $gte: queryDate }
                }
            ];
        }
        const busyTrips = yield Trip.find(conflictQuery).select("vehicleId");
        const busyVehicleIds = new Set(busyTrips.map(t => { var _a; return (_a = t.vehicleId) === null || _a === void 0 ? void 0 : _a.toString(); }));
        nearbyVehicles = nearbyVehicles.filter(v => { var _a; return !busyVehicleIds.has((_a = v._id) === null || _a === void 0 ? void 0 : _a.toString()); });
    }
    return nearbyVehicles;
});
exports.getVehiclesNearby = getVehiclesNearby;
