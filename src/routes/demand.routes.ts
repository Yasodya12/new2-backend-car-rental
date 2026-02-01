import { Router } from 'express';
import { createDemandSignal, getDemandSignals } from '../controllers/demand.controller';
import { authorizeRole } from '../middleware/auth.middleware';

const demandRoutes: Router = Router();

// Log a demand signal (any authenticated user)
demandRoutes.post("/", createDemandSignal);

// Get all demand signals (Admin only)
demandRoutes.get("/", authorizeRole('admin'), getDemandSignals);

export default demandRoutes;
