// ─────────────────────────────────────────────
// Cancellation Manager
// ─────────────────────────────────────────────
//
// Handles real-time cancellations:
//   1. Mark ride request as CANCELLED
//   2. Remove from pool
//   3. Rebalance pool (update counts, recalculate route)
//   4. If pool is now empty, release vehicle
// ─────────────────────────────────────────────

const prisma = require('../config/prisma');
const RouteService = require('./route.service');
const lockManager = require('./lock-manager');
const { POOL_STATUS, REQUEST_STATUS, VEHICLE_STATUS, LOCK_KEYS } = require('../utils/constants');

class CancellationManager {
    /**
     * Cancel a ride request and rebalance the pool.
     *
     * @param {string} rideRequestId
     * @returns {Object} { cancelled: true, poolRebalanced, poolDisbanded }
     */
    static async cancel(rideRequestId) {
        const lockKey = `${LOCK_KEYS.POOL_PREFIX}cancel:${rideRequestId}`;

        return lockManager.withLock(lockKey, async () => {
            // ── 1. Fetch the request ──
            const request = await prisma.rideRequest.findUnique({
                where: { id: rideRequestId },
                include: { pool: { include: { vehicle: true } } },
            });

            if (!request) {
                throw new Error(`RideRequest ${rideRequestId} not found`);
            }

            if (request.status === REQUEST_STATUS.CANCELLED) {
                return { cancelled: true, poolRebalanced: false, poolDisbanded: false, message: 'Already cancelled' };
            }

            if (request.status !== REQUEST_STATUS.MATCHED && request.status !== REQUEST_STATUS.PENDING) {
                throw new Error(`Cannot cancel request with status: ${request.status}`);
            }

            // ── 2. Mark request as cancelled ──
            await prisma.rideRequest.update({
                where: { id: rideRequestId },
                data: { status: REQUEST_STATUS.CANCELLED, poolId: null },
            });

            // ── 3. Remove from pool_passengers ──
            await prisma.poolPassenger.deleteMany({
                where: { rideRequestId },
            });

            // ── 4. Rebalance pool ──
            if (request.poolId && request.pool) {
                const pool = request.pool;
                const newPassengerCount = pool.currentPassengers - 1;
                const newLuggageCount = pool.currentLuggage - request.luggageCount;

                if (newPassengerCount <= 0) {
                    // ── Pool is now empty — disband it ──
                    await prisma.ridePool.update({
                        where: { id: pool.id },
                        data: {
                            status: POOL_STATUS.CANCELLED,
                            currentPassengers: 0,
                            currentLuggage: 0,
                            routeCost: 0,
                            version: pool.version + 1,
                        },
                    });

                    // Release the vehicle
                    await prisma.vehicle.update({
                        where: { id: pool.vehicleId },
                        data: { status: VEHICLE_STATUS.AVAILABLE },
                    });

                    return { cancelled: true, poolRebalanced: false, poolDisbanded: true };
                }

                // ── Recalculate route with remaining passengers ──
                const remainingRequests = await prisma.rideRequest.findMany({
                    where: { poolId: pool.id, status: REQUEST_STATUS.MATCHED },
                    select: { destLat: true, destLng: true },
                });

                const stops = remainingRequests.map((r) => ({
                    lat: r.destLat,
                    lng: r.destLng,
                }));

                const optimized = RouteService.optimizeRoute(stops);

                await prisma.ridePool.update({
                    where: { id: pool.id },
                    data: {
                        currentPassengers: newPassengerCount,
                        currentLuggage: Math.max(0, newLuggageCount),
                        routeCost: optimized.cost,
                        status: POOL_STATUS.OPEN, // Reopen if was FULL
                        version: pool.version + 1,
                    },
                });

                // Re-number pickup orders
                const poolPassengers = await prisma.poolPassenger.findMany({
                    where: { poolId: pool.id },
                    include: { rideRequest: { select: { destLat: true, destLng: true } } },
                    orderBy: { pickupOrder: 'asc' },
                });

                for (let i = 0; i < poolPassengers.length; i++) {
                    await prisma.poolPassenger.update({
                        where: { id: poolPassengers[i].id },
                        data: { pickupOrder: i + 1 },
                    });
                }

                return { cancelled: true, poolRebalanced: true, poolDisbanded: false };
            }

            return { cancelled: true, poolRebalanced: false, poolDisbanded: false };
        });
    }
}

module.exports = CancellationManager;
