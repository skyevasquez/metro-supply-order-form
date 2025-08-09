const nodemailer = require('nodemailer');

function buildTransporter() {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: String(process.env.EMAIL_SECURE).toLowerCase() === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  return transporter;
}

function buildEmailHtml({ employeeName, store, orderDate, officeSupplies = [], cleaningSupplies = [], additionalNotes }) {
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

  if (officeSupplies && officeSupplies.length) {
    emailContent += `
      <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3 style="color: #e91e63; margin-top: 0;">🖊️ Office Supplies</h3>
        <ul style="list-style-type: none; padding: 0;">
          ${officeSupplies
            .filter((i) => i && i.name && i.quantity)
            .map((i) => `<li style="padding: 5px 0; border-bottom: 1px solid #eee;"><strong>${i.name}:</strong> ${i.quantity}</li>`)
            .join('')}
        </ul>
      </div>
    `;
  }

  if (cleaningSupplies && cleaningSupplies.length) {
    emailContent += `
      <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3 style="color: #e91e63; margin-top: 0;">🧽 Cleaning Supplies</h3>
        <ul style="list-style-type: none; padding: 0;">
          ${cleaningSupplies
            .filter((i) => i && i.name && i.quantity)
            .map((i) => `<li style="padding: 5px 0; border-bottom: 1px solid #eee;"><strong>${i.name}:</strong> ${i.quantity}</li>`)
            .join('')}
        </ul>
      </div>
    `;
  }

  if (additionalNotes && String(additionalNotes).trim()) {
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

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const {
      employeeName,
      store,
      orderDate,
      officeSupplies = [],
      cleaningSupplies = [],
      additionalNotes,
    } = req.body || {};

    if (!employeeName || !store || !orderDate) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const transporter = buildTransporter();

    // Optionally verify transporter in dev only to avoid cold-start cost
    if (process.env.NODE_ENV !== 'production') {
      try { await transporter.verify(); } catch (e) { /* log but continue to attempt send */ }
    }

    const html = buildEmailHtml({ employeeName, store, orderDate, officeSupplies, cleaningSupplies, additionalNotes });

    const mailOptions = {
      from: `"Metro Supply Orders" <${process.env.EMAIL_USER}>`,
      to: process.env.RECIPIENT_EMAIL,
      subject: `Supply Order - ${store} Store (${employeeName})`,
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: 'Order submitted successfully! Email has been sent.',
      messageId: info.messageId,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to submit order. Please try again.',
      error: error.message,
      errorCode: error.code,
    });
  }
};

