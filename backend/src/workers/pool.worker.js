// ─────────────────────────────────────────────
// Pool Worker — In-Memory Queue Consumer
// ─────────────────────────────────────────────
// Processes pool matching jobs from the in-memory queue.
// Same logic as the BullMQ version, just no Redis.
// ─────────────────────────────────────────────

const queueService = require('../services/queue.service');
const PoolMatcher = require('../services/pool-matcher');

function startPoolWorker() {
    const queue = queueService.poolMatchingQueue;

    // Set the processor function
    queue.setProcessor(async (job) => {
        const { rideRequestId } = job.data;
        console.log(`🔄 Processing pool matching for request: ${rideRequestId}`);

        try {
            const result = await PoolMatcher.match(rideRequestId);
            console.log(
                `✅ Matched request ${rideRequestId} → pool ${result.poolId} | price ₹${result.price} | new=${result.isNewPool}`
            );
            return result;
        } catch (error) {
            console.error(`❌ Pool matching failed for ${rideRequestId}:`, error.message);
            throw error;
        }
    });

    queue.on('completed', (job, result) => {
        // Already logged in processor
    });

    queue.on('failed', (job, err) => {
        console.error(`💥 Job ${job?.id} permanently failed after all retries:`, err.message);
    });

    console.log('✅ Pool matching worker started (in-memory mode)');
}

async function stopPoolWorker() {
    await queueService.close();
    console.log('🛑 Pool matching worker stopped');
}

module.exports = { startPoolWorker, stopPoolWorker };
