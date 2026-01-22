import { Request, Response } from 'express';
import Ticket from '../model/ticket.model';
import { createNotification } from '../service/notification.service';

export const createTicket = async (req: Request, res: Response) => {
    try {
        const { tripId, subject, description, priority } = req.body;
        const userId = (req as any).user.id;

        const newTicket = new Ticket({
            userId,
            tripId,
            subject,
            description,
            priority
        });

        await newTicket.save();

        // Notify admins about new ticket
        const User = (await import('../model/user.model')).default;
        const admins = await User.find({ role: 'admin' });
        for (const admin of admins) {
            await createNotification(
                admin._id.toString(),
                'New Support Ticket',
                `New support ticket: ${subject}`,
                'Info',
                `/help-center`
            );
        }

        // Notify user about ticket creation
        await createNotification(
            userId,
            'Ticket Submitted',
            `Your support ticket "${subject}" has been submitted successfully.`,
            'Success',
            `/help-center`
        );

        res.status(201).json({ message: 'Ticket created successfully', ticket: newTicket });
    } catch (error: any) {
        res.status(500).json({ message: 'Error creating ticket', error: error.message });
    }
};

export const resolveTicket = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { adminResponse, status } = req.body;

        const updatedTicket = await Ticket.findByIdAndUpdate(
            id,
            {
                adminResponse,
                status: status || 'Resolved',
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!updatedTicket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Notify user about ticket update
        await createNotification(
            updatedTicket.userId.toString(),
            'Ticket Updated',
            `Your support ticket has been ${status || 'resolved'}. ${adminResponse ? 'Admin response: ' + adminResponse : ''}`,
            'Info',
            `/help-center`
        );

        res.status(200).json({ message: 'Ticket resolved successfully', ticket: updatedTicket });
    } catch (error: any) {
        res.status(500).json({ message: 'Error resolving ticket', error: error.message });
    }
};

export const getAllTickets = async (req: Request, res: Response) => {
    try {
        const tickets = await Ticket.find().populate('userId', 'name email').populate('tripId');
        res.status(200).json(tickets);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching tickets', error: error.message });
    }
};

export const getUserTickets = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const tickets = await Ticket.find({ userId }).populate('tripId');
        res.status(200).json(tickets);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching user tickets', error: error.message });
    }
};
