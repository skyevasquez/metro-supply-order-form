# Deployment Checklist
## Metro Supply Order Form - Firebase Deployment

**Status:** ✅ Deployed to Firebase Hosting  
**URL:** https://sales-dashboard-1759420079.web.app  
**Project ID:** sales-dashboard-1759420079

---

## ✅ What's Already Done

- ✅ Firebase project linked
- ✅ Firestore rules deployed
- ✅ Firestore indexes deployed
- ✅ Static files deployed to Firebase Hosting
- ✅ App is live and accessible

---

## ⚠️ Required Steps to Complete Setup

### 1. Enable Firebase Authentication (CRITICAL)

**Go to:** https://console.firebase.google.com/project/sales-dashboard-1759420079/authentication

1. Click "Get started" (if you see it)
2. Click "Sign-in method" tab
3. Click "Email/Password"
4. Toggle "Enable"
5. Click "Save"

**Without this, users cannot login!**

---

### 2. Register Web App and Get Configuration

**Go to:** https://console.firebase.google.com/project/sales-dashboard-1759420079/settings/general

1. Scroll to "Your apps"
2. If you don't see a web app, click the web icon (`</>`)
3. Register app with nickname: "Metro Supply Order Form"
4. **Copy the Firebase configuration object**

It should look like:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "sales-dashboard-1759420079.firebaseapp.com",
  projectId: "sales-dashboard-1759420079",
  storageBucket: "sales-dashboard-1759420079.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

### 3. Update src/firebase/config.js with Real Credentials

Currently, the config has placeholder values. Replace them:

```bash
# Open the file
nano src/firebase/config.js
```

Update the firebaseConfig object with your actual values from step 2.

Or create a `.env` file:
```bash
cp .env.example .env
# Then fill in the values
```

---

### 4. Generate Service Account Key (for server-side)

**Go to:** https://console.firebase.google.com/project/sales-dashboard-1759420079/settings/serviceaccounts

1. Click "Generate new private key"
2. Click "Generate key"
3. Save the downloaded JSON file as `serviceAccountKey.json` in your project root
4. **DO NOT commit this file!** (it's already in .gitignore)

---

### 5. Create Test Users

Once Authentication is enabled and config is updated:

```bash
# Create test user accounts
npm run test:users
```

This will create:
- employee@metrobytmobile.com / Employee123!
- manager@metrobytmobile.com / Manager123!
- admin@metrobytmobile.com / Admin123!

---

### 6. Redeploy with Updated Configuration

After updating the Firebase config:

```bash
# Redeploy the hosting files with updated config
firebase deploy --only hosting
```

---

### 7. Test the Application

1. Visit: https://sales-dashboard-1759420079.web.app/auth.html
2. Try logging in with a test account
3. If you get "Firebase configuration error", the config isn't updated yet
4. If you get "Email/Password authentication not enabled", enable it in step 1

---

## 🔧 Commands Reference

### Deploy Everything
```bash
firebase deploy
```

### Deploy Only Hosting
```bash
firebase deploy --only hosting
```

### Deploy Only Firestore
```bash
firebase deploy --only firestore
```

### Create Test Users (requires serviceAccountKey.json)
```bash
npm run test:users
```

### Set User Role
```bash
npm run set:role email@example.com admin
```

### View Logs
```bash
firebase functions:log
```

---

## 📊 Current Status

**Deployed Components:**
- ✅ Firestore Rules
- ✅ Firestore Indexes  
- ✅ Static Files (HTML/CSS/JS)
- ✅ Auth page (auth.html)
- ✅ Main app (index.html)

**Pending Configuration:**
- ⚠️ Firebase Authentication (needs to be enabled in console)
- ⚠️ Firebase config values (needs real API keys)
- ⚠️ Service Account Key (for test user creation)
- ⚠️ Test users (needs to be created)

---

## 🐛 Troubleshooting

### "Firebase configuration not found"
**Fix:** Update `src/firebase/config.js` with real Firebase values

### "Authentication not enabled"
**Fix:** Enable Email/Password in Firebase Console → Authentication

### "Cannot create test users"
**Fix:** Download `serviceAccountKey.json` from Firebase Console

### Changes not showing
**Fix:** Run `firebase deploy --only hosting` again

### Clear browser cache
**Fix:** Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

---

## 📱 Your Live URLs

- **Main App:** https://sales-dashboard-1759420079.web.app
- **Login Page:** https://sales-dashboard-1759420079.web.app/auth.html
- **Firebase Console:** https://console.firebase.google.com/project/sales-dashboard-1759420079

---

## 🎯 Next Actions

1. [ ] Enable Authentication in Firebase Console
2. [ ] Register web app and get Firebase config
3. [ ] Update `src/firebase/config.js` with real values
4. [ ] Download service account key
5. [ ] Create test users with `npm run test:users`
6. [ ] Redeploy: `firebase deploy --only hosting`
7. [ ] Test login at auth page
8. [ ] Submit a test order
9. [ ] Verify email sent (if email configured)

---

**Last Updated:** October 2, 2025  
**Deployed By:** Firebase CLI v14.17.0
