// ─────────────────────────────────────────────
// Airport Ride Pooling — Main Entry Point
// ─────────────────────────────────────────────
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const config = require('./config');
const errorHandler = require('./middleware/error-handler');
const { apiLimiter, rideRequestLimiter } = require('./middleware/rate-limiter');
const rideRoutes = require('./routes/ride.routes');
const vehicleRoutes = require('./routes/vehicle.routes');
const pricingRoutes = require('./routes/pricing.routes');
const passengerRoutes = require('./routes/passenger.routes');
const dataRoutes = require('./routes/data.routes');
const { startPoolWorker, stopPoolWorker } = require('./workers/pool.worker');

const app = express();

// ── Middleware ─────────────────────────────────
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(apiLimiter);

// ── Swagger Docs ──────────────────────────────
try {
    const swaggerUi = require('swagger-ui-express');
    const YAML = require('yamljs');
    const swaggerDoc = YAML.load(path.join(__dirname, '..', 'docs', 'swagger.yaml'));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Airport Ride Pooling API',
    }));
} catch (err) {
    console.warn('⚠️  Swagger doc not loaded:', err.message);
}

// ── Routes ────────────────────────────────────
app.use('/ride', rideRoutes);
app.use('/vehicle', vehicleRoutes);
app.use('/pricing', pricingRoutes);
app.use('/passenger', passengerRoutes);
app.use('/data', dataRoutes);

// Apply stricter rate limit to ride request endpoint
app.use('/ride/request', rideRequestLimiter);

// ── Health Check ──────────────────────────────
app.get('/health', async (req, res) => {
    const prisma = require('./config/prisma');
    const { redis } = require('./config/redis');

    let dbOk = false;
    let redisOk = false;

    try {
        await prisma.$queryRaw`SELECT 1`;
        dbOk = true;
    } catch (e) { /* DB not available */ }

    try {
        const pong = await redis.ping();
        redisOk = pong === 'PONG';
    } catch (e) { /* Cache not available */ }

    const status = dbOk ? 200 : 503;
    res.status(status).json({
        status: dbOk ? 'healthy' : 'degraded',
        services: {
            database: dbOk ? 'connected' : 'disconnected',
            cache: redisOk ? 'connected (in-memory)' : 'disconnected',
        },
        timestamp: new Date().toISOString(),
    });
});

// ── Queue Health ──────────────────────────────
app.get('/queue/health', async (req, res) => {
    try {
        const queueService = require('./services/queue.service');
        const health = await queueService.getQueueHealth();
        res.status(200).json(health);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ── Error Handler ─────────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────
async function start() {
    try {
        // Start the pool matching worker
        startPoolWorker();

        app.listen(config.port, () => {
            console.log(`
╔═══════════════════════════════════════════════════╗
║   🛫  Airport Ride Pooling API                    ║
║   🌐  http://localhost:${config.port}                    ║
║   📚  http://localhost:${config.port}/api-docs             ║
║   🔧  Environment: ${config.nodeEnv.padEnd(22)}       ║
║   💾  Database: PostgreSQL                        ║
║   🔒  Locks: In-memory mutex                      ║
║   📨  Queue: In-memory async                      ║
╚═══════════════════════════════════════════════════╝
      `);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down...');
    await stopPoolWorker();
    const prisma = require('./config/prisma');
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down...');
    await stopPoolWorker();
    const prisma = require('./config/prisma');
    await prisma.$disconnect();
    process.exit(0);
});

start();

module.exports = app;
