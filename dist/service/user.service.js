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
exports.toggleAvailability = exports.getDriversNearby = exports.getAllUsersByRole = exports.validateUser = exports.getUserByRole = exports.deleteUser = exports.updateUser = exports.getUserByEmail = exports.getUserById = exports.getAllUser = exports.registerUser = void 0;
const user_model_1 = __importDefault(require("../model/user.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const distanceUtils_1 = require("../utils/distanceUtils");
const registerUser = (user) => __awaiter(void 0, void 0, void 0, function* () {
    if (user.password) {
        user.password = bcryptjs_1.default.hashSync(user.password, 10);
    }
    console.log("register user function user profile image :", user.profileImage);
    return yield user_model_1.default.create(user);
});
exports.registerUser = registerUser;
const getAllUser = () => __awaiter(void 0, void 0, void 0, function* () {
    return user_model_1.default.find();
});
exports.getAllUser = getAllUser;
const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return user_model_1.default.findById(id);
});
exports.getUserById = getUserById;
const getUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    return user_model_1.default.findOne({ email });
});
exports.getUserByEmail = getUserByEmail;
const updateUser = (id, user) => __awaiter(void 0, void 0, void 0, function* () {
    if (user.password) {
        user.password = bcryptjs_1.default.hashSync(user.password, 10);
    }
    return user_model_1.default.findByIdAndUpdate(id, user, { new: true });
});
exports.updateUser = updateUser;
const deleteUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return user_model_1.default.findByIdAndDelete(id);
});
exports.deleteUser = deleteUser;
const getUserByRole = (role) => __awaiter(void 0, void 0, void 0, function* () {
    return user_model_1.default.find({ role });
});
exports.getUserByRole = getUserByRole;
const validateUser = (user) => __awaiter(void 0, void 0, void 0, function* () {
    if (!user.name || !user.email || !user.password || !user.role) {
        return "Please provide all required fields";
    }
    return null;
});
exports.validateUser = validateUser;
const getAllUsersByRole = (role) => __awaiter(void 0, void 0, void 0, function* () {
    return user_model_1.default.find({ role });
});
exports.getAllUsersByRole = getAllUsersByRole;
const getDriversNearby = (lat_1, lng_1, ...args_1) => __awaiter(void 0, [lat_1, lng_1, ...args_1], void 0, function* (lat, lng, radiusKm = 5, date, endDate) {
    // Get all drivers first (only available ones)
    const allDrivers = yield user_model_1.default.find({ role: "driver", isAvailable: { $ne: false } });
    // Filter by distance using Haversine formula
    let availableDrivers = (0, distanceUtils_1.filterByDistance)(allDrivers, lat, lng, radiusKm);
    // Filter by availability (Busy Check)
    if (availableDrivers.length > 0) {
        const Trip = (yield Promise.resolve().then(() => __importStar(require("../model/trip.model")))).default;
        const driverIds = availableDrivers.map(d => d._id);
        const queryDate = date ? new Date(date) : new Date();
        const queryEndDate = endDate ? new Date(endDate) : null;
        // Find conflicting trips
        const conflictQuery = {
            driverId: { $in: driverIds },
            status: { $nin: ["Completed", "Cancelled", "Rejected"] }
        };
        if (queryEndDate) {
            // Extended Trip Search: Check for overlap
            // Conflict if: (TripStart < ReqEnd) AND (TripEnd > ReqStart)  
            const conflictConditions = [
                {
                    // Existing trip overlaps with requested window
                    date: { $lt: queryEndDate },
                    endDate: { $gt: queryDate }
                }
            ];
            // Only check for active instant trips if the requested trip starts SOON (e.g. within 2 hours)
            // If the user is booking for next month, a current "Processing" trip doesn't matter.
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
            // Quick Ride Search (Now): Check if currently busy
            // Busy if: Status is Processing OR (Status is Pending/Accepted AND Time is overlapping "now")
            // Simplified: If status is Processing, they are busy.
            // If Scheduled trip covers "now", they are busy.
            conflictQuery.$or = [
                { status: "Processing" },
                {
                    date: { $lte: queryDate },
                    endDate: { $gte: queryDate }
                }
            ];
        }
        const busyTrips = yield Trip.find(conflictQuery).select("driverId");
        const busyDriverIds = new Set(busyTrips.map(t => { var _a; return (_a = t.driverId) === null || _a === void 0 ? void 0 : _a.toString(); }));
        availableDrivers = availableDrivers.filter(d => { var _a; return !busyDriverIds.has((_a = d._id) === null || _a === void 0 ? void 0 : _a.toString()); });
    }
    return availableDrivers;
});
exports.getDriversNearby = getDriversNearby;
const toggleAvailability = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findById(id);
    if (!user) {
        return null;
    }
    // Toggle availability (default to true if undefined)
    const newAvailability = user.isAvailable === false ? true : false;
    return user_model_1.default.findByIdAndUpdate(id, { isAvailable: newAvailability }, { new: true });
});
exports.toggleAvailability = toggleAvailability;
