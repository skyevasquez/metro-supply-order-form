# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Metro by T-Mobile Supply Order Form - A web application that allows store employees to submit supply orders via an HTML form that sends automated email notifications to management.

**Tech Stack:**
- **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Backend:** Node.js + Express.js
- **Authentication:** Firebase Authentication (Email/Password)
- **Database:** Cloud Firestore
- **Email Service:** Nodemailer with Gmail SMTP
- **Deployment:** Supports local development, Firebase Hosting, and serverless (Vercel)

## Key Commands

### Development
```bash
# Install dependencies
npm install

# Start local development server with auto-reload
npm run dev

# Start production server
npm start
```

The application runs on port 3000 by default (configurable via `.env`).

### Firebase Commands
```bash
# Create test users (employee, manager, admin)
npm run test:users

# Set user role
npm run set:role user@example.com admin

# Deploy to Firebase Hosting
npm run firebase:deploy:hosting

# Deploy Firestore rules and indexes
npm run firebase:deploy:firestore

# Deploy everything
npm run firebase:deploy
```

### Testing Email
```bash
# Send test email to verify configuration (requires running server)
curl -X POST http://localhost:3000/api/test-email
```

### Health Check
```bash
# Verify server is running
curl http://localhost:3000/api/health
```

## Environment Configuration

Required `.env` file:
```env
EMAIL_SERVER=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
RECIPIENT_EMAIL=recipient1@example.com,recipient2@example.com
PORT=3000
```

**Important:** The app requires Gmail App Passwords (not regular passwords). Users must enable 2FA and generate an App Password.

## Architecture

### Dual Deployment Model
The application supports two deployment environments:

1. **Local/Traditional Server** (`server.js`):
   - Express server serving static files
   - Handles all routes directly
   - Routes: `/`, `/submit-order`, `/test-email`, `/health`

2. **Serverless (Vercel)** (`/api` directory):
   - Serverless functions in `/api/` folder
   - `api/submit-order.js` - Main form submission handler
   - `api/health.js` - Health check endpoint
   - `api/test-email.js` - Email configuration test

Both implementations share the same email template logic and validation.

### Form Data Flow
1. User fills out form with store location, employee name, supplies (office/cleaning items)
2. Frontend JavaScript (`script.js`) validates and collects data
3. Form can be previewed before submission (modal preview)
4. Data posted to `/api/submit-order` endpoint (works for both local and Vercel)
5. Backend generates HTML email with Metro branding (pink/magenta gradient theme)
6. Nodemailer sends to configured recipients
7. Success/error feedback shown to user

### Key Files
- `index.html` - Single-page form with dynamic supply items
- `script.js` - Form handling, validation, preview modal, API calls
- `styles.css` - Metro brand styling with gradients and animations
- `server.js` - Local Express server with dual routing (mirrors Vercel structure)
- `api/submit-order.js` - Serverless function for order submission
- `api/health.js` - Health check serverless function

### Store Locations
Hardcoded in HTML select dropdown:
- ARCHER
- NEWBERRY
- CHIEFLAND
- INVERNESS
- HOMOSASSA
- CRYSTAL RIVER

To add/modify stores, edit the `<select id="store">` options in `index.html`.

### Email Template
Both `server.js` and `api/submit-order.js` contain email HTML generation logic with:
- Metro branding (gradient header #e91e63 to #ad1457)
- Structured sections for office supplies and cleaning supplies
- Additional notes section
- Responsive HTML email design

## Development Notes

### Adding New Supply Items
Users can dynamically add/remove supply items via UI buttons. Each item has:
- Item name (text input)
- Quantity (number input)
- Remove button (with animation)

Items are collected into arrays (`officeSupplies`, `cleaningSupplies`) before submission.

### Local Storage Backup
Orders are saved to browser localStorage as backup, including:
- All form data
- Submission timestamp
- Email sent status
- Message ID (if successful)

### API Routes Compatibility
All endpoints have dual paths for local and Vercel compatibility:
- `/submit-order` AND `/api/submit-order`
- `/test-email` AND `/api/test-email`
- `/health` AND `/api/health`

### Error Handling
- Client-side validation before submission
- Server-side validation for required fields
- Detailed logging with emojis for debugging
- Fallback to localStorage if email fails
- User-friendly error messages

### Styling Architecture
CSS uses:
- CSS variables for Metro brand colors
- Gradient backgrounds and animated effects
- Responsive design (mobile-first approach)
- Modal for order preview
- Loading states for form submission
