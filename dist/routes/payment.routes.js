"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payment_controller_1 = require("../controllers/payment.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
const paymentController = new payment_controller_1.PaymentController();
router.use(auth_middleware_1.authenticateToken); // Protect all payment routes
router.post('/generate', (req, res) => paymentController.generateInvoice(req, res));
router.put('/:id/pay', (req, res) => paymentController.markAsPaid(req, res));
router.get('/trip/:tripId', (req, res) => paymentController.getPaymentByTrip(req, res));
router.get('/user/:userId', (0, auth_middleware_1.authorizeRole)('admin'), (req, res) => paymentController.getUserPayments(req, res));
exports.default = router;
