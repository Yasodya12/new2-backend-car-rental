import mongoose, { Schema, Document } from 'mongoose';

export interface PaymentDocument extends Document {
    tripId: mongoose.Schema.Types.ObjectId;
    userId: mongoose.Schema.Types.ObjectId;
    amount: number;
    method: 'Cash' | 'Bank Transfer';
    status: 'Pending' | 'Paid';
    collectedBy?: mongoose.Schema.Types.ObjectId; // User (Driver/Admin) who collected payment
    collectedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const PaymentSchema: Schema = new Schema({
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['Cash', 'Bank Transfer'], default: 'Cash' },
    status: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
    collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    collectedAt: { type: Date },
}, { timestamps: true });

export default mongoose.model<PaymentDocument>('Payment', PaymentSchema);
