# 🛫 Smart Airport Ride Pooling Backend

A production-grade backend system that intelligently pools airport passengers into shared cabs with route optimization, detour tolerance, luggage capacity, concurrency safety, and dynamic pricing.

---

## 📋 Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Algorithm](#algorithm)
- [Prerequisites](#prerequisites)
- [Setup & Run](#setup--run)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Concurrency Model](#concurrency-model)
- [Dynamic Pricing](#dynamic-pricing)
- [Folder Structure](#folder-structure)

---

## 🏗 Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Client     │────▶│   Express API    │────▶│   BullMQ Queue   │
│  (REST)      │     │   (Controllers)  │     │  (pool-matching) │
└─────────────┘     └──────┬───────────┘     └────────┬─────────┘
                           │                          │
                    ┌──────▼───────────┐     ┌────────▼─────────┐
                    │  PricingEngine   │     │   PoolWorker     │
                    │  RouteService    │     │  (PoolMatcher)   │
                    └──────┬───────────┘     └────────┬─────────┘
                           │                          │
                    ┌──────▼───────────┐     ┌────────▼─────────┐
                    │   Redis          │     │   PostgreSQL     │
                    │  (Locks + Cache) │     │   (Prisma ORM)   │
                    └──────────────────┘     └──────────────────┘
```

**Flow:**
1. Client → `POST /ride/request` → Controller validates → enqueues job to BullMQ
2. PoolWorker dequeues → acquires Redis lock → `PoolMatcher.match()` → saves to DB → releases lock
3. Client polls `GET /ride/status/:id` to check match result
4. Cancellation → `POST /ride/cancel` → `CancellationManager` → rebalance pool

---

## 🛠 Tech Stack

| Component | Technology |
|---|---|
| Backend | Node.js + Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Cache/Locking | Redis + Redlock |
| Queue | BullMQ |
| API Docs | Swagger UI (OpenAPI 3.0) |

---

## 🧠 Algorithm — Greedy Spatial Clustering with Incremental Insertion

### How Pool Matching Works

```
For each new RideRequest R:
  1. Acquire Redis distributed lock
  2. Fetch all OPEN pools with available capacity
  3. For each candidate pool P:
     a. Compute current optimal route cost
     b. Simulate inserting R into P's route
     c. Find optimal drop-off ordering (brute-force permutation, N≤4)
     d. Validate ALL passengers' detour tolerances
     e. Score = new_route_cost / old_route_cost (lower = better)
  4. Select the pool with LOWEST score where all constraints pass
  5. If no valid pool exists → create new pool + assign vehicle
  6. Calculate dynamic price → update DB → release lock
```

### Complexity

| Operation | Time | Space |
|---|---|---|
| Fetch open pools | O(P) | O(P) |
| Route optimization per pool | O(N!) where N ≤ 4 | O(N) |
| **Total per request** | **O(P × 24)** | O(P) |

---

## ✅ Prerequisites

1. **Node.js** v18+
2. **PostgreSQL** — running on `localhost:5432`
3. **Redis** — running on `localhost:6379`

### Quick install (if not already):

**PostgreSQL:**
- Download from https://www.postgresql.org/download/
- Create a database called `airport_pooling`

**Redis:**
- Windows: Download from https://github.com/microsoftarchive/redis/releases
  OR use Docker: `docker run -d -p 6379:6379 redis`
- Linux/Mac: `sudo apt install redis-server` / `brew install redis`

---

## 🚀 Setup & Run

```bash
# 1. Navigate to the project
cd C:\Users\ranje\.gemini\antigravity\scratch\airport-ride-pooling

# 2. Install dependencies (already done)
npm install

# 3. Configure environment
# Edit .env file with your PostgreSQL and Redis credentials

# 4. Setup database (generate Prisma client + push schema + seed data)
npm run db:setup

# 5. Start the server
npm run dev
```

The server will start at **http://localhost:3000**
Swagger docs at **http://localhost:3000/api-docs**

---

## 📡 API Reference

### `POST /ride/request` — Create a ride request
```json
{
  "passengerId": "uuid",
  "destLat": 13.0827,
  "destLng": 80.2707,
  "destAddress": "T. Nagar, Chennai",
  "luggageCount": 2,
  "maxDetourRatio": 1.4
}
```
**Response:** `201` — ride request created, pool matching enqueued.

### `POST /ride/cancel` — Cancel a ride request
```json
{ "rideRequestId": "uuid" }
```
**Response:** `200` — ride cancelled, pool rebalanced.

### `GET /ride/pool/:id` — Get pool details
**Response:** Pool with vehicle, passengers, pickup order, prices.

### `GET /ride/status/:id` — Check ride request status
Poll this after request to see if you've been matched.

### `GET /vehicle/available` — List available vehicles
Query params: `limit`, `offset`

### `GET /pricing/estimate` — Quick fare estimate
Query params: `destLat`, `destLng`, `isPooled`

### `GET /health` — Health check
Returns DB + Redis connection status.

### `GET /queue/health` — Queue metrics
Returns waiting/active/completed/failed job counts.

---

## 🗄 Database Schema

```
passengers          vehicles             ride_pools
├─ id (PK, UUID)    ├─ id (PK, UUID)     ├─ id (PK, UUID)
├─ name             ├─ plate_number (UQ)  ├─ vehicle_id (FK)
├─ email (UQ)       ├─ driver_name        ├─ status
├─ phone            ├─ seats              ├─ version (optimistic lock)
└─ created_at       ├─ luggage_capacity   ├─ route_cost
                    ├─ status [IDX]       ├─ current_passengers
                    ├─ current_lat        ├─ current_luggage
                    └─ current_lng        └─ created_at

ride_requests                pool_passengers
├─ id (PK, UUID)             ├─ id (PK, UUID)
├─ passenger_id (FK) [IDX]   ├─ pool_id (FK) [IDX]
├─ pool_id (FK) [IDX]        ├─ ride_request_id (FK, UQ)
├─ dest_lat, dest_lng        ├─ pickup_order
├─ dest_address              └─ created_at
├─ luggage_count
├─ max_detour_ratio
├─ status [IDX]
├─ price
└─ created_at
```

---

## 🔒 Concurrency Model

**Two-layer concurrency control:**

1. **Redis Distributed Lock (Redlock)** — acquired before pool matching to prevent two workers from assigning the same pool slot simultaneously.

2. **Optimistic Locking** — `version` column on `ride_pools`. Updates use `WHERE version = currentVersion`, failing if another transaction modified the pool.

```javascript
// Acquire Redis lock → prevents concurrent matching
const lock = await lockManager.acquire('lock:pool-matching', 5000);
try {
  // Optimistic lock → catches any race condition that slipped through
  const updated = await prisma.ridePool.updateMany({
    where: { id: poolId, version: currentVersion },
    data: { version: currentVersion + 1, ... }
  });
  if (updated.count === 0) throw new ConflictError('Pool was modified');
} finally {
  await lock.release();
}
```

---

## 💰 Dynamic Pricing

```
Price = (BaseFare + DistanceRate × Distance) × DemandMultiplier
        − PoolDiscount + DetourPenalty

Where:
  BaseFare         = ₹50
  DistanceRate     = ₹12/km
  DemandMultiplier = 1.0 – 2.5 (pending_requests / available_vehicles)
  PoolDiscount     = 25% of subtotal (if pooled)
  DetourPenalty    = ₹5 per extra km of detour
```

---

## 📁 Folder Structure

```
airport-ride-pooling/
├── .env                           # Environment variables
├── .env.example                   # Template
├── package.json                   # Scripts & dependencies
├── prisma/
│   ├── schema.prisma              # Database schema (5 tables)
│   └── seed.js                    # Test data seeder
├── docs/
│   └── swagger.yaml               # OpenAPI 3.0 spec
├── src/
│   ├── index.js                   # Express app entry point
│   ├── config/
│   │   ├── index.js               # App configuration
│   │   ├── prisma.js              # PrismaClient singleton
│   │   └── redis.js               # Redis client + factory
│   ├── controllers/
│   │   ├── ride.controller.js     # Ride request/cancel/pool
│   │   ├── vehicle.controller.js  # Vehicle listing
│   │   └── pricing.controller.js  # Fare estimation
│   ├── services/
│   │   ├── pool-matcher.js        # ★ Core matching algorithm
│   │   ├── route.service.js       # Haversine + route optimizer
│   │   ├── pricing-engine.js      # Dynamic pricing
│   │   ├── cancellation-manager.js # Cancel + rebalance
│   │   ├── lock-manager.js        # Redis distributed locks
│   │   └── queue.service.js       # BullMQ producer
│   ├── workers/
│   │   └── pool.worker.js         # BullMQ consumer
│   ├── middleware/
│   │   ├── error-handler.js       # Global error handler
│   │   └── rate-limiter.js        # Rate limiting
│   ├── routes/
│   │   ├── ride.routes.js
│   │   ├── vehicle.routes.js
│   │   └── pricing.routes.js
│   └── utils/
│       └── constants.js           # Enums, queue names, lock keys
└── README.md
```

---

## 📊 Test Data

The seeder (`npm run db:seed`) creates:
- **10 vehicles** at the airport
- **15 passengers** with phone numbers
- **8 pending ride requests** to various Chennai locations (ready for pool matching)

After seeding, start the server and the BullMQ worker will automatically process the pending requests, grouping compatible passengers into pools.

---

## License

MIT
