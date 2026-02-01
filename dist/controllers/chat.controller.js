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
exports.getAdminConversations = exports.markMessagesAsRead = exports.getConversationMessages = exports.getUserConversations = exports.getOrCreateConversation = void 0;
const conversation_model_1 = __importDefault(require("../model/conversation.model"));
const message_model_1 = __importDefault(require("../model/message.model"));
const user_model_1 = __importDefault(require("../model/user.model"));
// Get or create conversation between user and admin
const getOrCreateConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        if (!id || !userRole) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        // Find any admin user
        const admin = yield user_model_1.default.findOne({ role: 'admin' });
        if (!admin) {
            res.status(404).json({ message: 'No admin available' });
            return;
        }
        // Check if conversation already exists
        let conversation = yield conversation_model_1.default.findOne({
            participants: { $all: [id, admin._id] }
        }).populate('participants', 'name email role profileImage');
        if (!conversation) {
            // Create new conversation
            conversation = yield conversation_model_1.default.create({
                participants: [id, admin._id],
                participantRoles: [
                    { userId: id, role: userRole },
                    { userId: admin._id, role: 'admin' }
                ],
                unreadCount: new Map([
                    [id.toString(), 0],
                    [admin._id.toString(), 0]
                ])
            });
            conversation = yield conversation.populate('participants', 'name email role profileImage');
        }
        res.status(200).json(conversation);
    }
    catch (error) {
        console.error('Error in getOrCreateConversation:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getOrCreateConversation = getOrCreateConversation;
// Get all conversations for current user
const getUserConversations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!id) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const conversations = yield conversation_model_1.default.find({
            participants: id
        })
            .populate('participants', 'name email role profileImage')
            .sort({ lastMessageTime: -1 });
        res.status(200).json(conversations);
    }
    catch (error) {
        console.error('Error in getUserConversations:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getUserConversations = getUserConversations;
// Get messages for a conversation
const getConversationMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { conversationId } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        const skip = parseInt(req.query.skip) || 0;
        if (!id) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        // Verify user is part of conversation
        const conversation = yield conversation_model_1.default.findOne({
            _id: conversationId,
            participants: id
        });
        if (!conversation) {
            res.status(404).json({ message: 'Conversation not found' });
            return;
        }
        const messages = yield message_model_1.default.find({ conversationId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip)
            .populate('senderId', 'name role profileImage');
        res.status(200).json(messages.reverse());
    }
    catch (error) {
        console.error('Error in getConversationMessages:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getConversationMessages = getConversationMessages;
// Mark messages as read
const markMessagesAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { conversationId } = req.params;
        if (!id) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        // Verify user is part of conversation
        const conversation = yield conversation_model_1.default.findOne({
            _id: conversationId,
            participants: id
        });
        if (!conversation) {
            res.status(404).json({ message: 'Conversation not found' });
            return;
        }
        // Mark all unread messages from other participants as read
        yield message_model_1.default.updateMany({
            conversationId,
            senderId: { $ne: id },
            isRead: false
        }, { isRead: true });
        // Reset unread count for this user
        conversation.unreadCount.set(id.toString(), 0);
        yield conversation.save();
        res.status(200).json({ message: 'Messages marked as read' });
    }
    catch (error) {
        console.error('Error in markMessagesAsRead:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.markMessagesAsRead = markMessagesAsRead;
// Get all conversations for admin
const getAdminConversations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        if (!id || userRole !== 'admin') {
            res.status(403).json({ message: 'Admin access required' });
            return;
        }
        const conversations = yield conversation_model_1.default.find({
            participants: id
        })
            .populate('participants', 'name email role profileImage')
            .sort({ lastMessageTime: -1 });
        res.status(200).json(conversations);
    }
    catch (error) {
        console.error('Error in getAdminConversations:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getAdminConversations = getAdminConversations;
