import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { createEmailTransporter, verifyEmailConfig } from './utils/emailService.js';
import { errorHandler, requestLogger, corsHandler } from './middleware/errorHandler.js';
import { setupOrderRoutes } from './routes/orders.js';
import { setupHealthRoutes } from './routes/health.js';
import { setupTestRoutes } from './routes/test.js';

// Load environment variables
dotenv.config();

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(corsHandler);
app.use(requestLogger);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Initialize email transporter
let transporter;
async function initializeEmailTransporter() {
    try {
        transporter = createEmailTransporter();
        await verifyEmailConfig(transporter);
    } catch (error) {
        console.error('Failed to initialize email transporter:', error);
        // Continue running even if email fails - routes will handle the error
    }
}

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Setup routes
setupHealthRoutes(app);

// Setup routes that require transporter (will be called after initialization)
function setupEmailDependentRoutes() {
    if (transporter) {
        setupOrderRoutes(app, transporter);
        setupTestRoutes(app, transporter);
    }
}

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📧 Email configured for: ${process.env.RECIPIENT_EMAIL}`);

    // Initialize email transporter after server starts
    await initializeEmailTransporter();
    setupEmailDependentRoutes();
});