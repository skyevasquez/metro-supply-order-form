/**
 * Health check routes for the supply order system
 */

/**
 * Health check response
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export function healthCheck(req, res) {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
}

/**
 * Setup health check routes
 * @param {Object} app - Express app
 */
export function setupHealthRoutes(app) {
    // Health check endpoints (mirror Vercel API route locally)
    app.get('/health', healthCheck);
    app.get('/api/health', healthCheck);
}