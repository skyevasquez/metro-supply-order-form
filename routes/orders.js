/**
 * Order routes for the supply order system
 */
import { sendOrderEmail } from '../utils/emailService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateOrderSubmission } from '../middleware/validation.js';

/**
 * Handle order submission
 * @param {Object} transporter - Email transporter
 * @returns {Function} Express route handler
 */
export function createOrderSubmissionHandler(transporter) {
    return asyncHandler(async (req, res) => {
        console.log('📝 Form submission received at:', new Date().toISOString());
        console.log('📦 Request body:', JSON.stringify(req.body, null, 2));

        try {
            const result = await sendOrderEmail(transporter, req.body);

            res.json({
                success: true,
                message: 'Order submitted successfully! Email has been sent.',
                messageId: result.messageId,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('❌ Error sending email:', {
                type: error.constructor.name,
                message: error.message,
                code: error.code
            });

            res.status(500).json({
                success: false,
                message: 'Failed to submit order. Please try again.',
                error: error.message,
                errorCode: error.code,
                timestamp: new Date().toISOString()
            });
        }
    });
}

/**
 * Setup order routes
 * @param {Object} app - Express app
 * @param {Object} transporter - Email transporter
 */
export function setupOrderRoutes(app, transporter) {
    const orderHandler = createOrderSubmissionHandler(transporter);

    // Handle form submission
    app.post('/submit-order', validateOrderSubmission, orderHandler);

    // Mirror Vercel function route for local dev
    app.post('/api/submit-order', validateOrderSubmission, orderHandler);
}