// ─────────────────────────────────────────────
// Pool Matcher — Core Matching Algorithm
// ─────────────────────────────────────────────
//
// Strategy: Greedy Incremental Insertion
//   1. For each new ride request, find OPEN pools
//   2. Simulate inserting the new destination into each pool's route
//   3. Score by detour ratio (lower is better)
//   4. Validate capacity + detour tolerance for ALL passengers
//   5. Pick best pool or create a new one
//
// Complexity: O(P × N!) where P=open pools, N=passengers/pool (≤4)
//             ≈ O(P × 24) — runs well under 300ms
// ─────────────────────────────────────────────

const prisma = require('../config/prisma');
const RouteService = require('./route.service');
const PricingEngine = require('./pricing-engine');
const lockManager = require('./lock-manager');
const { POOL_STATUS, REQUEST_STATUS, VEHICLE_STATUS, LOCK_KEYS } = require('../utils/constants');
const config = require('../config');

class PoolMatcher {
    /**
     * Match a ride request to the best pool or create a new one.
     * This is the core algorithm — called by the BullMQ worker.
     *
     * @param {string} rideRequestId
     * @returns {Object} { poolId, vehicleId, price, isNewPool }
     */
    static async match(rideRequestId) {
        // Use distributed lock to prevent concurrent matching conflicts
        return lockManager.withLock(LOCK_KEYS.POOL_MATCHING, async () => {
            // ── 1. Fetch the ride request ──
            const request = await prisma.rideRequest.findUnique({
                where: { id: rideRequestId },
                include: { passenger: true },
            });

            if (!request) throw new Error(`RideRequest ${rideRequestId} not found`);
            if (request.status !== REQUEST_STATUS.PENDING) {
                throw new Error(`RideRequest ${rideRequestId} is not PENDING (status: ${request.status})`);
            }

            const newStop = { lat: request.destLat, lng: request.destLng };

            // ── 2. Fetch all OPEN pools with capacity ──
            const openPools = await prisma.ridePool.findMany({
                where: {
                    status: POOL_STATUS.OPEN,
                },
                include: {
                    vehicle: true,
                    rideRequests: {
                        where: { status: REQUEST_STATUS.MATCHED },
                        select: { destLat: true, destLng: true, maxDetourRatio: true },
                    },
                },
            });

            // ── 3. Score each candidate pool ──
            let bestPool = null;
            let bestScore = Infinity;
            let bestRoute = null;

            for (const pool of openPools) {
                // Capacity check: seats
                const availableSeats = pool.vehicle.seats - pool.currentPassengers;
                if (availableSeats < 1) continue;

                // Capacity check: luggage
                const availableLuggage = pool.vehicle.luggageCapacity - pool.currentLuggage;
                if (availableLuggage < request.luggageCount) continue;

                // Current stops
                const currentStops = pool.rideRequests.map((r) => ({
                    lat: r.destLat,
                    lng: r.destLng,
                    maxDetourRatio: r.maxDetourRatio,
                }));

                // Current optimal route
                const currentRoute = RouteService.optimizeRoute(
                    currentStops.map((s) => ({ lat: s.lat, lng: s.lng }))
                );

                // Simulate adding the new passenger
                const candidateStops = [
                    ...currentStops.map((s) => ({ lat: s.lat, lng: s.lng })),
                    newStop,
                ];
                const candidateRoute = RouteService.optimizeRoute(candidateStops);

                // Score: ratio of new cost to old cost (lower = better fit)
                const score =
                    currentRoute.cost > 0
                        ? candidateRoute.cost / currentRoute.cost
                        : candidateRoute.cost;

                // ── 4. Validate detour tolerance for ALL passengers ──
                let allTolerancesOk = true;

                // Check existing passengers
                for (const existingPassenger of currentStops) {
                    const directDist = RouteService.directDistance(
                        existingPassenger.lat,
                        existingPassenger.lng
                    );
                    const routedDist = RouteService.routedDistanceForPassenger(
                        candidateRoute.order,
                        { lat: existingPassenger.lat, lng: existingPassenger.lng }
                    );
                    const detourRatio = routedDist / directDist;

                    if (detourRatio > existingPassenger.maxDetourRatio) {
                        allTolerancesOk = false;
                        break;
                    }
                }

                // Check the NEW passenger's tolerance too
                if (allTolerancesOk) {
                    const newDirectDist = RouteService.directDistance(newStop.lat, newStop.lng);
                    const newRoutedDist = RouteService.routedDistanceForPassenger(
                        candidateRoute.order,
                        newStop
                    );
                    const newDetourRatio = newRoutedDist / newDirectDist;

                    if (newDetourRatio > request.maxDetourRatio) {
                        allTolerancesOk = false;
                    }
                }

                if (!allTolerancesOk) continue;

                // ── 5. Track best pool ──
                if (score < bestScore) {
                    bestScore = score;
                    bestPool = pool;
                    bestRoute = candidateRoute;
                }
            }

            // ── 6. Assign to best pool or create new ──
            let poolId, vehicleId, isNewPool;

            if (bestPool) {
                // ── Assign to existing pool (with optimistic locking) ──
                poolId = bestPool.id;
                vehicleId = bestPool.vehicleId;
                isNewPool = false;

                const updateResult = await prisma.ridePool.updateMany({
                    where: { id: poolId, version: bestPool.version },
                    data: {
                        version: bestPool.version + 1,
                        routeCost: bestRoute.cost,
                        currentPassengers: bestPool.currentPassengers + 1,
                        currentLuggage: bestPool.currentLuggage + request.luggageCount,
                        status:
                            bestPool.currentPassengers + 1 >= bestPool.vehicle.seats
                                ? POOL_STATUS.FULL
                                : POOL_STATUS.OPEN,
                    },
                });

                if (updateResult.count === 0) {
                    throw new Error(
                        `Optimistic lock conflict on pool ${poolId}. Retry matching.`
                    );
                }
            } else {
                // ── Create a new pool with a fresh vehicle ──
                const vehicle = await prisma.vehicle.findFirst({
                    where: { status: VEHICLE_STATUS.AVAILABLE },
                    orderBy: { createdAt: 'asc' },
                });

                if (!vehicle) {
                    throw new Error('No available vehicles. Please try again later.');
                }

                const newRoute = RouteService.optimizeRoute([newStop]);

                const newPool = await prisma.ridePool.create({
                    data: {
                        vehicleId: vehicle.id,
                        status: POOL_STATUS.OPEN,
                        routeCost: newRoute.cost,
                        currentPassengers: 1,
                        currentLuggage: request.luggageCount,
                    },
                });

                // Mark vehicle as assigned
                await prisma.vehicle.update({
                    where: { id: vehicle.id },
                    data: { status: VEHICLE_STATUS.ASSIGNED },
                });

                poolId = newPool.id;
                vehicleId = vehicle.id;
                isNewPool = true;
            }

            // ── 7. Calculate price ──
            const existingInPool = isNewPool ? 0 : bestPool.currentPassengers;
            const directDist = RouteService.directDistance(newStop.lat, newStop.lng);
            const detourKm = bestRoute
                ? Math.max(
                    0,
                    RouteService.routedDistanceForPassenger(bestRoute.order, newStop) -
                    directDist
                )
                : 0;

            const { totalPrice } = await PricingEngine.calculateFare({
                destLat: newStop.lat,
                destLng: newStop.lng,
                isPooled: !isNewPool || existingInPool > 0,
                detourKm,
            });

            // ── 8. Update ride request ──
            await prisma.rideRequest.update({
                where: { id: rideRequestId },
                data: {
                    poolId,
                    status: REQUEST_STATUS.MATCHED,
                    price: totalPrice,
                },
            });

            // ── 9. Create pool passenger entry ──
            const passengerCount = isNewPool ? 1 : bestPool.currentPassengers + 1;
            await prisma.poolPassenger.create({
                data: {
                    poolId,
                    rideRequestId,
                    pickupOrder: passengerCount,
                },
            });

            return {
                poolId,
                vehicleId,
                price: totalPrice,
                isNewPool,
                passengerCount,
            };
        });
    }
}

module.exports = PoolMatcher;
