import { Router } from 'express';
import {
    getAllUser,
    getCategorizedUsers,
    saveUser,
    getUserById,
    updateUser,
    updateProfile,
    deleteUser,
    getAllUsersByRole, getUserByEmail, getDriversNearby, toggleAvailability, approveDriver, saveAdmin, getDriverApprovals, blockDriver
} from "../controllers/user.controller";
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware';

const userRoutes: Router = Router();

userRoutes.get("/all", authenticateToken, authorizeRole('admin'), getAllUser)
userRoutes.get("/categorized", authenticateToken, authorizeRole('admin'), getCategorizedUsers)
userRoutes.post("/register", saveUser)
userRoutes.post("/admin-create", authenticateToken, authorizeRole('admin'), saveAdmin)
userRoutes.get("/find/:id", authenticateToken, authorizeRole('admin'), getUserById)
userRoutes.put("/update/:id", authenticateToken, updateUser)
userRoutes.put("/profile", authenticateToken, updateProfile)
userRoutes.delete("/delete/:id", authenticateToken, authorizeRole('admin'), deleteUser)
userRoutes.get("/driver-approvals", authenticateToken, authorizeRole('admin'), getDriverApprovals)
userRoutes.get("/find-by-role/:role", authenticateToken, authorizeRole('admin', 'customer', 'driver'), getAllUsersByRole)
userRoutes.get("/find-by-email/:email", authenticateToken, getUserByEmail)
userRoutes.get("/drivers/nearby", getDriversNearby)
userRoutes.patch("/toggle-availability/:id", authenticateToken, toggleAvailability)
userRoutes.patch("/approve-driver/:id", authenticateToken, authorizeRole('admin'), approveDriver)
userRoutes.patch("/block-driver", authenticateToken, blockDriver)

export default userRoutes;