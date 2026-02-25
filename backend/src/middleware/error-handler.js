// ─────────────────────────────────────────────
// Global Error Handler Middleware
// ─────────────────────────────────────────────

function errorHandler(err, req, res, _next) {
    console.error('🚨 Unhandled Error:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        url: req.originalUrl,
        method: req.method,
    });

    // Prisma known errors
    if (err.code === 'P2002') {
        return res.status(409).json({
            error: 'Duplicate entry. Resource already exists.',
            field: err.meta?.target,
        });
    }

    if (err.code === 'P2025') {
        return res.status(404).json({
            error: 'Resource not found.',
        });
    }

    // Redis/Lock errors
    if (err.name === 'LockError') {
        return res.status(503).json({
            error: 'Service temporarily busy. Please retry.',
        });
    }

    // Default
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
}

module.exports = errorHandler;
