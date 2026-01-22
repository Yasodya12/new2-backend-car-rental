import { Request, Response } from 'express';
import Payment from '../model/payment.model';
import Trip from '../model/trip.model';
import { sendEmail } from '../utils/email';
import { paymentReceiptTemplate } from '../utils/email.templates';
import { createNotification } from '../service/notification.service';

export class PaymentController {

    // 1. Generate Invoice (Auto or Manual)
    public async generateInvoice(req: Request, res: Response) {
        try {
            const { tripId, amount, userId } = req.body;

            const existingPayment = await Payment.findOne({ tripId });
            if (existingPayment) {
                return res.status(400).json({ message: "Invoice already exists for this trip" });
            }

            const payment = new Payment({
                tripId,
                userId,
                amount,
                status: 'Pending',
                method: 'Cash' // Default
            });

            const savedPayment = await payment.save();
            const populatedPayment = await Payment.findById(savedPayment._id).populate('tripId');
            res.status(201).json(populatedPayment);
        } catch (error) {
            res.status(500).json({ message: "Error generating invoice", error });
        }
    }

    // 2. Mark as Paid (Collection)
    public async markAsPaid(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { collectedBy, method } = req.body; // collectedBy is the Driver/Admin ID

            const payment: any = await Payment.findById(id)
                .populate('userId', 'name email')
                .populate('tripId');

            if (!payment) {
                return res.status(404).json({ message: "Invoice not found" });
            }

            payment.status = 'Paid';
            payment.collectedBy = collectedBy;
            payment.collectedAt = new Date();
            if (method) payment.method = method;

            const updatedPayment = await payment.save();

            // Update Trip Status to 'Paid'
            const tripIdUpdate = payment.tripId && payment.tripId._id ? payment.tripId._id : payment.tripId;
            const tripIdStr = payment.tripId && payment.tripId._id ? payment.tripId._id : payment.tripId;
            await Trip.findByIdAndUpdate(tripIdUpdate, { status: 'Paid' });

            // Send Receipt Email
            if (payment.userId && payment.userId.email) {
                const customerName = payment.userId.name;
                // Handle tripId being either populated object or string ID
                const amount = payment.amount;
                const date = new Date().toLocaleString();

                const subject = "Payment Receipt 🧾";
                const html = paymentReceiptTemplate(customerName, tripIdStr.toString(), amount, date, payment.method);

                await sendEmail(payment.userId.email, subject, "", html);
                console.log(`Receipt email sent to ${payment.userId.email}`);
            }

            // Notify customer about payment confirmation
            if (payment.userId && payment.userId._id) {
                await createNotification(
                    payment.userId._id.toString(),
                    "Payment Received",
                    `Your payment of Rs. ${payment.amount} has been received successfully.`,
                    "Success",
                    `/trips/${tripIdStr}`
                );
            }

            // Notify driver/collector about payment collection
            if (collectedBy) {
                await createNotification(
                    collectedBy,
                    "Payment Collected",
                    `Payment of Rs. ${payment.amount} has been collected successfully.`,
                    "Success",
                    `/trips/${tripIdStr}`
                );
            }

            res.status(200).json(updatedPayment);
        } catch (error) {
            console.error("Error updating payment:", error);
            res.status(500).json({ message: "Error updating payment status", error });
        }
    }

    // 3. Get Payment by Trip
    public async getPaymentByTrip(req: Request, res: Response) {
        try {
            const { tripId } = req.params;
            // Populate tripId to get trip details (start/end location etc) for the invoice UI
            const payment = await Payment.findOne({ tripId })
                .populate('collectedBy', 'name email')
                .populate('tripId');
            res.status(200).json(payment);
        } catch (error) {
            res.status(500).json({ message: "Error fetching payment", error });
        }
    }

    // 4. Get User Payment History
    public async getUserPayments(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const payments = await Payment.find({ userId }).populate('tripId').sort({ createdAt: -1 });
            res.status(200).json(payments);
        } catch (error) {
            res.status(500).json({ message: "Error fetching history", error });
        }
    }
}
