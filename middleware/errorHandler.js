/**
 * Error handling middleware for the supply order system
 */

/**
 * Global error handler middleware
 * @param {Error} error - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function errorHandler(error, req, res, next) {
    console.error('❌ Error occurred:', error);

    // Don't expose stack trace in production
    const isDevelopment = process.env.NODE_ENV === 'development';

    const errorResponse = {
        success: false,
        message: 'An unexpected error occurred. Please try again.',
        timestamp: new Date().toISOString()
    };

    // Add specific error details in development
    if (isDevelopment) {
        errorResponse.error = error.message;
        errorResponse.errorCode = error.code;
        errorResponse.stack = error.stack;
    } else {
        // In production, add specific error details for known errors
        if (error.code === 'EAUTH' || error.code === 'ECONNECTION') {
            errorResponse.message = 'Email service is temporarily unavailable. Please try again later.';
        } else if (error.code === 'EENVELOPE') {
            errorResponse.message = 'Invalid email configuration. Please contact support.';
        }
    }

    res.status(500).json(errorResponse);
}

/**
 * Async error wrapper for route handlers
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function with error handling
 */
export function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

/**
 * Request logging middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function requestLogger(req, res, next) {
    const timestamp = new Date().toISOString();
    console.log(`📝 ${req.method} ${req.path} - ${timestamp}`);
    next();
}

/**
 * CORS configuration middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function corsHandler(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
}