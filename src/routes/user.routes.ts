import { Router } from 'express';
import {
    getAllUser,
    saveUser,
    getUserById,
    updateUser,
    deleteUser,
    getAllUsersByRole, getUserByEmail, getDriversNearby, toggleAvailability, approveDriver, saveAdmin, getDriverApprovals
} from "../controllers/user.controller";
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware';

const userRoutes: Router = Router();

userRoutes.get("/all", authenticateToken, authorizeRole('admin'), getAllUser)
userRoutes.post("/register", saveUser)
userRoutes.post("/admin-create", authenticateToken, authorizeRole('admin'), saveAdmin)
userRoutes.get("/find/:id", authenticateToken, authorizeRole('admin'), getUserById)
userRoutes.put("/update/:id", authenticateToken, updateUser)
userRoutes.delete("/delete/:id", authenticateToken, authorizeRole('admin'), deleteUser)
userRoutes.get("/driver-approvals", authenticateToken, authorizeRole('admin'), getDriverApprovals)
userRoutes.get("/find-by-role/:role", authenticateToken, authorizeRole('admin', 'customer', 'driver'), getAllUsersByRole)
userRoutes.get("/find-by-email/:email", authenticateToken, getUserByEmail)
userRoutes.get("/drivers/nearby", getDriversNearby)
userRoutes.patch("/toggle-availability/:id", authenticateToken, toggleAvailability)
userRoutes.patch("/approve-driver/:id", authenticateToken, authorizeRole('admin'), approveDriver)

export default userRoutes;