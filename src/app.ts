import express, { Express } from "express";
import userRoutes from "./routes/user.routes";
import vehicleRoute from "./routes/vehicle.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import tripRoutes from "./routes/trip.routes";
import bookingRoutes from "./routes/booking.routes";
import authRoutes from "./routes/auth.routes";
import emailRoutes from "./routes/email.routes";
import ratingRoutes from "./routes/rating.routes";
import cors from "cors"
import fileUploadRoutes from "./routes/flie.upload.routes";
import path from "path";
import { authenticateToken } from "./middleware/auth.middleware";
import paymentRoutes from "./routes/payment.routes";
import promotionRoutes from "./routes/promotion.routes";
import ticketRoutes from "./routes/ticket.routes";
import documentRoutes from "./routes/driverDocument.routes";
import notificationRoutes from "./routes/notification.routes";
import chatRoutes from "./routes/chat.routes";

// 1. Initialize the express app
const app: Express = express();

app.use(express.json());
const allowedOrigins = ["http://localhost:5173"];

const crsOptions = {
    origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
        if (!origin || allowedOrigins.includes(origin)) { // postman request allowed
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    }
}

app.use(cors(crsOptions))
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/vehicles", authenticateToken, vehicleRoute);
app.use("/api/v1/trips", authenticateToken, tripRoutes);
app.use("/api/v1/dashboard", authenticateToken, dashboardRoutes);
app.use("/api/v1/booking", authenticateToken, bookingRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/email", authenticateToken, emailRoutes)
app.use("/api/v1/files", authenticateToken, fileUploadRoutes)
app.use("/api/v1/ratings", ratingRoutes)
app.use("/api/v1/payments", authenticateToken, paymentRoutes);
app.use("/api/v1/promotions", promotionRoutes);
app.use("/api/v1/tickets", ticketRoutes);
app.use("/api/v1/documents", documentRoutes);
app.use("/api/v1/notifications", authenticateToken, notificationRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/uploads/profile", express.static(path.join(__dirname, "../public/users")));
app.use("/uploads/vehicle", express.static(path.join(__dirname, "../public/vehicles")));

export default app;