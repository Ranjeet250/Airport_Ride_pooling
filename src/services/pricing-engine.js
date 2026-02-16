// ─────────────────────────────────────────────
// Dynamic Pricing Engine
// ─────────────────────────────────────────────
const config = require('../config');
const prisma = require('../config/prisma');
const RouteService = require('./route.service');
const { REQUEST_STATUS, VEHICLE_STATUS } = require('../utils/constants');

class PricingEngine {
    /**
     * Calculate the demand multiplier based on current system load.
     * Ratio of pending requests to available vehicles.
     */
    static async getDemandMultiplier() {
        const [pendingCount, availableCount] = await Promise.all([
            prisma.rideRequest.count({ where: { status: REQUEST_STATUS.PENDING } }),
            prisma.vehicle.count({ where: { status: VEHICLE_STATUS.AVAILABLE } }),
        ]);

        if (availableCount === 0) return config.pricing.maxDemandMultiplier;

        const ratio = pendingCount / availableCount;

        // Scale: 0 pending → 1.0x, ratio >= 3 → max multiplier
        const multiplier = Math.min(
            1.0 + (ratio / 3) * (config.pricing.maxDemandMultiplier - 1.0),
            config.pricing.maxDemandMultiplier
        );

        return Math.round(multiplier * 100) / 100;
    }

    /**
     * Calculate the fare for a ride request.
     *
     * Formula:
     *   Price = (BaseFare + DistanceRate × Distance) × DemandMultiplier
     *           − PoolDiscount + DetourPenalty
     *
     * @param {Object} params
     * @param {number} params.destLat - Destination latitude
     * @param {number} params.destLng - Destination longitude
     * @param {boolean} params.isPooled - Whether rider is in a pool
     * @param {number} params.detourKm - Extra km from detour (0 if direct)
     * @param {number} [params.demandMultiplier] - Override demand multiplier
     * @returns {Object} { totalPrice, breakdown }
     */
    static async calculateFare({
        destLat,
        destLng,
        isPooled = false,
        detourKm = 0,
        demandMultiplier = null,
    }) {
        const distance = RouteService.directDistance(destLat, destLng);
        const dm = demandMultiplier ?? (await PricingEngine.getDemandMultiplier());

        const baseFare = config.pricing.baseFare;
        const distanceCharge = config.pricing.distanceRate * distance;
        const subtotal = (baseFare + distanceCharge) * dm;

        const poolDiscount = isPooled
            ? subtotal * (config.pricing.poolDiscountPercent / 100)
            : 0;

        const detourPenalty = config.pricing.detourPenaltyPerKm * detourKm;

        const totalPrice = Math.max(
            Math.round((subtotal - poolDiscount + detourPenalty) * 100) / 100,
            baseFare // minimum fare
        );

        return {
            totalPrice,
            breakdown: {
                baseFare,
                distanceKm: Math.round(distance * 100) / 100,
                distanceCharge: Math.round(distanceCharge * 100) / 100,
                demandMultiplier: dm,
                poolDiscount: Math.round(poolDiscount * 100) / 100,
                detourPenaltyKm: detourKm,
                detourPenalty: Math.round(detourPenalty * 100) / 100,
                isPooled,
            },
        };
    }

    /**
     * Quick estimate without demand multiplier DB lookup.
     */
    static estimateFare({ destLat, destLng, isPooled = true }) {
        const distance = RouteService.directDistance(destLat, destLng);
        const baseFare = config.pricing.baseFare;
        const distanceCharge = config.pricing.distanceRate * distance;
        const subtotal = baseFare + distanceCharge;
        const poolDiscount = isPooled
            ? subtotal * (config.pricing.poolDiscountPercent / 100)
            : 0;

        const estimated = Math.round((subtotal - poolDiscount) * 100) / 100;

        return {
            estimatedPrice: Math.max(estimated, baseFare),
            distanceKm: Math.round(distance * 100) / 100,
            isPooled,
            note: 'Estimate does not include demand surge or detour penalties.',
        };
    }
}

module.exports = PricingEngine;
