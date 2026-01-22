"use strict";
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
exports.validateBooking = exports.updateBooking = exports.deleteBooking = exports.getBookingById = exports.saveBooking = exports.getBookingsByCustomerId = exports.getAllBookings = void 0;
const booking_model_1 = __importDefault(require("../model/booking.model"));
const getAllBookings = () => __awaiter(void 0, void 0, void 0, function* () {
    const bookings = yield booking_model_1.default.find()
        .populate("customerId", "name email")
        .populate({
        path: "tripId",
        populate: [
            { path: "driverId", select: "_id name email" },
            { path: "vehicleId", select: "_id brand model name" }
        ]
    })
        .lean();
    return bookings;
});
exports.getAllBookings = getAllBookings;
const getBookingsByCustomerId = (customerId) => __awaiter(void 0, void 0, void 0, function* () {
    const bookings = yield booking_model_1.default.find({ customerId })
        .populate("customerId", "name email")
        .populate({
        path: "tripId",
        populate: [
            { path: "driverId", select: "_id name email" },
            { path: "vehicleId", select: "_id brand model name" }
        ]
    })
        .lean();
    return bookings;
});
exports.getBookingsByCustomerId = getBookingsByCustomerId;
const saveBooking = (booking) => __awaiter(void 0, void 0, void 0, function* () {
    return booking_model_1.default.create(booking);
});
exports.saveBooking = saveBooking;
const getBookingById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return booking_model_1.default.findById(id);
});
exports.getBookingById = getBookingById;
const deleteBooking = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return booking_model_1.default.findByIdAndDelete(id);
});
exports.deleteBooking = deleteBooking;
const updateBooking = (id, booking) => __awaiter(void 0, void 0, void 0, function* () {
    return booking_model_1.default.findByIdAndUpdate(id, booking, { new: true });
});
exports.updateBooking = updateBooking;
const validateBooking = (booking) => __awaiter(void 0, void 0, void 0, function* () {
    if (!booking.customerId || !booking.tripId) {
        return "Please provide all required fields";
    }
    return null;
});
exports.validateBooking = validateBooking;
