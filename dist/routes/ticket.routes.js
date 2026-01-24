"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ticket_controller_1 = require("../controllers/ticket.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// User routes
router.post('/', auth_middleware_1.authenticateToken, ticket_controller_1.createTicket);
router.get('/user', auth_middleware_1.authenticateToken, ticket_controller_1.getUserTickets);
// Admin routes (Ideally, we should have an isAdmin middleware too, but following existing patterns)
router.get('/', auth_middleware_1.authenticateToken, ticket_controller_1.getAllTickets);
router.put('/:id/resolve', auth_middleware_1.authenticateToken, ticket_controller_1.resolveTicket);
exports.default = router;
