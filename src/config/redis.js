// ─────────────────────────────────────────────
// In-Memory Redis Replacement
// ─────────────────────────────────────────────
// No Redis required! Provides the same interface
// for local development on Windows.
// In production, swap this back to real Redis.
// ─────────────────────────────────────────────

class InMemoryRedis {
    constructor() {
        this.store = new Map();
        this.connected = true;
        console.log('✅ In-memory cache initialized (Redis replacement)');
    }

    async ping() {
        return 'PONG';
    }

    async get(key) {
        return this.store.get(key) || null;
    }

    async set(key, value, ...args) {
        this.store.set(key, value);
        // Handle EX (expiry in seconds)
        if (args[0] === 'EX' && args[1]) {
            setTimeout(() => this.store.delete(key), args[1] * 1000);
        }
        return 'OK';
    }

    async del(key) {
        this.store.delete(key);
        return 1;
    }

    async incr(key) {
        const val = parseInt(this.store.get(key) || '0', 10) + 1;
        this.store.set(key, String(val));
        return val;
    }

    on(event, handler) {
        if (event === 'connect') handler();
    }

    async quit() {
        this.store.clear();
    }
}

const redis = new InMemoryRedis();

function createRedisConnection() {
    return new InMemoryRedis();
}

module.exports = { redis, createRedisConnection };
