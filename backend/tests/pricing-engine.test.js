// ─────────────────────────────────────────────
// Unit Tests — PricingEngine
// ─────────────────────────────────────────────
const PricingEngine = require('../src/services/pricing-engine');

describe('PricingEngine', () => {

    // ── estimateFare (sync, no DB) ─────────────
    describe('estimateFare()', () => {
        test('returns estimated price for a destination', () => {
            const result = PricingEngine.estimateFare({
                destLat: 13.0827,
                destLng: 80.2707,
                isPooled: false,
            });
            expect(result.estimatedPrice).toBeGreaterThan(0);
            expect(result.distanceKm).toBeGreaterThan(0);
            expect(result.isPooled).toBe(false);
        });

        test('pooled ride is cheaper than non-pooled', () => {
            const solo = PricingEngine.estimateFare({
                destLat: 13.0827,
                destLng: 80.2707,
                isPooled: false,
            });
            const pooled = PricingEngine.estimateFare({
                destLat: 13.0827,
                destLng: 80.2707,
                isPooled: true,
            });
            expect(pooled.estimatedPrice).toBeLessThan(solo.estimatedPrice);
        });

        test('farther destination costs more', () => {
            const near = PricingEngine.estimateFare({
                destLat: 13.0200,
                destLng: 80.2000,
                isPooled: false,
            });
            const far = PricingEngine.estimateFare({
                destLat: 13.2000,
                destLng: 80.4000,
                isPooled: false,
            });
            expect(far.estimatedPrice).toBeGreaterThan(near.estimatedPrice);
        });

        test('price is never below base fare', () => {
            // Very close destination
            const result = PricingEngine.estimateFare({
                destLat: 12.9945,
                destLng: 80.1715,
                isPooled: true,
            });
            const config = require('../src/config');
            expect(result.estimatedPrice).toBeGreaterThanOrEqual(config.pricing.baseFare);
        });

        test('includes disclaimer note', () => {
            const result = PricingEngine.estimateFare({
                destLat: 13.0827,
                destLng: 80.2707,
            });
            expect(result.note).toBeDefined();
            expect(result.note).toContain('Estimate');
        });
    });

    // ── calculateFare (with demand multiplier override) ──
    describe('calculateFare()', () => {
        test('returns total price and breakdown', async () => {
            const result = await PricingEngine.calculateFare({
                destLat: 13.0827,
                destLng: 80.2707,
                isPooled: false,
                detourKm: 0,
                demandMultiplier: 1.0, // Override to avoid DB call
            });
            expect(result.totalPrice).toBeGreaterThan(0);
            expect(result.breakdown).toBeDefined();
            expect(result.breakdown.baseFare).toBe(50);
            expect(result.breakdown.demandMultiplier).toBe(1.0);
            expect(result.breakdown.isPooled).toBe(false);
        });

        test('pool discount reduces price', async () => {
            const solo = await PricingEngine.calculateFare({
                destLat: 13.0827,
                destLng: 80.2707,
                isPooled: false,
                demandMultiplier: 1.0,
            });
            const pooled = await PricingEngine.calculateFare({
                destLat: 13.0827,
                destLng: 80.2707,
                isPooled: true,
                demandMultiplier: 1.0,
            });
            expect(pooled.totalPrice).toBeLessThanOrEqual(solo.totalPrice);
            expect(pooled.breakdown.poolDiscount).toBeGreaterThan(0);
        });

        test('higher demand multiplier increases price', async () => {
            const low = await PricingEngine.calculateFare({
                destLat: 13.0827,
                destLng: 80.2707,
                isPooled: false,
                demandMultiplier: 1.0,
            });
            const high = await PricingEngine.calculateFare({
                destLat: 13.0827,
                destLng: 80.2707,
                isPooled: false,
                demandMultiplier: 2.0,
            });
            expect(high.totalPrice).toBeGreaterThan(low.totalPrice);
        });

        test('detour penalty adds to price', async () => {
            const noDetour = await PricingEngine.calculateFare({
                destLat: 13.0827,
                destLng: 80.2707,
                isPooled: true,
                detourKm: 0,
                demandMultiplier: 1.0,
            });
            const withDetour = await PricingEngine.calculateFare({
                destLat: 13.0827,
                destLng: 80.2707,
                isPooled: true,
                detourKm: 5,
                demandMultiplier: 1.0,
            });
            expect(withDetour.totalPrice).toBeGreaterThan(noDetour.totalPrice);
            expect(withDetour.breakdown.detourPenalty).toBe(25); // 5km × ₹5
        });
    });
});
