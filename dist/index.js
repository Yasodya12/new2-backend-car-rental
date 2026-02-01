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
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
const DBConnection_1 = require("./db/DBConnection");
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const message_model_1 = __importDefault(require("./model/message.model"));
const conversation_model_1 = __importDefault(require("./model/conversation.model"));
dotenv_1.default.config();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const server = http_1.default.createServer(app_1.default);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:3000"],
        credentials: true,
    },
});
// Socket authentication middleware
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error("Authentication error: No token provided"));
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        socket.data.userId = decoded.userId || decoded.id;
        socket.data.role = decoded.role;
        next();
    }
    catch (err) {
        next(new Error("Authentication error: Invalid token"));
    }
});
io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id, "User:", socket.data.userId);
    // Join user to their conversation rooms
    socket.on("chat:join", (conversationId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Verify user is part of this conversation
            const conversation = yield conversation_model_1.default.findOne({
                _id: conversationId,
                participants: socket.data.userId
            });
            if (conversation) {
                socket.join(`conversation:${conversationId}`);
                console.log(`User ${socket.data.userId} joined conversation ${conversationId}`);
            }
        }
        catch (error) {
            console.error("Error joining conversation:", error);
        }
    }));
    // Handle new messages
    socket.on("chat:message", (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { conversationId, content } = data;
            // Verify user is part of conversation
            const conversation = yield conversation_model_1.default.findOne({
                _id: conversationId,
                participants: socket.data.userId
            });
            if (!conversation) {
                socket.emit("chat:error", { message: "Conversation not found" });
                return;
            }
            // Create message
            const message = yield message_model_1.default.create({
                conversationId,
                senderId: socket.data.userId,
                senderRole: socket.data.role,
                content,
                isRead: false
            });
            // Populate sender info
            yield message.populate('senderId', 'name role profileImage');
            // Update conversation
            conversation.lastMessage = content;
            conversation.lastMessageTime = new Date();
            // Increment unread count for other participants
            conversation.participants.forEach((participantId) => {
                const participantIdStr = participantId.toString();
                if (participantIdStr !== socket.data.userId) {
                    const currentCount = conversation.unreadCount.get(participantIdStr) || 0;
                    conversation.unreadCount.set(participantIdStr, currentCount + 1);
                }
            });
            yield conversation.save();
            // Emit to all participants in the conversation
            io.to(`conversation:${conversationId}`).emit("chat:message:new", {
                message,
                conversationId
            });
            console.log(`Message sent in conversation ${conversationId}`);
        }
        catch (error) {
            console.error("Error sending message:", error);
            socket.emit("chat:error", { message: "Failed to send message" });
        }
    }));
    // Handle typing indicator
    socket.on("chat:typing", (data) => {
        const { conversationId, isTyping } = data;
        // Broadcast to other users in conversation
        socket.to(`conversation:${conversationId}`).emit("chat:typing", {
            conversationId,
            userId: socket.data.userId,
            isTyping
        });
    });
    // Handle message read
    socket.on("chat:message:read", (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { conversationId } = data;
            // Mark messages as read
            yield message_model_1.default.updateMany({
                conversationId,
                senderId: { $ne: socket.data.userId },
                isRead: false
            }, { isRead: true });
            // Update conversation unread count
            const conversation = yield conversation_model_1.default.findById(conversationId);
            if (conversation) {
                conversation.unreadCount.set(socket.data.userId, 0);
                yield conversation.save();
                // Notify other participants
                socket.to(`conversation:${conversationId}`).emit("chat:message:read", {
                    conversationId,
                    userId: socket.data.userId
                });
            }
        }
        catch (error) {
            console.error("Error marking messages as read:", error);
        }
    }));
    socket.on("disconnect", () => {
        console.log("❌ Socket disconnected:", socket.id);
    });
});
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, DBConnection_1.DBConnection)();
            console.log(result);
            const db = mongoose_1.default.connection.db;
            console.log("Connected to MongoDB DB:", db.databaseName);
            const pipeline = [
                {
                    $match: {
                        operationType: { $in: ["insert", "update", "replace", "delete"] },
                    },
                },
            ];
            const changeStream = db.watch(pipeline, { fullDocument: "updateLookup" });
            changeStream.on("change", (change) => {
                var _a, _b;
                if (!change.ns || !change.documentKey)
                    return;
                const coll = change.ns.coll;
                const id = (_b = (_a = change.documentKey._id) === null || _a === void 0 ? void 0 : _a.toString) === null || _b === void 0 ? void 0 : _b.call(_a);
                console.log(` Change in ${coll}:`, change.operationType, id);
                io.emit(`mongo-change:${coll}`, change);
            });
            server.listen(port, () => {
                console.log(`Server is running at http://localhost:${port}`);
            });
        }
        catch (err) {
            console.error(" Failed to start server:", err);
            process.exit(1);
        }
    });
}
start();
