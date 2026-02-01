"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const conversationSchema = new mongoose_1.default.Schema({
    participants: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }],
    participantRoles: [{
            userId: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            role: {
                type: String,
                enum: ['driver', 'customer', 'admin'],
                required: true
            }
        }],
    lastMessage: {
        type: String,
        default: ''
    },
    lastMessageTime: {
        type: Date,
        default: Date.now
    },
    unreadCount: {
        type: Map,
        of: Number,
        default: new Map()
    }
}, {
    timestamps: true
});
// Ensure conversations have at least one admin
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageTime: -1 });
const Conversation = mongoose_1.default.model('Conversation', conversationSchema);
exports.default = Conversation;
