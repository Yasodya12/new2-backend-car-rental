import express from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware';

const router = express.Router();
const paymentController = new PaymentController();

router.use(authenticateToken); // Protect all payment routes

router.post('/generate', (req, res) => paymentController.generateInvoice(req, res));
router.put('/:id/pay', (req, res) => paymentController.markAsPaid(req, res));
router.get('/trip/:tripId', (req, res) => paymentController.getPaymentByTrip(req, res));
router.get('/user/:userId', authorizeRole('admin'), (req, res) => paymentController.getUserPayments(req, res));

export default router;
