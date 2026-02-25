// ─────────────────────────────────────────────
// Ride Routes
// ─────────────────────────────────────────────
const { Router } = require('express');
const RideController = require('../controllers/ride.controller');

const router = Router();

// POST /ride/request — Create a ride request (enqueues pool matching)
router.post('/request', RideController.requestRide);

// POST /ride/cancel — Cancel a ride request
router.post('/cancel', RideController.cancelRide);

// GET /ride/pool/:id — Get pool details
router.get('/pool/:id', RideController.getPool);

// GET /ride/status/:id — Check ride request status (polling endpoint)
router.get('/status/:id', RideController.getRideStatus);

module.exports = router;
