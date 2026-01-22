import mongoose from "mongoose";

export interface INotification {
    userId: mongoose.Types.ObjectId;
    title: string;
    message: string;
    type: "Info" | "Success" | "Warning" | "Error";
    isRead: boolean;
    link?: string;
    createdAt: Date;
}

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["Info", "Success", "Warning", "Error"],
        default: "Info"
    },
    isRead: {
        type: Boolean,
        default: false
    },
    link: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model<INotification>("Notification", notificationSchema);
export default Notification;
