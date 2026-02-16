// ─────────────────────────────────────────────
// Route Service — Haversine + Route Optimization
// ─────────────────────────────────────────────
const { EARTH_RADIUS_KM } = require('../utils/constants');
const config = require('../config');

class RouteService {
    /**
     * Haversine distance between two lat/lng points in km.
     */
    static haversine(lat1, lng1, lat2, lng2) {
        const toRad = (deg) => (deg * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
        return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
    }

    /**
     * Direct distance from airport to a destination.
     */
    static directDistance(destLat, destLng) {
        return RouteService.haversine(
            config.airport.lat,
            config.airport.lng,
            destLat,
            destLng
        );
    }

    /**
     * Compute the total route cost for a list of stops (from airport).
     * Stops are visited in the given order.
     * Each stop = { lat, lng }
     * Route: Airport → stop[0] → stop[1] → ... → stop[n-1]
     */
    static routeCost(stops) {
        if (stops.length === 0) return 0;

        let cost = RouteService.haversine(
            config.airport.lat,
            config.airport.lng,
            stops[0].lat,
            stops[0].lng
        );

        for (let i = 1; i < stops.length; i++) {
            cost += RouteService.haversine(
                stops[i - 1].lat,
                stops[i - 1].lng,
                stops[i].lat,
                stops[i].lng
            );
        }

        return cost;
    }

    /**
     * Find the optimal ordering of stops using brute-force permutation.
     * Since max passengers per pool = 4, this is O(4!) = O(24) — very fast.
     * Returns { order: [...stops], cost: number }
     */
    static optimizeRoute(stops) {
        if (stops.length <= 1) {
            return { order: [...stops], cost: RouteService.routeCost(stops) };
        }

        const permutations = RouteService._permute(stops);
        let bestCost = Infinity;
        let bestOrder = stops;

        for (const perm of permutations) {
            const cost = RouteService.routeCost(perm);
            if (cost < bestCost) {
                bestCost = cost;
                bestOrder = perm;
            }
        }

        return { order: bestOrder, cost: bestCost };
    }

    /**
     * Compute the routed distance for a specific passenger in an ordered route.
     * This is the distance from airport to that passenger's stop along the route.
     */
    static routedDistanceForPassenger(orderedStops, passengerStop) {
        let distance = 0;
        let prevLat = config.airport.lat;
        let prevLng = config.airport.lng;

        for (const stop of orderedStops) {
            distance += RouteService.haversine(prevLat, prevLng, stop.lat, stop.lng);
            if (stop.lat === passengerStop.lat && stop.lng === passengerStop.lng) {
                return distance;
            }
            prevLat = stop.lat;
            prevLng = stop.lng;
        }

        return distance; // Fallback (shouldn't reach here)
    }

    /**
     * Generate all permutations of an array (for N ≤ 4).
     */
    static _permute(arr) {
        if (arr.length <= 1) return [arr];
        const result = [];
        for (let i = 0; i < arr.length; i++) {
            const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
            for (const perm of RouteService._permute(rest)) {
                result.push([arr[i], ...perm]);
            }
        }
        return result;
    }
}

module.exports = RouteService;
