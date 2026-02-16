// ─────────────────────────────────────────────
// In-Memory Queue Service (BullMQ replacement)
// ─────────────────────────────────────────────
// Processes pool matching jobs using an in-memory
// async queue. Same producer interface as BullMQ.
// In production, swap to real BullMQ + Redis.
// ─────────────────────────────────────────────

const { EventEmitter } = require('events');

class InMemoryQueue extends EventEmitter {
    constructor(name) {
        super();
        this.name = name;
        this.jobs = [];
        this.completed = 0;
        this.failed = 0;
        this.processing = false;
        this.processor = null;
    }

    async add(jobName, data, opts = {}) {
        const job = {
            id: opts.jobId || `${jobName}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            name: jobName,
            data,
            attempts: 0,
            maxAttempts: 3,
        };
        this.jobs.push(job);
        console.log(`📤 Enqueued job: ${job.id}`);

        // Auto-process
        this._processNext();

        return job;
    }

    setProcessor(fn) {
        this.processor = fn;
    }

    async _processNext() {
        if (this.processing || this.jobs.length === 0 || !this.processor) return;

        this.processing = true;
        const job = this.jobs.shift();

        try {
            job.attempts++;
            const result = await this.processor(job);
            this.completed++;
            this.emit('completed', job, result);
            console.log(`📦 Job ${job.id} completed`);
        } catch (error) {
            this.failed++;
            console.error(`💥 Job ${job.id} failed (attempt ${job.attempts}):`, error.message);

            // Retry logic
            if (job.attempts < job.maxAttempts) {
                const delay = Math.pow(2, job.attempts) * 1000;
                console.log(`🔄 Retrying job ${job.id} in ${delay}ms...`);
                setTimeout(() => {
                    this.jobs.push(job);
                    this._processNext();
                }, delay);
            } else {
                this.emit('failed', job, error);
            }
        } finally {
            this.processing = false;
            // Process next job if queue has more
            if (this.jobs.length > 0) {
                setImmediate(() => this._processNext());
            }
        }
    }

    async getWaitingCount() { return this.jobs.length; }
    async getActiveCount() { return this.processing ? 1 : 0; }
    async getCompletedCount() { return this.completed; }
    async getFailedCount() { return this.failed; }
    async close() { this.jobs = []; }
}

class QueueService {
    constructor() {
        this.poolMatchingQueue = new InMemoryQueue('pool-matching');
        console.log('✅ In-memory queue initialized: pool-matching');
    }

    /**
     * Enqueue a ride request for pool matching.
     */
    async enqueuePoolMatching(rideRequestId) {
        const job = await this.poolMatchingQueue.add(
            'match-ride',
            { rideRequestId },
            { jobId: `match-${rideRequestId}` }
        );
        return job;
    }

    /**
     * Get queue health metrics.
     */
    async getQueueHealth() {
        return {
            waiting: await this.poolMatchingQueue.getWaitingCount(),
            active: await this.poolMatchingQueue.getActiveCount(),
            completed: await this.poolMatchingQueue.getCompletedCount(),
            failed: await this.poolMatchingQueue.getFailedCount(),
        };
    }

    async close() {
        await this.poolMatchingQueue.close();
    }
}

// Singleton
module.exports = new QueueService();
