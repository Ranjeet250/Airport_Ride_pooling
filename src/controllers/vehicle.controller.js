// ─────────────────────────────────────────────
// Vehicle Controller
// ─────────────────────────────────────────────
const prisma = require('../config/prisma');
const { VEHICLE_STATUS } = require('../utils/constants');

class VehicleController {
    /**
     * GET /vehicle/available
     * List all available vehicles.
     */
    static async getAvailable(req, res, next) {
        try {
            const { limit = 20, offset = 0 } = req.query;

            const vehicles = await prisma.vehicle.findMany({
                where: { status: VEHICLE_STATUS.AVAILABLE },
                take: parseInt(limit, 10),
                skip: parseInt(offset, 10),
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    plateNumber: true,
                    driverName: true,
                    seats: true,
                    luggageCapacity: true,
                    status: true,
                    currentLat: true,
                    currentLng: true,
                },
            });

            const totalCount = await prisma.vehicle.count({
                where: { status: VEHICLE_STATUS.AVAILABLE },
            });

            return res.status(200).json({
                vehicles,
                pagination: {
                    total: totalCount,
                    limit: parseInt(limit, 10),
                    offset: parseInt(offset, 10),
                },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /vehicle/all
     * List all vehicles with any status (for admin/monitoring).
     */
    static async getAll(req, res, next) {
        try {
            const vehicles = await prisma.vehicle.findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                    ridePools: {
                        where: { status: { in: ['OPEN', 'FULL', 'IN_TRANSIT'] } },
                        select: { id: true, status: true, currentPassengers: true },
                    },
                },
            });

            return res.status(200).json({ vehicles });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = VehicleController;
