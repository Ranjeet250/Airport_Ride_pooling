// ─────────────────────────────────────────────
// Database Seeder — Test Data
// ─────────────────────────────────────────────
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ── Vehicles (10 vehicles at the airport) ───────
const vehicles = [
    { plateNumber: 'TN-01-AB-1234', driverName: 'Rajesh Kumar', seats: 4, luggageCapacity: 4, currentLat: 12.9941, currentLng: 80.1709 },
    { plateNumber: 'TN-01-CD-5678', driverName: 'Suresh Reddy', seats: 4, luggageCapacity: 4, currentLat: 12.9941, currentLng: 80.1709 },
    { plateNumber: 'TN-01-EF-9012', driverName: 'Amir Khan', seats: 4, luggageCapacity: 3, currentLat: 12.9941, currentLng: 80.1709 },
    { plateNumber: 'TN-01-GH-3456', driverName: 'Priya Sharma', seats: 6, luggageCapacity: 6, currentLat: 12.9941, currentLng: 80.1709 },
    { plateNumber: 'TN-01-IJ-7890', driverName: 'Vikram Singh', seats: 4, luggageCapacity: 4, currentLat: 12.9941, currentLng: 80.1709 },
    { plateNumber: 'TN-01-KL-2345', driverName: 'Deepa Nair', seats: 4, luggageCapacity: 4, currentLat: 12.9941, currentLng: 80.1709 },
    { plateNumber: 'TN-01-MN-6789', driverName: 'Mohammed Ali', seats: 6, luggageCapacity: 5, currentLat: 12.9941, currentLng: 80.1709 },
    { plateNumber: 'TN-01-OP-0123', driverName: 'Kavitha Rajan', seats: 4, luggageCapacity: 4, currentLat: 12.9941, currentLng: 80.1709 },
    { plateNumber: 'TN-01-QR-4567', driverName: 'Sundar Pichai', seats: 4, luggageCapacity: 3, currentLat: 12.9941, currentLng: 80.1709 },
    { plateNumber: 'TN-01-ST-8901', driverName: 'Lakshmi Devi', seats: 4, luggageCapacity: 4, currentLat: 12.9941, currentLng: 80.1709 },
];

// ── Passengers (15 passengers) ──────────────────
const passengers = [
    { name: 'Arjun Mehta', email: 'arjun@example.com', phone: '+91-9876543210' },
    { name: 'Sneha Patel', email: 'sneha@example.com', phone: '+91-9876543211' },
    { name: 'Rahul Gupta', email: 'rahul@example.com', phone: '+91-9876543212' },
    { name: 'Divya Krishnan', email: 'divya@example.com', phone: '+91-9876543213' },
    { name: 'Karthik Iyer', email: 'karthik@example.com', phone: '+91-9876543214' },
    { name: 'Ananya Rao', email: 'ananya@example.com', phone: '+91-9876543215' },
    { name: 'Nikhil Joshi', email: 'nikhil@example.com', phone: '+91-9876543216' },
    { name: 'Meera Sundaram', email: 'meera@example.com', phone: '+91-9876543217' },
    { name: 'Aditya Verma', email: 'aditya@example.com', phone: '+91-9876543218' },
    { name: 'Pooja Desai', email: 'pooja@example.com', phone: '+91-9876543219' },
    { name: 'Sanjay Pillai', email: 'sanjay@example.com', phone: '+91-9876543220' },
    { name: 'Riya Banerjee', email: 'riya@example.com', phone: '+91-9876543221' },
    { name: 'Venkat Subramani', email: 'venkat@example.com', phone: '+91-9876543222' },
    { name: 'Fatima Begum', email: 'fatima@example.com', phone: '+91-9876543223' },
    { name: 'Ganesh Naidu', email: 'ganesh@example.com', phone: '+91-9876543224' },
];

// ── Ride Requests (destinations around Chennai) ──
// These will be created after passengers are seeded
const destinations = [
    { destLat: 13.0827, destLng: 80.2707, destAddress: 'T. Nagar, Chennai', luggageCount: 2, maxDetourRatio: 1.4 },
    { destLat: 13.0604, destLng: 80.2496, destAddress: 'Adyar, Chennai', luggageCount: 1, maxDetourRatio: 1.5 },
    { destLat: 13.0878, destLng: 80.2785, destAddress: 'Mylapore, Chennai', luggageCount: 1, maxDetourRatio: 1.3 },
    { destLat: 13.0674, destLng: 80.2376, destAddress: 'Guindy, Chennai', luggageCount: 3, maxDetourRatio: 1.4 },
    { destLat: 13.1067, destLng: 80.2840, destAddress: 'Egmore, Chennai', luggageCount: 1, maxDetourRatio: 1.6 },
    { destLat: 13.0569, destLng: 80.2425, destAddress: 'Velachery, Chennai', luggageCount: 2, maxDetourRatio: 1.4 },
    { destLat: 13.0418, destLng: 80.2341, destAddress: 'Tambaram, Chennai', luggageCount: 1, maxDetourRatio: 1.5 },
    { destLat: 13.0891, destLng: 80.2921, destAddress: 'Anna Nagar, Chennai', luggageCount: 2, maxDetourRatio: 1.3 },
    { destLat: 13.0500, destLng: 80.2121, destAddress: 'Chromepet, Chennai', luggageCount: 1, maxDetourRatio: 1.5 },
    { destLat: 13.1143, destLng: 80.2853, destAddress: 'Kilpauk, Chennai', luggageCount: 2, maxDetourRatio: 1.4 },
    { destLat: 13.0633, destLng: 80.2600, destAddress: 'Thiruvanmiyur, Chennai', luggageCount: 1, maxDetourRatio: 1.6 },
    { destLat: 13.0000, destLng: 80.2200, destAddress: 'Pallavaram, Chennai', luggageCount: 2, maxDetourRatio: 1.3 },
    { destLat: 13.0970, destLng: 80.2500, destAddress: 'Ashok Nagar, Chennai', luggageCount: 1, maxDetourRatio: 1.5 },
    { destLat: 13.0350, destLng: 80.1800, destAddress: 'Meenambakkam, Chennai', luggageCount: 3, maxDetourRatio: 1.4 },
    { destLat: 13.1200, destLng: 80.2300, destAddress: 'Perambur, Chennai', luggageCount: 1, maxDetourRatio: 1.5 },
];

async function seed() {
    console.log('🌱 Seeding database...\n');

    // Clean existing data
    console.log('  🗑️  Cleaning existing data...');
    await prisma.poolPassenger.deleteMany();
    await prisma.rideRequest.deleteMany();
    await prisma.ridePool.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.passenger.deleteMany();

    // Seed vehicles
    console.log('  🚗 Creating vehicles...');
    const createdVehicles = [];
    for (const v of vehicles) {
        const vehicle = await prisma.vehicle.create({ data: v });
        createdVehicles.push(vehicle);
        console.log(`     ✅ ${vehicle.plateNumber} — ${vehicle.driverName}`);
    }

    // Seed passengers
    console.log('\n  👤 Creating passengers...');
    const createdPassengers = [];
    for (const p of passengers) {
        const passenger = await prisma.passenger.create({ data: p });
        createdPassengers.push(passenger);
        console.log(`     ✅ ${passenger.name} (${passenger.email})`);
    }

    // Seed ride requests (first 8 passengers get pre-created requests)
    console.log('\n  🎫 Creating ride requests...');
    const createdRequests = [];
    for (let i = 0; i < 8; i++) {
        const rr = await prisma.rideRequest.create({
            data: {
                passengerId: createdPassengers[i].id,
                ...destinations[i],
                status: 'PENDING',
            },
        });
        createdRequests.push(rr);
        console.log(`     ✅ ${createdPassengers[i].name} → ${destinations[i].destAddress}`);
    }

    console.log(`
╔═══════════════════════════════════════════════════╗
║  🌱 Seeding Complete!                             ║
║                                                   ║
║  Vehicles:      ${String(createdVehicles.length).padEnd(5)}                            ║
║  Passengers:    ${String(createdPassengers.length).padEnd(5)}                            ║
║  Ride Requests: ${String(createdRequests.length).padEnd(5)}  (PENDING — ready to match) ║
║                                                   ║
║  Passenger IDs for testing:                       ║
║  ${createdPassengers[0].id}    ║
║  ${createdPassengers[1].id}    ║
║  ${createdPassengers[2].id}    ║
╚═══════════════════════════════════════════════════╝
  `);
}

seed()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
