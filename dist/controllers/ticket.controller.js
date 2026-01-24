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
exports.getUserTickets = exports.getAllTickets = exports.resolveTicket = exports.createTicket = void 0;
const ticket_model_1 = __importDefault(require("../model/ticket.model"));
const notification_service_1 = require("../service/notification.service");
const createTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tripId, subject, description, priority } = req.body;
        const userId = req.user.id;
        const newTicket = new ticket_model_1.default({
            userId,
            tripId,
            subject,
            description,
            priority
        });
        yield newTicket.save();
        // Notify admins about new ticket
        const User = (yield Promise.resolve().then(() => __importStar(require('../model/user.model')))).default;
        const admins = yield User.find({ role: 'admin' });
        for (const admin of admins) {
            yield (0, notification_service_1.createNotification)(admin._id.toString(), 'New Support Ticket', `New support ticket: ${subject}`, 'Info', `/help-center`);
        }
        // Notify user about ticket creation
        yield (0, notification_service_1.createNotification)(userId, 'Ticket Submitted', `Your support ticket "${subject}" has been submitted successfully.`, 'Success', `/help-center`);
        res.status(201).json({ message: 'Ticket created successfully', ticket: newTicket });
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating ticket', error: error.message });
    }
});
exports.createTicket = createTicket;
const resolveTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { adminResponse, status } = req.body;
        const updatedTicket = yield ticket_model_1.default.findByIdAndUpdate(id, {
            adminResponse,
            status: status || 'Resolved',
            updatedAt: new Date()
        }, { new: true });
        if (!updatedTicket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }
        // Notify user about ticket update
        yield (0, notification_service_1.createNotification)(updatedTicket.userId.toString(), 'Ticket Updated', `Your support ticket has been ${status || 'resolved'}. ${adminResponse ? 'Admin response: ' + adminResponse : ''}`, 'Info', `/help-center`);
        res.status(200).json({ message: 'Ticket resolved successfully', ticket: updatedTicket });
    }
    catch (error) {
        res.status(500).json({ message: 'Error resolving ticket', error: error.message });
    }
});
exports.resolveTicket = resolveTicket;
const getAllTickets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tickets = yield ticket_model_1.default.find().populate('userId', 'name email').populate('tripId');
        res.status(200).json(tickets);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching tickets', error: error.message });
    }
});
exports.getAllTickets = getAllTickets;
const getUserTickets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const tickets = yield ticket_model_1.default.find({ userId }).populate('tripId');
        res.status(200).json(tickets);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching user tickets', error: error.message });
    }
});
exports.getUserTickets = getUserTickets;
