import mongoose, { Schema, Document } from 'mongoose';

export interface WithdrawalDocument extends Document {
    driverId: mongoose.Schema.Types.ObjectId;
    amount: number;
    method: 'Cash' | 'Bank Transfer';
    bankDetails?: {
        bankName: string;
        accountNumber: string;
        accountHolderName: string;
    };
    status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
    requestedAt: Date;
    processedAt?: Date;
    processedBy?: mongoose.Schema.Types.ObjectId;
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

const WithdrawalSchema: Schema = new Schema({
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: ['Cash', 'Bank Transfer'], required: true },
    bankDetails: {
        bankName: { type: String },
        accountNumber: { type: String },
        accountHolderName: { type: String }
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
        default: 'Pending'
    },
    requestedAt: { type: Date, default: Date.now },
    processedAt: { type: Date },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String }
}, { timestamps: true });

// Index for efficient queries
WithdrawalSchema.index({ driverId: 1, status: 1 });
WithdrawalSchema.index({ status: 1, requestedAt: -1 });

export default mongoose.model<WithdrawalDocument>('Withdrawal', WithdrawalSchema);
