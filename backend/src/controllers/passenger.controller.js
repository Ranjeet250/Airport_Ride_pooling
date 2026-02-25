// ─────────────────────────────────────────────
// Passenger Controller
// ─────────────────────────────────────────────
const prisma = require('../config/prisma');

/**
 * POST /passenger/login
 * Login — find passenger by email
 */
exports.login = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const passenger = await prisma.passenger.findUnique({
            where: { email: email.toLowerCase().trim() },
        });

        if (!passenger) {
            return res.status(404).json({ error: 'No account found with this email. Please register first.' });
        }

        res.json({
            success: true,
            passenger: {
                id: passenger.id,
                name: passenger.name,
                email: passenger.email,
                phone: passenger.phone,
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * POST /passenger/register
 * Create a new passenger account
 */
exports.register = async (req, res) => {
    try {
        const { name, email, phone } = req.body;

        if (!name || !email || !phone) {
            return res.status(400).json({ error: 'Name, email, and phone are required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Validate phone (at least 10 digits)
        const phoneClean = phone.replace(/\D/g, '');
        if (phoneClean.length < 10) {
            return res.status(400).json({ error: 'Phone must have at least 10 digits' });
        }

        // Check if email already exists
        const existing = await prisma.passenger.findUnique({
            where: { email: email.toLowerCase().trim() },
        });

        if (existing) {
            return res.status(409).json({ error: 'An account with this email already exists. Please login.' });
        }

        const passenger = await prisma.passenger.create({
            data: {
                name: name.trim(),
                email: email.toLowerCase().trim(),
                phone: phone.trim(),
            },
        });

        res.status(201).json({
            success: true,
            passenger: {
                id: passenger.id,
                name: passenger.name,
                email: passenger.email,
                phone: passenger.phone,
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * GET /passenger/all
 * List all passengers
 */
exports.getAll = async (req, res) => {
    try {
        const passengers = await prisma.passenger.findMany({
            select: { id: true, name: true, email: true, phone: true },
            orderBy: { name: 'asc' },
        });
        res.json({ passengers });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
