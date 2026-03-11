import Withdrawal, { WithdrawalDocument } from '../model/withdrawal.model';
import User from '../model/user.model';
import { createNotification } from './notification.service';

export interface CreateWithdrawalDTO {
    driverId: string;
    amount: number;
    method: 'Cash' | 'Bank Transfer';
    bankDetails?: {
        bankName: string;
        accountNumber: string;
        accountHolderName: string;
    };
}

// Create a new withdrawal request
export const createWithdrawalRequest = async (data: CreateWithdrawalDTO): Promise<WithdrawalDocument> => {
    // Validate driver exists and has sufficient balance
    const driver = await User.findById(data.driverId);
    if (!driver) {
        throw new Error('Driver not found');
    }

    if (driver.role !== 'driver') {
        throw new Error('Only drivers can request withdrawals');
    }

    const currentBalance = driver.walletBalance || 0;
    if (currentBalance < data.amount) {
        throw new Error(`Insufficient balance. Current balance: Rs. ${currentBalance}`);
    }

    if (data.amount <= 0) {
        throw new Error('Withdrawal amount must be greater than 0');
    }

    // Check for existing pending withdrawal
    const existingPending = await Withdrawal.findOne({
        driverId: data.driverId,
        status: 'Pending'
    });

    if (existingPending) {
        throw new Error('You already have a pending withdrawal request. Please wait for it to be processed.');
    }

    // Validate bank details for bank transfer
    if (data.method === 'Bank Transfer') {
        if (!data.bankDetails?.bankName || !data.bankDetails?.accountNumber || !data.bankDetails?.accountHolderName) {
            throw new Error('Bank details are required for bank transfer');
        }
    }

    // Create withdrawal request
    const withdrawal = await Withdrawal.create({
        driverId: data.driverId,
        amount: data.amount,
        method: data.method,
        bankDetails: data.method === 'Bank Transfer' ? data.bankDetails : undefined,
        status: 'Pending',
        requestedAt: new Date()
    });

    return withdrawal;
};

// Get withdrawals by driver
export const getWithdrawalsByDriver = async (driverId: string): Promise<WithdrawalDocument[]> => {
    return Withdrawal.find({ driverId })
        .sort({ requestedAt: -1 })
        .lean() as unknown as WithdrawalDocument[];
};

// Get all pending withdrawals (for admin)
export const getPendingWithdrawals = async (): Promise<WithdrawalDocument[]> => {
    return Withdrawal.find({ status: 'Pending' })
        .populate('driverId', 'name email contactNumber')
        .sort({ requestedAt: 1 }) // Oldest first
        .lean() as unknown as WithdrawalDocument[];
};

// Get all withdrawals (for admin)
export const getAllWithdrawals = async (): Promise<WithdrawalDocument[]> => {
    return Withdrawal.find()
        .populate('driverId', 'name email contactNumber')
        .populate('processedBy', 'name email')
        .sort({ requestedAt: -1 })
        .lean() as unknown as WithdrawalDocument[];
};

// Approve withdrawal and deduct balance
export const approveWithdrawal = async (withdrawalId: string, adminId: string): Promise<WithdrawalDocument> => {
    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
        throw new Error('Withdrawal request not found');
    }

    if (withdrawal.status !== 'Pending') {
        throw new Error(`Withdrawal is already ${withdrawal.status.toLowerCase()}`);
    }

    // Verify driver still has sufficient balance
    const driver = await User.findById(withdrawal.driverId);
    if (!driver) {
        throw new Error('Driver not found');
    }

    const currentBalance = driver.walletBalance || 0;
    if (currentBalance < withdrawal.amount) {
        throw new Error(`Driver has insufficient balance. Current: Rs. ${currentBalance}, Requested: Rs. ${withdrawal.amount}`);
    }

    // Deduct from wallet balance
    await User.findByIdAndUpdate(withdrawal.driverId, {
        $inc: { walletBalance: -withdrawal.amount }
    });

    // Update withdrawal status
    withdrawal.status = 'Completed';
    withdrawal.processedAt = new Date();
    withdrawal.processedBy = adminId as any;
    await withdrawal.save();

    // Notify driver
    await createNotification(
        withdrawal.driverId.toString(),
        'Withdrawal Approved ✅',
        `Your withdrawal request of Rs. ${withdrawal.amount.toLocaleString()} has been approved and processed via ${withdrawal.method}.`,
        'Success',
        '/dashboard'
    );

    return withdrawal;
};

// Reject withdrawal
export const rejectWithdrawal = async (withdrawalId: string, adminId: string, reason: string): Promise<WithdrawalDocument> => {
    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
        throw new Error('Withdrawal request not found');
    }

    if (withdrawal.status !== 'Pending') {
        throw new Error(`Withdrawal is already ${withdrawal.status.toLowerCase()}`);
    }

    // Update withdrawal status
    withdrawal.status = 'Rejected';
    withdrawal.processedAt = new Date();
    withdrawal.processedBy = adminId as any;
    withdrawal.rejectionReason = reason || 'No reason provided';
    await withdrawal.save();

    // Notify driver
    await createNotification(
        withdrawal.driverId.toString(),
        'Withdrawal Rejected ❌',
        `Your withdrawal request of Rs. ${withdrawal.amount.toLocaleString()} was rejected. Reason: ${withdrawal.rejectionReason}`,
        'Error',
        '/dashboard'
    );

    return withdrawal;
};
