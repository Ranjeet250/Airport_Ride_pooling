// ─────────────────────────────────────────────
// Passenger Routes
// ─────────────────────────────────────────────
const { Router } = require('express');
const PassengerController = require('../controllers/passenger.controller');

const router = Router();

// POST /passenger/login — Login by email
router.post('/login', PassengerController.login);

// POST /passenger/register — Create new account
router.post('/register', PassengerController.register);

// GET /passenger/all — List all passengers
router.get('/all', PassengerController.getAll);

module.exports = router;
