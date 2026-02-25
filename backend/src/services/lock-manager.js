// ─────────────────────────────────────────────
// In-Memory Lock Manager (Redis-free)
// ─────────────────────────────────────────────
// Uses in-memory mutexes for concurrency safety.
// Same interface as the Redlock version.
// In production, swap to real Redlock + Redis.
// ─────────────────────────────────────────────

class LockManager {
    constructor() {
        this.locks = new Map(); // key → { resolve, timeout }
        console.log('✅ In-memory lock manager initialized');
    }

    /**
     * Acquire a lock. Waits if the lock is already held.
     * @param {string} resource - Lock key
     * @param {number} ttl - Lock TTL in ms (auto-release safety)
     * @returns {Promise<{release: Function}>}
     */
    async acquire(resource, ttl = 5000) {
        // Wait for existing lock to release
        while (this.locks.has(resource)) {
            await new Promise((resolve) => setTimeout(resolve, 50));
        }

        // Acquire
        let releaseResolve;
        const lockPromise = new Promise((resolve) => {
            releaseResolve = resolve;
        });

        const timeoutId = setTimeout(() => {
            // Auto-release if TTL expires (safety net)
            this.locks.delete(resource);
            releaseResolve();
        }, ttl);

        this.locks.set(resource, { releaseResolve, timeoutId });

        return {
            release: async () => {
                clearTimeout(timeoutId);
                this.locks.delete(resource);
                releaseResolve();
            },
        };
    }

    /**
     * Execute a function while holding a lock.
     * Lock is automatically released after fn completes.
     */
    async withLock(resource, fn, ttl = 5000) {
        const lock = await this.acquire(resource, ttl);
        try {
            return await fn();
        } finally {
            await lock.release();
        }
    }
}

// Singleton
module.exports = new LockManager();
