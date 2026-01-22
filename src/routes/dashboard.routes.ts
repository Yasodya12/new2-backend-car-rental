import { Router } from 'express';
import { checkHealth, getDashboardStats, getCustomerDashboard, getDriverDashboard } from "../controllers/dashboard.controller";
import { authorizeRole } from "../middleware/auth.middleware";

const dashboardRoutes: Router = Router();

dashboardRoutes.get("/status", authorizeRole("admin"), getDashboardStats);
dashboardRoutes.get("/customer", authorizeRole("customer"), getCustomerDashboard);
dashboardRoutes.get("/driver", authorizeRole("driver"), getDriverDashboard);
dashboardRoutes.get("/check", checkHealth);

export default dashboardRoutes;