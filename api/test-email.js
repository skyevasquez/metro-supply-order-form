const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: String(process.env.EMAIL_SECURE).toLowerCase() === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: `"Metro Supply Orders - TEST" <${process.env.EMAIL_USER}>`,
      to: process.env.RECIPIENT_EMAIL,
      subject: 'Test Email - Supply Order System',
      text: `Test email sent at ${new Date().toLocaleString()}`,
    });

    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message, errorCode: error.code });
  }
};

