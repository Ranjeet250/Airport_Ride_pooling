require('dotenv').config();

module.exports = {
    port: parseInt(process.env.PORT, 10) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',

    database: {
        url: process.env.DATABASE_URL,
    },

    redis: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
    },

    pricing: {
        baseFare: parseFloat(process.env.BASE_FARE) || 50,
        distanceRate: parseFloat(process.env.DISTANCE_RATE) || 12,
        maxDemandMultiplier: parseFloat(process.env.MAX_DEMAND_MULTIPLIER) || 2.5,
        poolDiscountPercent: parseFloat(process.env.POOL_DISCOUNT_PERCENT) || 25,
        detourPenaltyPerKm: parseFloat(process.env.DETOUR_PENALTY_PER_KM) || 5,
    },

    // Airport coordinates (Chennai Airport as default)
    airport: {
        lat: 12.9941,
        lng: 80.1709,
        name: 'Chennai International Airport',
    },

    pool: {
        maxPassengers: 4,
        lockTTLMs: 5000,       // Redis lock TTL
        matchingTimeoutMs: 300, // 300ms SLA
    },
};
