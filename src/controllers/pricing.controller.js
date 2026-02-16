// ─────────────────────────────────────────────
// Pricing Controller
// ─────────────────────────────────────────────
const PricingEngine = require('../services/pricing-engine');

class PricingController {
    /**
     * GET /pricing/estimate
     * Quick fare estimate without DB-driven demand multiplier.
     * Query params: destLat, destLng, isPooled (optional, default true)
     */
    static async getEstimate(req, res, next) {
        try {
            const { destLat, destLng, isPooled = 'true' } = req.query;

            if (!destLat || !destLng) {
                return res.status(400).json({
                    error: 'Missing required query params: destLat, destLng',
                });
            }

            const lat = parseFloat(destLat);
            const lng = parseFloat(destLng);

            if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                return res.status(400).json({ error: 'Invalid coordinates' });
            }

            const estimate = PricingEngine.estimateFare({
                destLat: lat,
                destLng: lng,
                isPooled: isPooled === 'true',
            });

            return res.status(200).json(estimate);
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /pricing/calculate
     * Full fare calculation with demand multiplier from DB.
     */
    static async calculateFare(req, res, next) {
        try {
            const { destLat, destLng, isPooled = true, detourKm = 0 } = req.body;

            if (!destLat || !destLng) {
                return res.status(400).json({
                    error: 'Missing required fields: destLat, destLng',
                });
            }

            const result = await PricingEngine.calculateFare({
                destLat: parseFloat(destLat),
                destLng: parseFloat(destLng),
                isPooled,
                detourKm: parseFloat(detourKm),
            });

            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = PricingController;
