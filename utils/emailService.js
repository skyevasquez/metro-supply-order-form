/**
 * Email service utilities for the supply order system
 */
import nodemailer from 'nodemailer';
import { generateOrderEmailTemplate, generateTestEmailTemplate } from './emailTemplates.js';

/**
 * Create and configure email transporter
 * @returns {Object} Configured nodemailer transporter
 */
export function createEmailTransporter() {
    return nodemailer.createTransport({
        host: process.env.EMAIL_SERVER,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
}

/**
 * Verify email transporter configuration
 * @param {Object} transporter - Nodemailer transporter
 * @returns {Promise<void>}
 */
export async function verifyEmailConfig(transporter) {
    try {
        await transporter.verify();
        console.log('Email server is ready to send messages');
    } catch (error) {
        console.log('Email configuration error:', error);
        throw error;
    }
}

/**
 * Send supply order email
 * @param {Object} transporter - Nodemailer transporter
 * @param {Object} orderData - Order information
 * @returns {Promise<Object>} Send mail result
 */
export async function sendOrderEmail(transporter, orderData) {
    const emailContent = generateOrderEmailTemplate(orderData);

    const mailOptions = {
        from: `"Metro Supply Orders" <${process.env.EMAIL_USER}>`,
        to: process.env.RECIPIENT_EMAIL,
        subject: `Supply Order - ${orderData.store} Store (${orderData.employeeName})`,
        html: emailContent
    };

    console.log('📧 Attempting to send email...');
    console.log('📧 Mail options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
    });

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', result.messageId);

    return result;
}

/**
 * Send test email
 * @param {Object} transporter - Nodemailer transporter
 * @returns {Promise<Object>} Send mail result
 */
export async function sendTestEmail(transporter) {
    const emailContent = generateTestEmailTemplate();

    const testMailOptions = {
        from: `"Metro Supply Orders - TEST" <${process.env.EMAIL_USER}>`,
        to: process.env.RECIPIENT_EMAIL,
        subject: 'Test Email - Supply Order System',
        html: emailContent
    };

    console.log('🧪 Testing email configuration...');
    const result = await transporter.sendMail(testMailOptions);
    console.log('✅ Test email sent successfully!');

    return result;
}