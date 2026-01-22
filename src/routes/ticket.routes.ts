import express from 'express';
import { createTicket, resolveTicket, getAllTickets, getUserTickets } from '../controllers/ticket.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// User routes
router.post('/', authenticateToken, createTicket);
router.get('/user', authenticateToken, getUserTickets);

// Admin routes (Ideally, we should have an isAdmin middleware too, but following existing patterns)
router.get('/', authenticateToken, getAllTickets);
router.put('/:id/resolve', authenticateToken, resolveTicket);

export default router;
