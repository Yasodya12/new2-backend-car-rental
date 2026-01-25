import app from "./app";
import dotenv from "dotenv";
import { DBConnection } from "./db/DBConnection";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Message from "./model/message.model";
import Conversation from "./model/conversation.model";
import { checkAndReassignPendingTrips } from "./service/trip.services";

dotenv.config();

const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET as string;

const server = http.createServer(app);

const io = new SocketIOServer(server, {
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
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        socket.data.userId = decoded.userId || decoded.id;
        socket.data.role = decoded.role;
        next();
    } catch (err) {
        next(new Error("Authentication error: Invalid token"));
    }
});

io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id, "User:", socket.data.userId);

    // Join user to their conversation rooms
    socket.on("chat:join", async (conversationId: string) => {
        try {
            // Verify user is part of this conversation
            const conversation = await Conversation.findOne({
                _id: conversationId,
                participants: socket.data.userId
            });

            if (conversation) {
                socket.join(`conversation:${conversationId}`);
                console.log(`User ${socket.data.userId} joined conversation ${conversationId}`);
            }
        } catch (error) {
            console.error("Error joining conversation:", error);
        }
    });

    // Handle new messages
    socket.on("chat:message", async (data: {
        conversationId: string;
        content: string;
    }) => {
        try {
            const { conversationId, content } = data;

            // Verify user is part of conversation
            const conversation = await Conversation.findOne({
                _id: conversationId,
                participants: socket.data.userId
            });

            if (!conversation) {
                socket.emit("chat:error", { message: "Conversation not found" });
                return;
            }

            // Create message
            const message = await Message.create({
                conversationId,
                senderId: socket.data.userId,
                senderRole: socket.data.role,
                content,
                isRead: false
            });

            // Populate sender info
            await message.populate('senderId', 'name role profileImage');

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

            await conversation.save();

            // Emit to all participants in the conversation
            io.to(`conversation:${conversationId}`).emit("chat:message:new", {
                message,
                conversationId
            });

            console.log(`Message sent in conversation ${conversationId}`);
        } catch (error) {
            console.error("Error sending message:", error);
            socket.emit("chat:error", { message: "Failed to send message" });
        }
    });

    // Handle typing indicator
    socket.on("chat:typing", (data: {
        conversationId: string;
        isTyping: boolean;
    }) => {
        const { conversationId, isTyping } = data;

        // Broadcast to other users in conversation
        socket.to(`conversation:${conversationId}`).emit("chat:typing", {
            conversationId,
            userId: socket.data.userId,
            isTyping
        });
    });

    // Handle message read
    socket.on("chat:message:read", async (data: {
        conversationId: string;
    }) => {
        try {
            const { conversationId } = data;

            // Mark messages as read
            await Message.updateMany(
                {
                    conversationId,
                    senderId: { $ne: socket.data.userId },
                    isRead: false
                },
                { isRead: true }
            );

            // Update conversation unread count
            const conversation = await Conversation.findById(conversationId);
            if (conversation) {
                conversation.unreadCount.set(socket.data.userId, 0);
                await conversation.save();

                // Notify other participants
                socket.to(`conversation:${conversationId}`).emit("chat:message:read", {
                    conversationId,
                    userId: socket.data.userId
                });
            }
        } catch (error) {
            console.error("Error marking messages as read:", error);
        }
    });

    socket.on("disconnect", () => {
        console.log("❌ Socket disconnected:", socket.id);
    });
});

async function start() {
    try {
        const result = await DBConnection();
        console.log(result);

        const db = mongoose.connection.db!;

        console.log("Connected to MongoDB DB:", db.databaseName);

        const pipeline = [
            {
                $match: {
                    operationType: { $in: ["insert", "update", "replace", "delete"] },
                },
            },
        ];

        const changeStream = db.watch(pipeline, { fullDocument: "updateLookup" });

        changeStream.on("change", (change: any) => {
            if (!change.ns || !change.documentKey) return;

            const coll = change.ns.coll;
            const id = change.documentKey._id?.toString?.();

            console.log(` Change in ${coll}:`, change.operationType, id);
            io.emit(`mongo-change:${coll}`, change);
        });

        // Start Auto-Reassignment Job (runs every 1 minute)
        setInterval(() => {
            checkAndReassignPendingTrips();
        }, 60 * 1000);

        server.listen(port, () => {
            console.log(`Server is running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error(" Failed to start server:", err);
        process.exit(1);
    }
}

start();
