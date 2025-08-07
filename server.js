const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Email transporter configuration
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Verify email configuration
transporter.verify((error, success) => {
    if (error) {
        console.log('Email configuration error:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle form submission
app.post('/submit-order', async (req, res) => {
    console.log('📝 Form submission received at:', new Date().toISOString());
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    
    try {
        const {
            employeeName,
            store,
            orderDate,
            officeSupplies,
            cleaningSupplies,
            additionalNotes
        } = req.body;

        // Format the email content
        let emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #e91e63, #ad1457); color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">📋 New Supply Order Request</h1>
                <p style="margin: 5px 0 0 0;">Metro by T-Mobile</p>
            </div>
            
            <div style="padding: 20px; background-color: #f9f9f9;">
                <h2 style="color: #333; border-bottom: 2px solid #e91e63; padding-bottom: 10px;">Order Details</h2>
                
                <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <p><strong>Employee Name:</strong> ${employeeName}</p>
                    <p><strong>Store Location:</strong> ${store}</p>
                    <p><strong>Order Date:</strong> ${new Date(orderDate).toLocaleDateString()}</p>
                </div>
        `;

        // Add office supplies section
        if (officeSupplies && officeSupplies.length > 0) {
            emailContent += `
                <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h3 style="color: #e91e63; margin-top: 0;">🖊️ Office Supplies</h3>
                    <ul style="list-style-type: none; padding: 0;">
            `;
            
            officeSupplies.forEach(item => {
                if (item.name && item.quantity) {
                    emailContent += `<li style="padding: 5px 0; border-bottom: 1px solid #eee;"><strong>${item.name}:</strong> ${item.quantity}</li>`;
                }
            });
            
            emailContent += `</ul></div>`;
        }

        // Add cleaning supplies section
        if (cleaningSupplies && cleaningSupplies.length > 0) {
            emailContent += `
                <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h3 style="color: #e91e63; margin-top: 0;">🧽 Cleaning Supplies</h3>
                    <ul style="list-style-type: none; padding: 0;">
            `;
            
            cleaningSupplies.forEach(item => {
                if (item.name && item.quantity) {
                    emailContent += `<li style="padding: 5px 0; border-bottom: 1px solid #eee;"><strong>${item.name}:</strong> ${item.quantity}</li>`;
                }
            });
            
            emailContent += `</ul></div>`;
        }

        // Add additional notes if provided
        if (additionalNotes && additionalNotes.trim()) {
            emailContent += `
                <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h3 style="color: #e91e63; margin-top: 0;">📝 Additional Notes</h3>
                    <p style="background: #f8f8f8; padding: 10px; border-radius: 4px; border-left: 4px solid #e91e63;">${additionalNotes}</p>
                </div>
            `;
        }

        emailContent += `
                <div style="text-align: center; padding: 20px; color: #666;">
                    <p>This order was submitted on ${new Date().toLocaleString()}</p>
                    <p style="font-size: 12px;">Metro by T-Mobile Supply Order System</p>
                </div>
            </div>
        </div>
        `;

        // Email options
        const mailOptions = {
            from: `"Metro Supply Orders" <${process.env.EMAIL_USER}>`,
            to: process.env.RECIPIENT_EMAIL,
            subject: `Supply Order - ${store} Store (${employeeName})`,
            html: emailContent
        };

        // Send email
        console.log('📧 Attempting to send email...');
        console.log('📧 Mail options:', {
            from: mailOptions.from,
            to: mailOptions.to,
            subject: mailOptions.subject
        });
        
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully!');
        console.log('📧 Message ID:', info.messageId);
        console.log('📧 Response:', info.response);

        res.json({
            success: true,
            message: 'Order submitted successfully! Email has been sent.',
            messageId: info.messageId
        });

    } catch (error) {
        console.error('❌ Error sending email:');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Full error:', error);
        
        res.status(500).json({
            success: false,
            message: 'Failed to submit order. Please try again.',
            error: error.message,
            errorCode: error.code
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test email endpoint
app.post('/test-email', async (req, res) => {
    try {
        console.log('🧪 Testing email configuration...');
        
        const testMailOptions = {
            from: `"Metro Supply Orders - TEST" <${process.env.EMAIL_USER}>`,
            to: process.env.RECIPIENT_EMAIL,
            subject: 'Test Email - Supply Order System',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #e91e63, #ad1457); color: white; padding: 20px; text-align: center;">
                        <h1 style="margin: 0;">🧪 Test Email</h1>
                        <p style="margin: 5px 0 0 0;">Metro by T-Mobile Supply Order System</p>
                    </div>
                    <div style="padding: 20px; background-color: #f9f9f9;">
                        <h2 style="color: #333;">Email Configuration Test</h2>
                        <p>This is a test email to verify that the supply order system can successfully send emails.</p>
                        <p><strong>Test sent at:</strong> ${new Date().toLocaleString()}</p>
                        <p><strong>Server:</strong> ${process.env.EMAIL_SERVER}</p>
                        <p><strong>Recipients:</strong> ${process.env.RECIPIENT_EMAIL}</p>
                        <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e91e63;">
                            <p style="margin: 0; color: #4caf50;"><strong>✅ Email system is working correctly!</strong></p>
                        </div>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(testMailOptions);
        console.log('✅ Test email sent successfully!');
        console.log('📧 Message ID:', info.messageId);

        res.json({
            success: true,
            message: 'Test email sent successfully!',
            messageId: info.messageId,
            recipients: process.env.RECIPIENT_EMAIL
        });

    } catch (error) {
        console.error('❌ Test email failed:');
        console.error('Error:', error.message);
        
        res.status(500).json({
            success: false,
            message: 'Test email failed',
            error: error.message,
            errorCode: error.code
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📧 Email configured for: ${process.env.RECIPIENT_EMAIL}`);
});