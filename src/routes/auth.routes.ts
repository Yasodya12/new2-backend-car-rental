import { Router } from 'express';

import { authenticateUser as login, requestPasswordResetOTP, verifyOTP, resetPassword, changePassword } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const authRoutes: Router = Router();

authRoutes.post('/login', login);
authRoutes.post('/forgot-password', requestPasswordResetOTP);
authRoutes.post('/verify-otp', verifyOTP);
authRoutes.post('/reset-password', resetPassword);
authRoutes.post('/change-password', authenticateToken, changePassword);

export default authRoutes;