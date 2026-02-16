// ─────────────────────────────────────────────
// Pricing Routes
// ─────────────────────────────────────────────
const { Router } = require('express');
const PricingController = require('../controllers/pricing.controller');

const router = Router();

// GET /pricing/estimate — Quick fare estimate
router.get('/estimate', PricingController.getEstimate);

// POST /pricing/calculate — Full fare calculation with demand
router.post('/calculate', PricingController.calculateFare);

module.exports = router;
