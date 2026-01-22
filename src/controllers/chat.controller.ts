import { Request, Response } from 'express';
import { AuthRequest } from '../types/common.types';
import Conversation from '../model/conversation.model';
import Message from '../model/message.model';
import User from '../model/user.model';

// Get or create conversation between user and admin
export const getOrCreateConversation = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.user?.id;
        const userRole = req.user?.role;

        if (!id || !userRole) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        // Find any admin user
        const admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            res.status(404).json({ message: 'No admin available' });
            return;
        }

        // Check if conversation already exists
        let conversation = await Conversation.findOne({
            participants: { $all: [id, admin._id] }
        }).populate('participants', 'name email role profileImage');

        if (!conversation) {
            // Create new conversation
            conversation = await Conversation.create({
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

            conversation = await conversation.populate('participants', 'name email role profileImage');
        }

        res.status(200).json(conversation);
    } catch (error) {
        console.error('Error in getOrCreateConversation:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all conversations for current user
export const getUserConversations = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.user?.id;

        if (!id) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const conversations = await Conversation.find({
            participants: id
        })
            .populate('participants', 'name email role profileImage')
            .sort({ lastMessageTime: -1 });

        res.status(200).json(conversations);
    } catch (error) {
        console.error('Error in getUserConversations:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get messages for a conversation
export const getConversationMessages = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.user?.id;
        const { conversationId } = req.params;
        const limit = parseInt(req.query.limit as string) || 50;
        const skip = parseInt(req.query.skip as string) || 0;

        if (!id) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        // Verify user is part of conversation
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: id
        });

        if (!conversation) {
            res.status(404).json({ message: 'Conversation not found' });
            return;
        }

        const messages = await Message.find({ conversationId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip)
            .populate('senderId', 'name role profileImage');

        res.status(200).json(messages.reverse());
    } catch (error) {
        console.error('Error in getConversationMessages:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Mark messages as read
export const markMessagesAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.user?.id;
        const { conversationId } = req.params;

        if (!id) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        // Verify user is part of conversation
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: id
        });

        if (!conversation) {
            res.status(404).json({ message: 'Conversation not found' });
            return;
        }

        // Mark all unread messages from other participants as read
        await Message.updateMany(
            {
                conversationId,
                senderId: { $ne: id },
                isRead: false
            },
            { isRead: true }
        );

        // Reset unread count for this user
        conversation.unreadCount.set(id.toString(), 0);
        await conversation.save();

        res.status(200).json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error('Error in markMessagesAsRead:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all conversations for admin
export const getAdminConversations = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.user?.id;
        const userRole = req.user?.role;

        if (!id || userRole !== 'admin') {
            res.status(403).json({ message: 'Admin access required' });
            return;
        }

        const conversations = await Conversation.find({
            participants: id
        })
            .populate('participants', 'name email role profileImage')
            .sort({ lastMessageTime: -1 });

        res.status(200).json(conversations);
    } catch (error) {
        console.error('Error in getAdminConversations:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
