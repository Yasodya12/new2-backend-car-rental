import DemandSignal from '../model/demand.model';

export const createDemandSignal = async (data: {
    userId: string;
    address: string;
    lat: number;
    lng: number;
    reason: string;
}) => {
    // Basic throttling: Check if this user already logged a signal for a similar location 
    // within the last 10 minutes to avoid spam.
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const existingSignal = await DemandSignal.findOne({
        userId: data.userId,
        // Match approximate location (within ~100m) or same address
        $or: [
            { address: data.address },
            {
                lat: { $gte: data.lat - 0.001, $lte: data.lat + 0.001 },
                lng: { $gte: data.lng - 0.001, $lte: data.lng + 0.001 }
            }
        ],
        createdAt: { $gte: tenMinutesAgo }
    });

    if (existingSignal) {
        return existingSignal; // Return existing instead of creating new trip signal
    }

    return await DemandSignal.create(data);
};

export const getAllDemandSignals = async () => {
    return await DemandSignal.find()
        .populate('userId', 'name email contactNumber')
        .sort({ createdAt: -1 });
};
