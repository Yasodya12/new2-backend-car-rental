import express from 'express';
import * as chatController from '../controllers/chat.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get or create conversation with admin
router.post('/conversations', chatController.getOrCreateConversation);

// Get all conversations for current user
router.get('/conversations', chatController.getUserConversations);

// Get messages for a specific conversation
router.get('/conversations/:conversationId/messages', chatController.getConversationMessages);

// Mark messages as read
router.patch('/conversations/:conversationId/read', chatController.markMessagesAsRead);

// Admin: Get all conversations
router.get('/admin/conversations', chatController.getAdminConversations);

export default router;
