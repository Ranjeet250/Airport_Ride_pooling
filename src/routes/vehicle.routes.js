// ─────────────────────────────────────────────
// Vehicle Routes
// ─────────────────────────────────────────────
const { Router } = require('express');
const VehicleController = require('../controllers/vehicle.controller');

const router = Router();

// GET /vehicle/available — List available vehicles
router.get('/available', VehicleController.getAvailable);

// GET /vehicle/all — List all vehicles (admin)
router.get('/all', VehicleController.getAll);

module.exports = router;
