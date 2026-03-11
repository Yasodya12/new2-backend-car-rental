import { Request, Response } from 'express';
import * as withdrawalService from '../service/withdrawal.service';

export class WithdrawalController {

    // Driver: Create withdrawal request
    public async createWithdrawal(req: Request, res: Response) {
        try {
            const { amount, method, bankDetails } = req.body;
            const driverId = (req as any).user?.id;

            if (!driverId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const withdrawal = await withdrawalService.createWithdrawalRequest({
                driverId,
                amount,
                method,
                bankDetails
            });

            res.status(201).json({
                message: 'Withdrawal request submitted successfully',
                withdrawal
            });
        } catch (error: any) {
            console.error('Error creating withdrawal:', error);
            res.status(400).json({ message: error.message || 'Error creating withdrawal request' });
        }
    }

    // Driver: Get my withdrawals
    public async getMyWithdrawals(req: Request, res: Response) {
        try {
            const driverId = (req as any).user?.id;

            if (!driverId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const withdrawals = await withdrawalService.getWithdrawalsByDriver(driverId);
            res.status(200).json(withdrawals);
        } catch (error: any) {
            console.error('Error fetching withdrawals:', error);
            res.status(500).json({ message: error.message || 'Error fetching withdrawals' });
        }
    }

    // Admin: Get pending withdrawals
    public async getPendingWithdrawals(req: Request, res: Response) {
        try {
            const withdrawals = await withdrawalService.getPendingWithdrawals();
            res.status(200).json(withdrawals);
        } catch (error: any) {
            console.error('Error fetching pending withdrawals:', error);
            res.status(500).json({ message: error.message || 'Error fetching pending withdrawals' });
        }
    }

    // Admin: Get all withdrawals
    public async getAllWithdrawals(req: Request, res: Response) {
        try {
            const withdrawals = await withdrawalService.getAllWithdrawals();
            res.status(200).json(withdrawals);
        } catch (error: any) {
            console.error('Error fetching all withdrawals:', error);
            res.status(500).json({ message: error.message || 'Error fetching all withdrawals' });
        }
    }

    // Admin: Approve withdrawal
    public async approveWithdrawal(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const adminId = (req as any).user?.id;

            if (!adminId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const withdrawal = await withdrawalService.approveWithdrawal(id, adminId);
            res.status(200).json({
                message: 'Withdrawal approved and processed successfully',
                withdrawal
            });
        } catch (error: any) {
            console.error('Error approving withdrawal:', error);
            res.status(400).json({ message: error.message || 'Error approving withdrawal' });
        }
    }

    // Admin: Reject withdrawal
    public async rejectWithdrawal(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const adminId = (req as any).user?.id;

            if (!adminId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const withdrawal = await withdrawalService.rejectWithdrawal(id, adminId, reason);
            res.status(200).json({
                message: 'Withdrawal rejected',
                withdrawal
            });
        } catch (error: any) {
            console.error('Error rejecting withdrawal:', error);
            res.status(400).json({ message: error.message || 'Error rejecting withdrawal' });
        }
    }
}
