# Firebase Setup Instructions
## Metro by T-Mobile Supply Order Form

This document provides step-by-step instructions for setting up Firebase for this project.

---

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Google account for Firebase
- Gmail account with App Password for email functionality

---

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" or "Create a project"
3. Enter project name: `metro-supply-orders` (or your preferred name)
4. Accept terms and click "Continue"
5. (Optional) Enable Google Analytics
6. Click "Create project"
7. Wait for project to be created, then click "Continue"

---

## Step 2: Register Your Web App

1. In the Firebase Console, click the **web icon** (`</>`) to add a web app
2. Enter app nickname: "Metro Supply Order Form"
3. **Do NOT** check "Also set up Firebase Hosting" (we'll do this separately)
4. Click "Register app"
5. **Copy the Firebase configuration object** - you'll need this soon!

The configuration should look like:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "metro-supply-orders.firebaseapp.com",
  projectId: "metro-supply-orders",
  storageBucket: "metro-supply-orders.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

6. Click "Continue to console"

---

## Step 3: Enable Firebase Authentication

1. In Firebase Console, click "Authentication" in the left sidebar
2. Click "Get started"
3. Click on "Email/Password" in the Sign-in method tab
4. **Toggle "Enable"** for Email/Password
5. Click "Save"

---

## Step 4: Enable Cloud Firestore

1. In Firebase Console, click "Firestore Database" in the left sidebar
2. Click "Create database"
3. Select "Start in **production mode**" (we have custom security rules)
4. Choose your Firestore location (e.g., `us-central`)
5. Click "Enable"

---

## Step 5: Generate Service Account Key

1. Go to **Project Settings** (gear icon next to "Project Overview")
2. Click the "Service Accounts" tab
3. Click "Generate new private key"
4. Click "Generate key" in the confirmation dialog
5. **Save the downloaded JSON file as `serviceAccountKey.json` in your project root**
6. **IMPORTANT:** Never commit this file to version control!

---

## Step 6: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in the values:

### Firebase Web Config (from Step 2)
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Firebase Admin SDK (from serviceAccountKey.json)
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
```

### Email Configuration (keep your existing values)
```env
EMAIL_SERVER=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
RECIPIENT_EMAIL=manager@metrobytmobile.com
```

**Note:** For `FIREBASE_PRIVATE_KEY`, make sure to keep it as a single line with `\n` for newlines.

---

## Step 7: Update Firebase Configuration in Code

1. Open `src/firebase/config.js`
2. The file should automatically use your environment variables
3. No changes needed if you filled out `.env` correctly!

---

## Step 8: Install Firebase CLI (if not already installed)

```bash
npm install -g firebase-tools
```

Verify installation:
```bash
firebase --version
```

---

## Step 9: Login to Firebase CLI

```bash
firebase login
```

This will open a browser window. Sign in with your Google account.

---

## Step 10: Initialize Firebase in Your Project

```bash
firebase init
```

**Select the following options:**

1. **Which Firebase features?** (use Space to select, Enter to confirm)
   - ✅ Firestore: Configure security rules and indexes
   - ✅ Hosting: Configure files for Firebase Hosting

2. **Please select an option:**
   - Select "Use an existing project"
   - Choose your project from the list

3. **Firestore Setup:**
   - What file should be used for Firestore Rules? → **firestore.rules** (already exists!)
   - What file should be used for Firestore indexes? → **firestore.indexes.json** (already exists!)

4. **Hosting Setup:**
   - What do you want to use as your public directory? → **.** (current directory)
   - Configure as a single-page app? → **No**
   - Set up automatic builds and deploys with GitHub? → **No**
   - File index.html already exists. Overwrite? → **No**

---

## Step 11: Deploy Firestore Rules

```bash
firebase deploy --only firestore
```

This deploys your security rules and indexes to Firestore.

---

## Step 12: Create Test Users

Run the test user creation script:

```bash
npm run test:users
```

This creates three test users:
- **Employee:** employee@metrobytmobile.com / Employee123!
- **Manager:** manager@metrobytmobile.com / Manager123!
- **Admin:** admin@metrobytmobile.com / Admin123!

---

## Step 13: Start the Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

---

## Step 14: Test the Application

1. Open `http://localhost:3000/auth.html` in your browser
2. Try logging in with one of the test accounts:
   - **Email:** employee@metrobytmobile.com
   - **Password:** Employee123!
3. You should be redirected to the main order form
4. Fill out and submit a test order
5. Check that the email is received

---

## Troubleshooting

### Issue: "Firebase configuration not found"
**Solution:** Make sure you've filled out all values in `.env` file and restarted the server.

### Issue: "Authentication failed"
**Solution:** 
- Check that you've enabled Email/Password authentication in Firebase Console
- Verify the test users were created successfully
- Try resetting the password in Firebase Console → Authentication → Users

### Issue: "Permission denied" when submitting order
**Solution:**
- Make sure Firestore security rules are deployed: `firebase deploy --only firestore`
- Check that the user has the correct role assigned
- Verify user is properly authenticated

### Issue: "Email not sending"
**Solution:**
- Verify Gmail App Password is correct in `.env`
- Check that 2FA is enabled on your Gmail account
- Test with: `curl -X POST http://localhost:3000/api/test-email`

### Issue: serviceAccountKey.json errors
**Solution:**
- Make sure the file exists in the project root
- Verify it's the correct JSON file downloaded from Firebase
- Check file permissions

---

## Setting User Roles

To change a user's role (employee, manager, or admin):

```bash
npm run set:role user@example.com manager
```

Example:
```bash
npm run set:role employee@metrobytmobile.com admin
```

**Note:** Users must sign out and sign back in for role changes to take effect.

---

## Optional: Deploy to Firebase Hosting

To deploy your app to Firebase Hosting:

```bash
npm run firebase:deploy:hosting
```

Your app will be available at: `https://YOUR-PROJECT-ID.web.app`

---

## Project Structure

```
metro-supply-order-form/
├── src/
│   └── firebase/
│       ├── config.js         # Firebase initialization
│       ├── auth.js           # Authentication functions
│       └── firestore.js      # Firestore database functions
├── scripts/
│   ├── create-test-users.js # Create test accounts
│   └── set-user-role.js     # Set user roles
├── api/
│   ├── submit-order.js       # Order submission endpoint
│   └── health.js             # Health check endpoint
├── auth.html                 # Login/Register page
├── index.html                # Main order form
├── script.js                 # Form logic with Firebase integration
├── server.js                 # Local development server
├── firestore.rules           # Firestore security rules
├── firestore.indexes.json    # Firestore query indexes
├── firebase.json             # Firebase configuration
├── .env                      # Environment variables (create from .env.example)
├── serviceAccountKey.json    # Firebase Admin credentials (create from Firebase Console)
└── SETUP.md                  # This file
```

---

## Next Steps

1. ✅ Customize the email template in `api/submit-order.js` if needed
2. ✅ Create real user accounts for your employees
3. ✅ Update the store list in `auth.html` and `index.html` if needed
4. ✅ Configure your email settings in `.env`
5. ✅ Test thoroughly before going to production
6. ✅ Deploy to Firebase Hosting when ready

---

## Important Security Notes

🔐 **Never commit these files to version control:**
- `.env`
- `serviceAccountKey.json`

✅ **These are already in `.gitignore`**

🔑 **Protect your Firebase credentials:**
- Don't share your API keys publicly
- Don't share your service account key
- Use environment variables for all sensitive data

---

## Support

For issues or questions:
1. Check the [Firebase Migration Plan](./FIREBASE_MIGRATION_PLAN.md) for detailed documentation
2. Review Firebase documentation: https://firebase.google.com/docs
3. Check Firebase Console for error logs

---

**Last Updated:** October 2, 2025
