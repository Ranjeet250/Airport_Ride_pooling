// ─────────────────────────────────────────────
// Ride Controller
// ─────────────────────────────────────────────
const prisma = require('../config/prisma');
const queueService = require('../services/queue.service');
const CancellationManager = require('../services/cancellation-manager');
const { REQUEST_STATUS } = require('../utils/constants');

class RideController {
    /**
     * POST /ride/request
     * Create a new ride request and enqueue for pool matching.
     */
    static async requestRide(req, res, next) {
        try {
            const {
                passengerId,
                destLat,
                destLng,
                destAddress,
                luggageCount = 1,
                maxDetourRatio = 1.4,
            } = req.body;

            // Validation
            if (!passengerId || !destLat || !destLng || !destAddress) {
                return res.status(400).json({
                    error: 'Missing required fields: passengerId, destLat, destLng, destAddress',
                });
            }

            if (destLat < -90 || destLat > 90 || destLng < -180 || destLng > 180) {
                return res.status(400).json({ error: 'Invalid coordinates' });
            }

            if (luggageCount < 0 || luggageCount > 10) {
                return res.status(400).json({ error: 'luggageCount must be 0-10' });
            }

            if (maxDetourRatio < 1.0 || maxDetourRatio > 3.0) {
                return res.status(400).json({ error: 'maxDetourRatio must be 1.0-3.0' });
            }

            // Verify passenger exists
            const passenger = await prisma.passenger.findUnique({
                where: { id: passengerId },
            });
            if (!passenger) {
                return res.status(404).json({ error: 'Passenger not found' });
            }

            // Create ride request
            const rideRequest = await prisma.rideRequest.create({
                data: {
                    passengerId,
                    destLat: parseFloat(destLat),
                    destLng: parseFloat(destLng),
                    destAddress,
                    luggageCount: parseInt(luggageCount, 10),
                    maxDetourRatio: parseFloat(maxDetourRatio),
                    status: REQUEST_STATUS.PENDING,
                },
            });

            // Enqueue for async pool matching
            const job = await queueService.enqueuePoolMatching(rideRequest.id);

            return res.status(201).json({
                message: 'Ride request created. Pool matching in progress.',
                rideRequestId: rideRequest.id,
                jobId: job.id,
                status: rideRequest.status,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /ride/cancel
     * Cancel an existing ride request.
     */
    static async cancelRide(req, res, next) {
        try {
            const { rideRequestId } = req.body;

            if (!rideRequestId) {
                return res.status(400).json({ error: 'Missing rideRequestId' });
            }

            const result = await CancellationManager.cancel(rideRequestId);

            return res.status(200).json({
                message: 'Ride cancelled successfully.',
                ...result,
            });
        } catch (error) {
            if (error.message.includes('not found')) {
                return res.status(404).json({ error: error.message });
            }
            if (error.message.includes('Cannot cancel')) {
                return res.status(409).json({ error: error.message });
            }
            next(error);
        }
    }

    /**
     * GET /ride/pool/:id
     * Get full pool details including passengers and vehicle.
     */
    static async getPool(req, res, next) {
        try {
            const { id } = req.params;

            const pool = await prisma.ridePool.findUnique({
                where: { id },
                include: {
                    vehicle: {
                        select: {
                            id: true,
                            plateNumber: true,
                            driverName: true,
                            seats: true,
                            luggageCapacity: true,
                        },
                    },
                    rideRequests: {
                        where: { status: REQUEST_STATUS.MATCHED },
                        select: {
                            id: true,
                            destAddress: true,
                            destLat: true,
                            destLng: true,
                            luggageCount: true,
                            price: true,
                            passenger: {
                                select: { id: true, name: true, phone: true },
                            },
                        },
                    },
                    poolPassengers: {
                        orderBy: { pickupOrder: 'asc' },
                        select: {
                            rideRequestId: true,
                            pickupOrder: true,
                        },
                    },
                },
            });

            if (!pool) {
                return res.status(404).json({ error: 'Pool not found' });
            }

            return res.status(200).json({
                pool: {
                    id: pool.id,
                    status: pool.status,
                    routeCostKm: Math.round(pool.routeCost * 100) / 100,
                    currentPassengers: pool.currentPassengers,
                    currentLuggage: pool.currentLuggage,
                    vehicle: pool.vehicle,
                    passengers: pool.rideRequests.map((rr) => ({
                        rideRequestId: rr.id,
                        passenger: rr.passenger,
                        destination: {
                            address: rr.destAddress,
                            lat: rr.destLat,
                            lng: rr.destLng,
                        },
                        luggageCount: rr.luggageCount,
                        price: rr.price,
                        pickupOrder:
                            pool.poolPassengers.find((pp) => pp.rideRequestId === rr.id)
                                ?.pickupOrder ?? null,
                    })),
                },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /ride/status/:id
     * Get ride request status (for polling after request).
     */
    static async getRideStatus(req, res, next) {
        try {
            const { id } = req.params;

            const rideRequest = await prisma.rideRequest.findUnique({
                where: { id },
                include: {
                    pool: {
                        select: { id: true, status: true, vehicleId: true },
                    },
                },
            });

            if (!rideRequest) {
                return res.status(404).json({ error: 'Ride request not found' });
            }

            return res.status(200).json({
                rideRequestId: rideRequest.id,
                status: rideRequest.status,
                poolId: rideRequest.poolId,
                price: rideRequest.price,
                pool: rideRequest.pool,
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = RideController;
