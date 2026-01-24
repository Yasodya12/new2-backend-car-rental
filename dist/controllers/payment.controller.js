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
exports.PaymentController = void 0;
const payment_model_1 = __importDefault(require("../model/payment.model"));
const trip_model_1 = __importDefault(require("../model/trip.model"));
const email_1 = require("../utils/email");
const email_templates_1 = require("../utils/email.templates");
const notification_service_1 = require("../service/notification.service");
class PaymentController {
    // 1. Generate Invoice (Auto or Manual)
    generateInvoice(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { tripId, amount, userId } = req.body;
                const existingPayment = yield payment_model_1.default.findOne({ tripId });
                if (existingPayment) {
                    return res.status(400).json({ message: "Invoice already exists for this trip" });
                }
                const payment = new payment_model_1.default({
                    tripId,
                    userId,
                    amount,
                    status: 'Pending',
                    method: 'Cash' // Default
                });
                const savedPayment = yield payment.save();
                const populatedPayment = yield payment_model_1.default.findById(savedPayment._id).populate('tripId');
                res.status(201).json(populatedPayment);
            }
            catch (error) {
                res.status(500).json({ message: "Error generating invoice", error });
            }
        });
    }
    // 2. Mark as Paid (Collection)
    markAsPaid(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { collectedBy, method } = req.body; // collectedBy is the Driver/Admin ID
                const payment = yield payment_model_1.default.findById(id)
                    .populate('userId', 'name email')
                    .populate('tripId');
                if (!payment) {
                    return res.status(404).json({ message: "Invoice not found" });
                }
                payment.status = 'Paid';
                payment.collectedBy = collectedBy;
                payment.collectedAt = new Date();
                if (method)
                    payment.method = method;
                const updatedPayment = yield payment.save();
                // Update Trip Status to 'Paid'
                const tripIdUpdate = payment.tripId && payment.tripId._id ? payment.tripId._id : payment.tripId;
                const tripIdStr = payment.tripId && payment.tripId._id ? payment.tripId._id : payment.tripId;
                yield trip_model_1.default.findByIdAndUpdate(tripIdUpdate, { status: 'Paid' });
                // Send Receipt Email
                if (payment.userId && payment.userId.email) {
                    const customerName = payment.userId.name;
                    // Handle tripId being either populated object or string ID
                    const amount = payment.amount;
                    const date = new Date().toLocaleString();
                    const subject = "Payment Receipt 🧾";
                    const html = (0, email_templates_1.paymentReceiptTemplate)(customerName, tripIdStr.toString(), amount, date, payment.method);
                    yield (0, email_1.sendEmail)(payment.userId.email, subject, "", html);
                    console.log(`Receipt email sent to ${payment.userId.email}`);
                }
                // Notify customer about payment confirmation
                if (payment.userId && payment.userId._id) {
                    yield (0, notification_service_1.createNotification)(payment.userId._id.toString(), "Payment Received", `Your payment of Rs. ${payment.amount} has been received successfully.`, "Success", `/trips/${tripIdStr}`);
                }
                // Notify driver/collector about payment collection
                if (collectedBy) {
                    yield (0, notification_service_1.createNotification)(collectedBy, "Payment Collected", `Payment of Rs. ${payment.amount} has been collected successfully.`, "Success", `/trips/${tripIdStr}`);
                }
                res.status(200).json(updatedPayment);
            }
            catch (error) {
                console.error("Error updating payment:", error);
                res.status(500).json({ message: "Error updating payment status", error });
            }
        });
    }
    // 3. Get Payment by Trip
    getPaymentByTrip(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { tripId } = req.params;
                // Populate tripId to get trip details (start/end location etc) for the invoice UI
                const payment = yield payment_model_1.default.findOne({ tripId })
                    .populate('collectedBy', 'name email')
                    .populate('tripId');
                res.status(200).json(payment);
            }
            catch (error) {
                res.status(500).json({ message: "Error fetching payment", error });
            }
        });
    }
    // 4. Get User Payment History
    getUserPayments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                const payments = yield payment_model_1.default.find({ userId }).populate('tripId').sort({ createdAt: -1 });
                res.status(200).json(payments);
            }
            catch (error) {
                res.status(500).json({ message: "Error fetching history", error });
            }
        });
    }
}
exports.PaymentController = PaymentController;
