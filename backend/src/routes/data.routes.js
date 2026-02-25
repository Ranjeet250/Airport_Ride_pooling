// ─────────────────────────────────────────────
// Data Routes — Airports & Destinations
// ─────────────────────────────────────────────
const { Router } = require('express');
const DataController = require('../controllers/data.controller');

const router = Router();

// GET /data/airports — List all airports
router.get('/airports', DataController.getAirports);

// GET /data/destinations — All destinations grouped by airport
router.get('/destinations', DataController.getAllDestinations);

// GET /data/destinations/:airportId — Destinations for a specific airport
router.get('/destinations/:airportId', DataController.getDestinations);

module.exports = router;
