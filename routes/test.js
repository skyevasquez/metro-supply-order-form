/**
 * Test routes for the supply order system
 */
import { sendTestEmail } from '../utils/emailService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Handle test email request
 * @param {Object} transporter - Email transporter
 * @returns {Function} Express route handler
 */
export function createTestEmailHandler(transporter) {
    return asyncHandler(async (req, res) => {
        try {
            console.log('🧪 Testing email configuration...');

            const result = await sendTestEmail(transporter);

            res.json({
                success: true,
                message: 'Test email sent successfully!',
                messageId: result.messageId,
                recipients: process.env.RECIPIENT_EMAIL,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('❌ Test email failed:', {
                type: error.constructor.name,
                message: error.message,
                code: error.code
            });

            res.status(500).json({
                success: false,
                message: 'Test email failed',
                error: error.message,
                errorCode: error.code,
                timestamp: new Date().toISOString()
            });
        }
    });
}

/**
 * Setup test routes
 * @param {Object} app - Express app
 * @param {Object} transporter - Email transporter
 */
export function setupTestRoutes(app, transporter) {
    const testHandler = createTestEmailHandler(transporter);

    app.post('/test-email', testHandler);
    app.post('/api/test-email', testHandler);
}