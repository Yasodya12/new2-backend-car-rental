"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const vehicle_routes_1 = __importDefault(require("./routes/vehicle.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const trip_routes_1 = __importDefault(require("./routes/trip.routes"));
const booking_routes_1 = __importDefault(require("./routes/booking.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const email_routes_1 = __importDefault(require("./routes/email.routes"));
const rating_routes_1 = __importDefault(require("./routes/rating.routes"));
const cors_1 = __importDefault(require("cors"));
const flie_upload_routes_1 = __importDefault(require("./routes/flie.upload.routes"));
const path_1 = __importDefault(require("path"));
const auth_middleware_1 = require("./middleware/auth.middleware");
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const promotion_routes_1 = __importDefault(require("./routes/promotion.routes"));
const ticket_routes_1 = __importDefault(require("./routes/ticket.routes"));
const driverDocument_routes_1 = __importDefault(require("./routes/driverDocument.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
// 1. Initialize the express app
const app = (0, express_1.default)();
app.use(express_1.default.json());
const allowedOrigins = ["http://localhost:5173"];
const crsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) { // postman request allowed
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    }
};
app.use((0, cors_1.default)(crsOptions));
app.use("/api/v1/users", user_routes_1.default);
app.use("/api/v1/vehicles", auth_middleware_1.authenticateToken, vehicle_routes_1.default);
app.use("/api/v1/trips", auth_middleware_1.authenticateToken, trip_routes_1.default);
app.use("/api/v1/dashboard", auth_middleware_1.authenticateToken, dashboard_routes_1.default);
app.use("/api/v1/booking", auth_middleware_1.authenticateToken, booking_routes_1.default);
app.use("/api/v1/auth", auth_routes_1.default);
app.use("/api/v1/email", auth_middleware_1.authenticateToken, email_routes_1.default);
app.use("/api/v1/files", auth_middleware_1.authenticateToken, flie_upload_routes_1.default);
app.use("/api/v1/ratings", rating_routes_1.default);
app.use("/api/v1/payments", auth_middleware_1.authenticateToken, payment_routes_1.default);
app.use("/api/v1/promotions", promotion_routes_1.default);
app.use("/api/v1/tickets", ticket_routes_1.default);
app.use("/api/v1/documents", driverDocument_routes_1.default);
app.use("/api/v1/notifications", auth_middleware_1.authenticateToken, notification_routes_1.default);
app.use("/api/v1/chat", chat_routes_1.default);
app.use("/uploads/profile", express_1.default.static(path_1.default.join(__dirname, "../public/users")));
app.use("/uploads/vehicle", express_1.default.static(path_1.default.join(__dirname, "../public/vehicles")));
exports.default = app;
