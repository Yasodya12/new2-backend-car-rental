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
exports.deleteBooking = exports.updateBooking = exports.saveBooking = exports.getBookingsByCustomerId = exports.getBookingById = exports.getAllBookings = void 0;
const bookingService = __importStar(require("../service/booking.service"));
const mongoose_1 = __importDefault(require("mongoose"));
const getAllBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookings = yield bookingService.getAllBookings();
        return res.status(200).send(bookings);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.getAllBookings = getAllBookings;
const getBookingById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const booking = yield bookingService.getBookingById(id);
        if (!booking) {
            return res.status(404).send({ error: "Booking not found" });
        }
        return res.status(200).send(booking);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.getBookingById = getBookingById;
const getBookingsByCustomerId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customerId = req.params.customerId;
        const bookings = yield bookingService.getBookingsByCustomerId(customerId);
        return res.status(200).send(bookings);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.getBookingsByCustomerId = getBookingsByCustomerId;
const saveBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const booking = Object.assign(Object.assign({}, req.body), { customerId: new mongoose_1.default.Types.ObjectId(req.body.customerId), tripId: new mongoose_1.default.Types.ObjectId(req.body.tripId) });
        const validationError = yield bookingService.validateBooking(booking);
        if (validationError) {
            return res.status(400).send({ error: validationError });
        }
        const savedBooking = yield bookingService.saveBooking(booking);
        return res.status(201).send(savedBooking);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.saveBooking = saveBooking;
const updateBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const booking = req.body;
        const validationError = yield bookingService.validateBooking(booking);
        if (validationError) {
            return res.status(400).send({ error: validationError });
        }
        const updatedBooking = yield bookingService.updateBooking(id, booking);
        if (!updatedBooking) {
            return res.status(404).send({ error: "Booking not found" });
        }
        return res.status(200).send(updatedBooking);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.updateBooking = updateBooking;
const deleteBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const deletedBooking = yield bookingService.deleteBooking(id);
        if (!deletedBooking) {
            return res.status(404).send({ error: "Booking not found" });
        }
        return res.status(200).send(deletedBooking);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
exports.deleteBooking = deleteBooking;
