import express from 'express';
import { WithdrawalController } from '../controllers/withdrawal.controller';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware';

const router = express.Router();
const withdrawalController = new WithdrawalController();

// All routes require authentication
router.use(authenticateToken);

// Driver routes
router.post('/', (req, res) => withdrawalController.createWithdrawal(req, res));
router.get('/my', (req, res) => withdrawalController.getMyWithdrawals(req, res));

// Admin routes
router.get('/pending', authorizeRole('admin'), (req, res) => withdrawalController.getPendingWithdrawals(req, res));
router.get('/', authorizeRole('admin'), (req, res) => withdrawalController.getAllWithdrawals(req, res));
router.get('/all', authorizeRole('admin'), (req, res) => withdrawalController.getAllWithdrawals(req, res));
router.patch('/:id/approve', authorizeRole('admin'), (req, res) => withdrawalController.approveWithdrawal(req, res));
router.patch('/:id/reject', authorizeRole('admin'), (req, res) => withdrawalController.rejectWithdrawal(req, res));

export default router;
