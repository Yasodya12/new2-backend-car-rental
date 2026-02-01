import { Request, Response } from 'express';
import * as demandService from '../service/demand.service';

export const createDemandSignal = async (req: Request, res: Response) => {
    try {
        const { address, lat, lng, reason } = req.body;
        const userId = (req as any).user?.id;

        if (!userId || !address || lat === undefined || lng === undefined || !reason) {
            return res.status(400).send({ error: "Missing required demand signal parameters" });
        }

        const signal = await demandService.createDemandSignal({
            userId,
            address,
            lat,
            lng,
            reason
        });

        return res.status(201).send(signal);
    } catch (error: any) {
        return res.status(500).send({ error: error.message });
    }
};

export const getDemandSignals = async (req: Request, res: Response) => {
    try {
        // Authorization check is usually handled by middleware, 
        // but double-checking role doesn't hurt.
        const user = (req as any).user;
        if (user.role !== 'admin') {
            return res.status(403).send({ error: "Access denied. Admin only." });
        }

        const signals = await demandService.getAllDemandSignals();
        return res.status(200).send(signals);
    } catch (error: any) {
        return res.status(500).send({ error: error.message });
    }
};
