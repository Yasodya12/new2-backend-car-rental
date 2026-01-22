import mongoose, { Schema, Document } from "mongoose";

export interface IDriverDocument extends Document {
    driverId: mongoose.Types.ObjectId;
    type: "License" | "Insurance" | "ID";
    documentUrl: string;
    expiryDate?: Date;
    status: "Pending" | "Verified" | "Rejected";
    adminNotes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const DriverDocumentSchema: Schema = new Schema(
    {
        driverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        type: {
            type: String,
            enum: ["License", "Insurance", "ID"],
            required: true,
        },
        documentUrl: { type: String, required: true },
        expiryDate: { type: Date },
        status: {
            type: String,
            enum: ["Pending", "Verified", "Rejected"],
            default: "Pending",
        },
        adminNotes: { type: String },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IDriverDocument>("DriverDocument", DriverDocumentSchema);
