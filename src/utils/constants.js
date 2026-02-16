// ─────────────────────────────────────────────
// Shared Constants
// ─────────────────────────────────────────────

module.exports = {
    // Queue names
    QUEUES: {
        POOL_MATCHING: 'pool-matching',
    },

    // Pool statuses
    POOL_STATUS: {
        OPEN: 'OPEN',
        FULL: 'FULL',
        IN_TRANSIT: 'IN_TRANSIT',
        COMPLETED: 'COMPLETED',
        CANCELLED: 'CANCELLED',
    },

    // Ride request statuses
    REQUEST_STATUS: {
        PENDING: 'PENDING',
        MATCHED: 'MATCHED',
        CANCELLED: 'CANCELLED',
        COMPLETED: 'COMPLETED',
    },

    // Vehicle statuses
    VEHICLE_STATUS: {
        AVAILABLE: 'AVAILABLE',
        ASSIGNED: 'ASSIGNED',
        OFF_DUTY: 'OFF_DUTY',
    },

    // Lock keys
    LOCK_KEYS: {
        POOL_MATCHING: 'lock:pool-matching',
        POOL_PREFIX: 'lock:pool:',
    },

    // Earth radius in km (for Haversine)
    EARTH_RADIUS_KM: 6371,
};
