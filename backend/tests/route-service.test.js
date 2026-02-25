// ─────────────────────────────────────────────
// Unit Tests — RouteService
// ─────────────────────────────────────────────
const RouteService = require('../src/services/route.service');

describe('RouteService', () => {

    // ── Haversine ──────────────────────────────
    describe('haversine()', () => {
        test('distance between same point is 0', () => {
            expect(RouteService.haversine(12.9941, 80.1709, 12.9941, 80.1709)).toBe(0);
        });

        test('distance between Chennai Airport and T.Nagar is ~15-20 km', () => {
            const dist = RouteService.haversine(12.9941, 80.1709, 13.0418, 80.2341);
            expect(dist).toBeGreaterThan(5);
            expect(dist).toBeLessThan(25);
        });

        test('distance is always non-negative', () => {
            const dist = RouteService.haversine(0, 0, 45, 90);
            expect(dist).toBeGreaterThan(0);
        });

        test('distance is symmetric (A→B = B→A)', () => {
            const ab = RouteService.haversine(13.0, 80.0, 13.1, 80.1);
            const ba = RouteService.haversine(13.1, 80.1, 13.0, 80.0);
            expect(ab).toBeCloseTo(ba, 10);
        });
    });

    // ── Direct Distance ────────────────────────
    describe('directDistance()', () => {
        test('returns distance from airport to destination', () => {
            const dist = RouteService.directDistance(13.0827, 80.2707);
            expect(dist).toBeGreaterThan(0);
        });
    });

    // ── Route Cost ─────────────────────────────
    describe('routeCost()', () => {
        test('empty stops returns 0', () => {
            expect(RouteService.routeCost([])).toBe(0);
        });

        test('single stop returns distance from airport', () => {
            const cost = RouteService.routeCost([{ lat: 13.0827, lng: 80.2707 }]);
            const direct = RouteService.directDistance(13.0827, 80.2707);
            expect(cost).toBeCloseTo(direct, 5);
        });

        test('two stops cost >= single stop cost', () => {
            const singleCost = RouteService.routeCost([{ lat: 13.0827, lng: 80.2707 }]);
            const twoCost = RouteService.routeCost([
                { lat: 13.0827, lng: 80.2707 },
                { lat: 13.0604, lng: 80.2496 },
            ]);
            expect(twoCost).toBeGreaterThanOrEqual(singleCost);
        });
    });

    // ── Route Optimization ─────────────────────
    describe('optimizeRoute()', () => {
        test('single stop returns same stop', () => {
            const result = RouteService.optimizeRoute([{ lat: 13.0827, lng: 80.2707 }]);
            expect(result.order).toHaveLength(1);
            expect(result.cost).toBeGreaterThan(0);
        });

        test('returns optimal ordering for 3 stops', () => {
            const stops = [
                { lat: 13.0827, lng: 80.2707 },  // T. Nagar
                { lat: 13.0604, lng: 80.2496 },  // Adyar
                { lat: 12.8438, lng: 80.1543 },  // Mahabalipuram direction
            ];
            const result = RouteService.optimizeRoute(stops);
            expect(result.order).toHaveLength(3);
            expect(result.cost).toBeGreaterThan(0);

            // The optimal cost must be <= all other permutations
            const allPerms = RouteService._permute(stops);
            for (const perm of allPerms) {
                expect(result.cost).toBeLessThanOrEqual(RouteService.routeCost(perm) + 0.0001);
            }
        });

        test('empty stops returns 0 cost', () => {
            const result = RouteService.optimizeRoute([]);
            expect(result.order).toHaveLength(0);
            expect(result.cost).toBe(0);
        });
    });

    // ── Routed Distance for Passenger ──────────
    describe('routedDistanceForPassenger()', () => {
        test('first stop distance equals direct airport distance', () => {
            const stops = [
                { lat: 13.0827, lng: 80.2707 },
                { lat: 13.0604, lng: 80.2496 },
            ];
            const routed = RouteService.routedDistanceForPassenger(stops, stops[0]);
            const direct = RouteService.directDistance(stops[0].lat, stops[0].lng);
            expect(routed).toBeCloseTo(direct, 5);
        });

        test('second stop distance > first stop distance', () => {
            const stops = [
                { lat: 13.0827, lng: 80.2707 },
                { lat: 13.0604, lng: 80.2496 },
            ];
            const first = RouteService.routedDistanceForPassenger(stops, stops[0]);
            const second = RouteService.routedDistanceForPassenger(stops, stops[1]);
            expect(second).toBeGreaterThan(first);
        });
    });

    // ── Permutation Generator ──────────────────
    describe('_permute()', () => {
        test('single element returns [[element]]', () => {
            const result = RouteService._permute([1]);
            expect(result).toEqual([[1]]);
        });

        test('two elements returns 2 permutations', () => {
            const result = RouteService._permute([1, 2]);
            expect(result).toHaveLength(2);
        });

        test('four elements returns 24 permutations', () => {
            const result = RouteService._permute([1, 2, 3, 4]);
            expect(result).toHaveLength(24);
        });
    });
});
