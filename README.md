# Metro by T-Mobile Supply Order Form

A modern, animated supply order form for Metro by T-Mobile with email integration.

## Features

- 🎨 **Modern UI/UX**: Beautiful gradients, animations, and responsive design
- 📧 **Email Integration**: Automatic email notifications to management
- 📱 **Mobile Responsive**: Works perfectly on all devices
- ⚡ **Real-time Validation**: Instant form validation and feedback
- 🔒 **Secure**: Environment-based configuration for sensitive data

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Email**: Nodemailer with Gmail SMTP
- **Styling**: Custom CSS with advanced animations and gradients

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your email configuration:
   ```env
   EMAIL_SERVER=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   RECIPIENT_EMAIL=recipient1@example.com,recipient2@example.com
   PORT=3000
   ```
4. Start the server:
   ```bash
   npm start
   ```

## Usage

1. Fill out the supply order form with required information
2. Preview your order before submission
3. Submit the form to automatically send emails to configured recipients
4. Receive confirmation of successful submission

## Email Configuration

The application uses Gmail SMTP for sending emails. Make sure to:
- Enable 2-factor authentication on your Gmail account
- Generate an App Password for the application
- Use the App Password in the `EMAIL_PASSWORD` environment variable

## Deployment

This application can be deployed to various platforms:
- Heroku
- Vercel
- Netlify (frontend only)
- Railway
- DigitalOcean App Platform

## License

© 2024 Metro by T-Mobile. All rights reserved.