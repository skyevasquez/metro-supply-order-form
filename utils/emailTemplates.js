/**
 * Email template utilities for the supply order system
 */

/**
 * Generate HTML email template for supply order
 * @param {Object} orderData - Order information
 * @param {string} orderData.employeeName - Employee name
 * @param {string} orderData.store - Store location
 * @param {string} orderData.orderDate - Order date
 * @param {Array} orderData.officeSupplies - Office supplies array
 * @param {Array} orderData.cleaningSupplies - Cleaning supplies array
 * @param {string} orderData.additionalNotes - Additional notes
 * @returns {string} HTML email template
 */
export function generateOrderEmailTemplate(orderData) {
    const {
        employeeName,
        store,
        orderDate,
        officeSupplies,
        cleaningSupplies,
        additionalNotes
    } = orderData;

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

    return emailContent;
}

/**
 * Generate test email template
 * @returns {string} HTML test email template
 */
export function generateTestEmailTemplate() {
    return `
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
    `;
}