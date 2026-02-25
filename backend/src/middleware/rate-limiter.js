// ─────────────────────────────────────────────
// Rate Limiter Middleware
// ─────────────────────────────────────────────
const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 200,                // 200 requests per minute per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many requests. Please try again later.',
    },
});

// Stricter limiter for ride requests (prevent spam)
const rideRequestLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10, // 10 ride requests per minute per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many ride requests. Please wait before trying again.',
    },
});

module.exports = { apiLimiter, rideRequestLimiter };
