# Firebase Migration Plan
## Metro by T-Mobile Supply Order Form

**Version:** 1.0  
**Date:** October 2, 2025  
**Status:** Planning Phase

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Firebase Services Overview](#firebase-services-overview)
4. [Phase 1: Firebase Project Setup](#phase-1-firebase-project-setup)
5. [Phase 2: Firestore Database Migration](#phase-2-firestore-database-migration)
6. [Phase 3: Firebase Authentication Implementation](#phase-3-firebase-authentication-implementation)
7. [Phase 4: Enhanced Email Notifications](#phase-4-enhanced-email-notifications)
8. [Phase 5: Security Rules & Testing](#phase-5-security-rules--testing)
9. [Phase 6: Deployment Strategy](#phase-6-deployment-strategy)
10. [Rollback Strategy](#rollback-strategy)
11. [Timeline & Resources](#timeline--resources)

---

## Executive Summary

This document outlines the migration plan for transitioning the Metro by T-Mobile Supply Order Form from a traditional Node.js/Express application to a Firebase-powered solution with authentication and enhanced email notifications.

### Key Objectives:
- ✅ Migrate data storage to Cloud Firestore
- ✅ Implement Firebase Authentication with role-based access
- ✅ Enhance email notifications with authenticated user information
- ✅ Deploy to Firebase Hosting for scalability
- ✅ Maintain backward compatibility during migration

### Expected Benefits:
- **Scalability**: Auto-scaling infrastructure without server management
- **Security**: Built-in authentication and security rules
- **Real-time**: Live order status updates
- **Cost-effective**: Pay-as-you-go pricing model
- **Audit Trail**: Complete order history with user attribution

---

## Current State Analysis

### Existing Architecture
```
Frontend (Static HTML/CSS/JS)
        ↓
Express.js Server (server.js)
        ↓
Nodemailer → Gmail SMTP → Recipients
        ↓
localStorage (client-side backup)
```

### Current Data Flow:
1. User fills form without authentication
2. Form data validated client-side
3. POST to `/api/submit-order`
4. Server generates HTML email
5. Nodemailer sends email
6. Response returned to client
7. Data saved to browser localStorage

### Pain Points:
- ❌ No user authentication or tracking
- ❌ No persistent order history on server
- ❌ Cannot identify who submitted orders
- ❌ No role-based access control
- ❌ Limited scalability with single server
- ❌ Manual user management

---

## Firebase Services Overview

### Services to be Integrated:

1. **Firebase Authentication**
   - Email/Password authentication
   - Custom claims for role management
   - Session management

2. **Cloud Firestore**
   - Orders collection
   - Users collection
   - Stores collection
   - Real-time order status

3. **Firebase Hosting**
   - Static file hosting (HTML/CSS/JS)
   - Automatic SSL certificates
   - Global CDN

4. **Cloud Functions** (Optional)
   - Email trigger on new order
   - Order status updates
   - Admin notifications

5. **Firebase Admin SDK**
   - Server-side operations
   - Custom claims management
   - Email sending via Nodemailer

---

## Phase 1: Firebase Project Setup

### Step 1.1: Create Firebase Project

**Instructions:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name: `metro-supply-orders` (or your preferred name)
4. Enable Google Analytics (recommended)
5. Select or create Analytics account
6. Click "Create project"

**Expected Outcome:** Firebase project created with project ID

---

### Step 1.2: Register Web App

**Instructions:**
1. In Firebase Console, select your project
2. Click the web icon (`</>`) to add a web app
3. Register app with nickname: "Metro Supply Order Form"
4. Check "Also set up Firebase Hosting"
5. Copy the Firebase configuration object

**Configuration Object Example:**
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

---

### Step 1.3: Install Firebase CLI

**Instructions:**
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project directory
cd /Users/skyevasquez/Projects/metro-supply-order-form
firebase init
```

**During `firebase init`, select:**
- ✅ Firestore: Configure security rules and indexes
- ✅ Functions: Configure Cloud Functions (optional but recommended)
- ✅ Hosting: Configure files for Firebase Hosting
- ✅ Authentication: Set up local authentication emulator (for testing)

**Configuration Choices:**
- Firestore Rules: `firestore.rules`
- Firestore Indexes: `firestore.indexes.json`
- Functions Language: JavaScript
- Functions Source: `functions/`
- Public Directory: `public/`
- Single-page app: No
- Automatic builds: No

---

### Step 1.4: Install Firebase SDK Dependencies

**Instructions:**
```bash
# Install Firebase JavaScript SDK (client-side)
npm install firebase

# Install Firebase Admin SDK (server-side/functions)
npm install firebase-admin

# Keep existing dependencies
# npm install express nodemailer dotenv cors body-parser
```

**Update package.json scripts:**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "firebase:emulators": "firebase emulators:start",
    "firebase:deploy": "firebase deploy",
    "firebase:deploy:hosting": "firebase deploy --only hosting",
    "firebase:deploy:firestore": "firebase deploy --only firestore",
    "firebase:deploy:functions": "firebase deploy --only functions"
  }
}
```

---

### Step 1.5: Environment Variables Setup

**Create `.env.local` for Firebase credentials:**
```env
# Firebase Web App Config (Client-side)
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=metro-supply-orders.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=metro-supply-orders
VITE_FIREBASE_STORAGE_BUCKET=metro-supply-orders.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# Firebase Admin SDK (Server-side)
FIREBASE_PROJECT_ID=metro-supply-orders
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@metro-supply-orders.iam.gserviceaccount.com

# Existing Email Config (keep these)
EMAIL_SERVER=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
RECIPIENT_EMAIL=recipient1@example.com,recipient2@example.com
PORT=3000
```

**Update `.gitignore`:**
```
# Firebase
.firebase/
.firebaserc
firebase-debug.log
firestore-debug.log
ui-debug.log
.env.local
serviceAccountKey.json
```

---

### Step 1.6: Generate Service Account Key

**Instructions:**
1. Go to Firebase Console → Project Settings
2. Click "Service Accounts" tab
3. Click "Generate new private key"
4. Save as `serviceAccountKey.json` in project root
5. **NEVER commit this file to version control**

**Add to `.gitignore`:**
```
serviceAccountKey.json
```

---

## Phase 2: Firestore Database Migration

### Step 2.1: Design Firestore Data Model

**Collections Structure:**

#### **1. `users` Collection**
```javascript
users/{userId}
{
  uid: "firebase-auth-uid",
  email: "employee@metrobytmobile.com",
  displayName: "John Doe",
  role: "employee", // or "admin" or "manager"
  store: "ARCHER", // assigned store
  phoneNumber: "+1234567890",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastLogin: Timestamp,
  isActive: true,
  metadata: {
    employeeId: "EMP12345",
    department: "Sales",
    hireDate: "2024-01-15"
  }
}
```

#### **2. `orders` Collection**
```javascript
orders/{orderId}
{
  orderId: "auto-generated-id",
  
  // User Information (from Firebase Auth)
  userId: "firebase-auth-uid",
  userName: "John Doe",
  userEmail: "employee@metrobytmobile.com",
  userPhone: "+1234567890",
  
  // Order Details
  store: "ARCHER",
  orderDate: Timestamp,
  submittedAt: Timestamp,
  
  // Supply Items
  officeSupplies: [
    { name: "Pens", quantity: 10 },
    { name: "Paper", quantity: 5 }
  ],
  cleaningSupplies: [
    { name: "Cleaning Spray", quantity: 3 },
    { name: "Paper Towels", quantity: 2 }
  ],
  
  // Additional Info
  additionalNotes: "Urgent - needed by Friday",
  
  // Status Tracking
  status: "pending", // pending, approved, ordered, delivered, cancelled
  statusHistory: [
    {
      status: "pending",
      timestamp: Timestamp,
      updatedBy: "system"
    }
  ],
  
  // Email Tracking
  emailSent: true,
  emailSentAt: Timestamp,
  emailMessageId: "msg-id-from-nodemailer",
  
  // Metadata
  totalItems: 20,
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0..."
}
```

#### **3. `stores` Collection**
```javascript
stores/{storeId}
{
  storeId: "ARCHER",
  storeName: "ARCHER",
  address: {
    street: "123 Main St",
    city: "Archer",
    state: "FL",
    zipCode: "32618"
  },
  phoneNumber: "+13525551234",
  manager: "Jane Smith",
  managerEmail: "manager@metrobytmobile.com",
  isActive: true,
  employees: ["uid1", "uid2", "uid3"], // Array of user UIDs
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### **4. `orderTemplates` Collection** (Optional)
```javascript
orderTemplates/{templateId}
{
  templateId: "auto-generated-id",
  name: "Standard Office Supplies",
  category: "office", // or "cleaning"
  items: [
    { name: "Pens (Black)", defaultQuantity: 10 },
    { name: "Notepads", defaultQuantity: 5 },
    { name: "Stapler", defaultQuantity: 1 }
  ],
  createdBy: "admin-uid",
  createdAt: Timestamp,
  isActive: true
}
```

---

### Step 2.2: Create Firestore Initialization File

**Create `src/firebase/config.js`:**
```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration (from environment variables)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
```

---

### Step 2.3: Create Firestore Helper Functions

**Create `src/firebase/firestore.js`:**
```javascript
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from './config';

// Orders Collection
export const ordersCollection = collection(db, 'orders');
export const usersCollection = collection(db, 'users');
export const storesCollection = collection(db, 'stores');

/**
 * Create a new order in Firestore
 */
export async function createOrder(orderData) {
  try {
    const docRef = await addDoc(ordersCollection, {
      ...orderData,
      submittedAt: Timestamp.now(),
      status: 'pending',
      emailSent: false,
      statusHistory: [
        {
          status: 'pending',
          timestamp: Timestamp.now(),
          updatedBy: 'system'
        }
      ]
    });
    
    console.log('Order created with ID:', docRef.id);
    return { success: true, orderId: docRef.id };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

/**
 * Get user's order history
 */
export async function getUserOrders(userId, limitCount = 10) {
  try {
    const q = query(
      ordersCollection,
      where('userId', '==', userId),
      orderBy('submittedAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const orders = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    
    return orders;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId, newStatus, updatedBy) {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderDoc = await getDoc(orderRef);
    
    if (!orderDoc.exists()) {
      throw new Error('Order not found');
    }
    
    const currentHistory = orderDoc.data().statusHistory || [];
    
    await updateDoc(orderRef, {
      status: newStatus,
      statusHistory: [
        ...currentHistory,
        {
          status: newStatus,
          timestamp: Timestamp.now(),
          updatedBy: updatedBy
        }
      ]
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

/**
 * Get all orders for a specific store
 */
export async function getStoreOrders(storeName, limitCount = 50) {
  try {
    const q = query(
      ordersCollection,
      where('store', '==', storeName),
      orderBy('submittedAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const orders = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    
    return orders;
  } catch (error) {
    console.error('Error fetching store orders:', error);
    throw error;
  }
}

/**
 * Create or update user profile
 */
export async function createUserProfile(uid, userData) {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      // Update existing user
      await updateDoc(userRef, {
        ...userData,
        updatedAt: Timestamp.now()
      });
    } else {
      // Create new user
      await updateDoc(userRef, {
        uid,
        ...userData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isActive: true
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    throw error;
  }
}

/**
 * Get user profile
 */
export async function getUserProfile(uid) {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}
```

---

### Step 2.4: Migrate localStorage Data (Optional)

If you have existing orders in localStorage, create a migration script:

**Create `scripts/migrate-local-storage.js`:**
```javascript
// This script runs in the browser console to migrate localStorage data
// to Firestore after authentication is set up

async function migrateLocalStorageToFirestore() {
  const orders = JSON.parse(localStorage.getItem('supplyOrders') || '[]');
  
  if (orders.length === 0) {
    console.log('No orders to migrate');
    return;
  }
  
  console.log(`Found ${orders.length} orders to migrate`);
  
  for (const order of orders) {
    try {
      await createOrder({
        userId: 'MIGRATED_USER', // Update with actual user ID
        userName: order.employeeName || 'Unknown',
        userEmail: 'migrated@example.com',
        store: order.store,
        orderDate: order.orderDate,
        officeSupplies: order.officeSupplies || [],
        cleaningSupplies: order.cleaningSupplies || [],
        additionalNotes: order.notes || order.additionalNotes || '',
        emailSent: order.emailSent || false,
        totalItems: (order.officeSupplies?.length || 0) + (order.cleaningSupplies?.length || 0)
      });
      
      console.log(`Migrated order ${order.id}`);
    } catch (error) {
      console.error(`Failed to migrate order ${order.id}:`, error);
    }
  }
  
  console.log('Migration complete!');
  console.log('Original data still in localStorage. Clear manually after verification.');
}

// Run migration
migrateLocalStorageToFirestore();
```

---

## Phase 3: Firebase Authentication Implementation

### Step 3.1: Enable Authentication in Firebase Console

**Instructions:**
1. Go to Firebase Console → Authentication
2. Click "Get Started"
3. Select "Email/Password" as sign-in method
4. Enable "Email/Password"
5. (Optional) Enable "Email link (passwordless sign-in)"
6. Save changes

---

### Step 3.2: Define User Roles and Permissions

**Role Structure:**
```javascript
// User Roles (stored as custom claims in Firebase Auth)
const USER_ROLES = {
  EMPLOYEE: 'employee',    // Can submit orders for their assigned store
  MANAGER: 'manager',      // Can view/manage orders for their store
  ADMIN: 'admin'           // Full access to all stores and users
};

// Permission Matrix
const PERMISSIONS = {
  employee: [
    'order.create',
    'order.view.own',
    'profile.view.own',
    'profile.edit.own'
  ],
  manager: [
    'order.create',
    'order.view.store',
    'order.update.store',
    'profile.view.store',
    'reports.view.store'
  ],
  admin: [
    'order.create',
    'order.view.all',
    'order.update.all',
    'order.delete',
    'user.create',
    'user.view.all',
    'user.update.all',
    'user.delete',
    'store.manage',
    'reports.view.all'
  ]
};
```

---

### Step 3.3: Create Authentication Helper Functions

**Create `src/firebase/auth.js`:**
```javascript
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from './config';
import { createUserProfile, getUserProfile } from './firestore';

/**
 * Register a new user
 */
export async function registerUser(email, password, displayName, store, role = 'employee') {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update display name
    await updateProfile(user, { displayName });
    
    // Send email verification
    await sendEmailVerification(user);
    
    // Create user profile in Firestore
    await createUserProfile(user.uid, {
      email,
      displayName,
      role,
      store,
      phoneNumber: '',
      metadata: {
        employeeId: '',
        department: '',
        hireDate: new Date().toISOString().split('T')[0]
      }
    });
    
    console.log('✅ User registered successfully');
    return { success: true, user };
  } catch (error) {
    console.error('❌ Error registering user:', error);
    throw error;
  }
}

/**
 * Sign in existing user
 */
export async function signIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ User signed in successfully');
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('❌ Error signing in:', error);
    throw error;
  }
}

/**
 * Sign out current user
 */
export async function signOutUser() {
  try {
    await signOut(auth);
    console.log('✅ User signed out successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Error signing out:', error);
    throw error;
  }
}

/**
 * Listen to authentication state changes
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // User is signed in
      const userProfile = await getUserProfile(user.uid);
      callback({ user, profile: userProfile });
    } else {
      // User is signed out
      callback({ user: null, profile: null });
    }
  });
}

/**
 * Send password reset email
 */
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('✅ Password reset email sent');
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending password reset:', error);
    throw error;
  }
}

/**
 * Get current user's ID token (for API calls)
 */
export async function getCurrentUserToken() {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
}

/**
 * Check if user has specific role
 */
export async function checkUserRole(requiredRole) {
  const user = auth.currentUser;
  if (!user) return false;
  
  const idTokenResult = await user.getIdTokenResult();
  const userRole = idTokenResult.claims.role;
  
  // Admin has access to everything
  if (userRole === 'admin') return true;
  
  return userRole === requiredRole;
}
```

---

### Step 3.4: Create Authentication UI Components

**Create `public/auth.html` (Login/Register Page):**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Metro Supply Orders</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="auth-styles.css">
</head>
<body>
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-header">
                <h1>Metro Supply Orders</h1>
                <p>Employee Portal</p>
            </div>
            
            <!-- Login Form -->
            <div id="loginForm" class="auth-form">
                <h2>Sign In</h2>
                <form id="loginFormElement">
                    <div class="form-group">
                        <label for="loginEmail">Email</label>
                        <input type="email" id="loginEmail" required 
                               placeholder="employee@metrobytmobile.com">
                    </div>
                    
                    <div class="form-group">
                        <label for="loginPassword">Password</label>
                        <input type="password" id="loginPassword" required>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">Sign In</button>
                    </div>
                    
                    <div class="form-links">
                        <a href="#" id="showForgotPassword">Forgot Password?</a>
                        <a href="#" id="showRegister">Create Account</a>
                    </div>
                </form>
                
                <div id="loginError" class="error-message" style="display: none;"></div>
            </div>
            
            <!-- Register Form -->
            <div id="registerForm" class="auth-form" style="display: none;">
                <h2>Create Account</h2>
                <form id="registerFormElement">
                    <div class="form-group">
                        <label for="registerName">Full Name</label>
                        <input type="text" id="registerName" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="registerEmail">Email</label>
                        <input type="email" id="registerEmail" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="registerStore">Store Location</label>
                        <select id="registerStore" required>
                            <option value="">Choose a store...</option>
                            <option value="ARCHER">ARCHER</option>
                            <option value="NEWBERRY">NEWBERRY</option>
                            <option value="CHIEFLAND">CHIEFLAND</option>
                            <option value="INVERNESS">INVERNESS</option>
                            <option value="HOMOSASSA">HOMOSASSA</option>
                            <option value="CRYSTAL RIVER">CRYSTAL RIVER</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="registerPassword">Password</label>
                        <input type="password" id="registerPassword" required 
                               minlength="6" placeholder="At least 6 characters">
                    </div>
                    
                    <div class="form-group">
                        <label for="registerPasswordConfirm">Confirm Password</label>
                        <input type="password" id="registerPasswordConfirm" required>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">Create Account</button>
                    </div>
                    
                    <div class="form-links">
                        <a href="#" id="showLogin">Already have an account? Sign In</a>
                    </div>
                </form>
                
                <div id="registerError" class="error-message" style="display: none;"></div>
                <div id="registerSuccess" class="success-message" style="display: none;"></div>
            </div>
            
            <!-- Forgot Password Form -->
            <div id="forgotPasswordForm" class="auth-form" style="display: none;">
                <h2>Reset Password</h2>
                <p>Enter your email and we'll send you a password reset link.</p>
                
                <form id="forgotPasswordFormElement">
                    <div class="form-group">
                        <label for="resetEmail">Email</label>
                        <input type="email" id="resetEmail" required>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">Send Reset Link</button>
                    </div>
                    
                    <div class="form-links">
                        <a href="#" id="backToLogin">Back to Sign In</a>
                    </div>
                </form>
                
                <div id="resetError" class="error-message" style="display: none;"></div>
                <div id="resetSuccess" class="success-message" style="display: none;"></div>
            </div>
        </div>
    </div>
    
    <!-- Firebase SDK -->
    <script type="module">
        import { auth } from './src/firebase/config.js';
        import { 
            registerUser, 
            signIn, 
            resetPassword 
        } from './src/firebase/auth.js';
        
        // Form switching logic
        document.getElementById('showRegister').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('registerForm').style.display = 'block';
            document.getElementById('forgotPasswordForm').style.display = 'none';
        });
        
        document.getElementById('showLogin').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('loginForm').style.display = 'block';
            document.getElementById('registerForm').style.display = 'none';
            document.getElementById('forgotPasswordForm').style.display = 'none';
        });
        
        document.getElementById('showForgotPassword').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('registerForm').style.display = 'none';
            document.getElementById('forgotPasswordForm').style.display = 'block';
        });
        
        document.getElementById('backToLogin').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('loginForm').style.display = 'block';
            document.getElementById('registerForm').style.display = 'none';
            document.getElementById('forgotPasswordForm').style.display = 'none';
        });
        
        // Login handler
        document.getElementById('loginFormElement').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const errorDiv = document.getElementById('loginError');
            
            try {
                errorDiv.style.display = 'none';
                await signIn(email, password);
                // Redirect to main app
                window.location.href = '/index.html';
            } catch (error) {
                errorDiv.textContent = error.message;
                errorDiv.style.display = 'block';
            }
        });
        
        // Register handler
        document.getElementById('registerFormElement').addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const store = document.getElementById('registerStore').value;
            const password = document.getElementById('registerPassword').value;
            const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
            const errorDiv = document.getElementById('registerError');
            const successDiv = document.getElementById('registerSuccess');
            
            if (password !== passwordConfirm) {
                errorDiv.textContent = 'Passwords do not match';
                errorDiv.style.display = 'block';
                return;
            }
            
            try {
                errorDiv.style.display = 'none';
                successDiv.style.display = 'none';
                
                await registerUser(email, password, name, store);
                
                successDiv.textContent = 'Account created! Please check your email to verify your account.';
                successDiv.style.display = 'block';
                
                // Clear form
                document.getElementById('registerFormElement').reset();
                
                // Switch to login after 3 seconds
                setTimeout(() => {
                    document.getElementById('loginForm').style.display = 'block';
                    document.getElementById('registerForm').style.display = 'none';
                }, 3000);
            } catch (error) {
                errorDiv.textContent = error.message;
                errorDiv.style.display = 'block';
            }
        });
        
        // Forgot password handler
        document.getElementById('forgotPasswordFormElement').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('resetEmail').value;
            const errorDiv = document.getElementById('resetError');
            const successDiv = document.getElementById('resetSuccess');
            
            try {
                errorDiv.style.display = 'none';
                successDiv.style.display = 'none';
                
                await resetPassword(email);
                
                successDiv.textContent = 'Password reset link sent to your email!';
                successDiv.style.display = 'block';
                
                document.getElementById('forgotPasswordFormElement').reset();
            } catch (error) {
                errorDiv.textContent = error.message;
                errorDiv.style.display = 'block';
            }
        });
    </script>
</body>
</html>
```

---

### Step 3.5: Update Main Application with Auth Check

**Update `index.html` to require authentication:**
```html
<!-- Add at the top of body, before container -->
<div id="authCheck" style="display: none;">
    <div class="loading-overlay">
        <div class="loading-spinner"></div>
        <p>Checking authentication...</p>
    </div>
</div>

<!-- Add before closing body tag -->
<script type="module">
    import { auth } from './src/firebase/config.js';
    import { onAuthChange } from './src/firebase/auth.js';
    
    // Check authentication on page load
    const authCheck = document.getElementById('authCheck');
    authCheck.style.display = 'block';
    
    onAuthChange(({ user, profile }) => {
        authCheck.style.display = 'none';
        
        if (!user) {
            // Not authenticated, redirect to login
            window.location.href = '/auth.html';
        } else {
            // Authenticated, store user info for form submission
            window.currentUser = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || profile?.displayName,
                store: profile?.store,
                phoneNumber: profile?.phoneNumber || '',
                role: profile?.role || 'employee'
            };
            
            // Pre-fill store field if user has assigned store
            if (profile?.store) {
                document.getElementById('store').value = profile.store;
            }
            
            // Show user info in header
            showUserInfo(window.currentUser);
        }
    });
    
    function showUserInfo(user) {
        const headerMeta = document.querySelector('.header-meta');
        if (headerMeta) {
            headerMeta.innerHTML = `
                <span>Welcome, ${user.displayName}</span>
                <button onclick="handleSignOut()" class="btn-signout">Sign Out</button>
            `;
        }
    }
    
    window.handleSignOut = async function() {
        const { signOutUser } = await import('./src/firebase/auth.js');
        await signOutUser();
        window.location.href = '/auth.html';
    };
</script>
```

---

### Step 3.6: Server-Side: Set Custom Claims (Admin SDK)

**Create `scripts/set-user-role.js`:**
```javascript
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

/**
 * Set custom claims (role) for a user
 * Usage: node scripts/set-user-role.js user@example.com admin
 */
async function setUserRole(email, role) {
  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);
    
    // Set custom claims
    await admin.auth().setCustomUserClaims(user.uid, { role });
    
    console.log(`✅ Successfully set role "${role}" for user: ${email}`);
    console.log(`   User ID: ${user.uid}`);
    console.log('   User must sign out and sign back in for changes to take effect.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting user role:', error.message);
    process.exit(1);
  }
}

// Get command line arguments
const email = process.argv[2];
const role = process.argv[3];

if (!email || !role) {
  console.log('Usage: node set-user-role.js <email> <role>');
  console.log('Roles: employee, manager, admin');
  process.exit(1);
}

if (!['employee', 'manager', 'admin'].includes(role)) {
  console.log('❌ Invalid role. Must be: employee, manager, or admin');
  process.exit(1);
}

setUserRole(email, role);
```

**Run the script:**
```bash
# Set a user as admin
node scripts/set-user-role.js admin@metrobytmobile.com admin

# Set a user as manager
node scripts/set-user-role.js manager@metrobytmobile.com manager
```

---

## Phase 4: Enhanced Email Notifications

### Step 4.1: Update Form Submission to Include User Info

**Modify `script.js` - `submitOrder()` function:**
```javascript
// Submit the order (updated version)
async function submitOrder() {
    const formData = collectFormData();
    
    // Check if user is authenticated
    if (!window.currentUser) {
        showSuccessMessage('Please sign in to submit an order.', 'error');
        setTimeout(() => {
            window.location.href = '/auth.html';
        }, 2000);
        return;
    }
    
    // Add loading state
    const form = document.getElementById('orderForm');
    const submitBtn = document.querySelector('.submit-btn');
    
    form.classList.add('loading');
    submitBtn.textContent = 'Sending Order...';
    submitBtn.disabled = true;
    
    try {
        console.log('📤 Sending order data:', formData);
        
        // Get user's ID token for authentication
        const { getCurrentUserToken } = await import('./src/firebase/auth.js');
        const idToken = await getCurrentUserToken();
        
        // Send to server with user information
        const response = await fetch('/api/submit-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}` // Include auth token
            },
            body: JSON.stringify({
                // User Information (from Firebase Auth)
                userId: window.currentUser.uid,
                userName: window.currentUser.displayName,
                userEmail: window.currentUser.email,
                userPhone: window.currentUser.phoneNumber,
                userRole: window.currentUser.role,
                
                // Order Details
                employeeName: formData.employeeName, // Keep for backward compatibility
                store: formData.store,
                orderDate: formData.orderDate,
                officeSupplies: formData.officeSupplies,
                cleaningSupplies: formData.cleaningSupplies,
                additionalNotes: formData.notes,
                
                // Metadata
                totalItems: formData.officeSupplies.length + formData.cleaningSupplies.length,
                userAgent: navigator.userAgent
            })
        });
        
        // ... rest of existing code ...
        
        if (result.success) {
            // Save order to Firestore
            const { createOrder } = await import('./src/firebase/firestore.js');
            await createOrder({
                userId: window.currentUser.uid,
                userName: window.currentUser.displayName,
                userEmail: window.currentUser.email,
                userPhone: window.currentUser.phoneNumber,
                store: formData.store,
                orderDate: formData.orderDate,
                officeSupplies: formData.officeSupplies,
                cleaningSupplies: formData.cleaningSupplies,
                additionalNotes: formData.notes,
                emailSent: true,
                emailSentAt: new Date(),
                emailMessageId: result.messageId,
                totalItems: formData.officeSupplies.length + formData.cleaningSupplies.length
            });
            
            showSuccessMessage('Order submitted successfully! Email has been sent to management.');
            
            // Reset form
            document.getElementById('orderForm').reset();
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('orderDate').value = today;
            
            // Clear dynamic items and add default ones
            document.getElementById('officeSupplies').innerHTML = '';
            document.getElementById('cleaningSupplies').innerHTML = '';
            addSupplyItem('officeSupplies');
            addSupplyItem('cleaningSupplies');
        } else {
            throw new Error(result.message || 'Failed to submit order');
        }
    } catch (error) {
        console.error('❌ Error submitting order:', error);
        showSuccessMessage('Order submission failed. Please try again.', 'error');
    } finally {
        // Reset loading state
        form.classList.remove('loading');
        submitBtn.textContent = 'Submit Order';
        submitBtn.disabled = false;
    }
}
```

---

### Step 4.2: Update Server-Side Email Template

**Modify `api/submit-order.js` with enhanced user information:**
```javascript
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    })
  });
}

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

function buildEmailHtml({ 
  userName, 
  userEmail, 
  userPhone, 
  userRole,
  userId,
  store, 
  orderDate, 
  officeSupplies = [], 
  cleaningSupplies = [], 
  additionalNotes,
  orderId 
}) {
  let emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #e91e63, #ad1457); color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">📋 New Supply Order Request</h1>
        <p style="margin: 5px 0 0 0;">Metro by T-Mobile</p>
      </div>
      
      <div style="padding: 20px; background-color: #f9f9f9;">
        <!-- ORDER SUMMARY -->
        <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; border-bottom: 2px solid #e91e63; padding-bottom: 10px; margin-top: 0;">Order Summary</h2>
          <p style="margin: 5px 0;"><strong>Order ID:</strong> ${orderId || 'Pending'}</p>
          <p style="margin: 5px 0;"><strong>Store Location:</strong> ${store}</p>
          <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(orderDate).toLocaleDateString()}</p>
          <p style="margin: 5px 0;"><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <!-- EMPLOYEE INFORMATION (NEW!) -->
        <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ff9800;">
          <h3 style="color: #e65100; margin-top: 0;">👤 Submitted By</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 5px 10px 5px 0; vertical-align: top;"><strong>Name:</strong></td>
              <td style="padding: 5px 0;">${userName}</td>
            </tr>
            <tr>
              <td style="padding: 5px 10px 5px 0; vertical-align: top;"><strong>Email:</strong></td>
              <td style="padding: 5px 0;">
                <a href="mailto:${userEmail}" style="color: #e91e63; text-decoration: none;">${userEmail}</a>
              </td>
            </tr>
            ${userPhone ? `
            <tr>
              <td style="padding: 5px 10px 5px 0; vertical-align: top;"><strong>Phone:</strong></td>
              <td style="padding: 5px 0;">
                <a href="tel:${userPhone}" style="color: #e91e63; text-decoration: none;">${userPhone}</a>
              </td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 5px 10px 5px 0; vertical-align: top;"><strong>Role:</strong></td>
              <td style="padding: 5px 0;">
                <span style="background: #e91e63; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; text-transform: uppercase;">
                  ${userRole || 'Employee'}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 5px 10px 5px 0; vertical-align: top;"><strong>User ID:</strong></td>
              <td style="padding: 5px 0; font-family: monospace; font-size: 11px; color: #666;">${userId}</td>
            </tr>
          </table>
        </div>
  `;

  // Office Supplies Section
  if (officeSupplies && officeSupplies.length) {
    const officeTotal = officeSupplies.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
    emailContent += `
      <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3 style="color: #e91e63; margin-top: 0;">
          🖊️ Office Supplies 
          <span style="float: right; font-size: 14px; font-weight: normal; color: #666;">
            Total Items: ${officeTotal}
          </span>
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="text-align: left; padding: 10px; border-bottom: 2px solid #e91e63;">Item</th>
              <th style="text-align: center; padding: 10px; border-bottom: 2px solid #e91e63; width: 100px;">Quantity</th>
            </tr>
          </thead>
          <tbody>
            ${officeSupplies
              .filter((i) => i && i.name && i.quantity)
              .map((i, index) => `
                <tr style="background: ${index % 2 === 0 ? '#ffffff' : '#f9f9f9'};">
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">${i.name}</td>
                  <td style="text-align: center; padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${i.quantity}</td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Cleaning Supplies Section
  if (cleaningSupplies && cleaningSupplies.length) {
    const cleaningTotal = cleaningSupplies.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
    emailContent += `
      <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3 style="color: #e91e63; margin-top: 0;">
          🧽 Cleaning Supplies
          <span style="float: right; font-size: 14px; font-weight: normal; color: #666;">
            Total Items: ${cleaningTotal}
          </span>
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="text-align: left; padding: 10px; border-bottom: 2px solid #e91e63;">Item</th>
              <th style="text-align: center; padding: 10px; border-bottom: 2px solid #e91e63; width: 100px;">Quantity</th>
            </tr>
          </thead>
          <tbody>
            ${cleaningSupplies
              .filter((i) => i && i.name && i.quantity)
              .map((i, index) => `
                <tr style="background: ${index % 2 === 0 ? '#ffffff' : '#f9f9f9'};">
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">${i.name}</td>
                  <td style="text-align: center; padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${i.quantity}</td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Additional Notes
  if (additionalNotes && String(additionalNotes).trim()) {
    emailContent += `
      <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3 style="color: #e91e63; margin-top: 0;">📝 Additional Notes</h3>
        <p style="background: #f8f8f8; padding: 15px; border-radius: 4px; border-left: 4px solid #e91e63; margin: 0; white-space: pre-wrap;">${additionalNotes}</p>
      </div>
    `;
  }

  // Footer with action buttons
  emailContent += `
        <div style="background: #e1f5fe; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
          <p style="margin: 0 0 10px 0; color: #01579b; font-weight: bold;">Need to follow up?</p>
          <a href="mailto:${userEmail}?subject=Re: Supply Order for ${store}" 
             style="display: inline-block; background: #e91e63; color: white; padding: 10px 20px; 
                    text-decoration: none; border-radius: 5px; margin: 5px;">
            📧 Reply to Employee
          </a>
          <a href="tel:${userPhone}" 
             style="display: inline-block; background: #4caf50; color: white; padding: 10px 20px; 
                    text-decoration: none; border-radius: 5px; margin: 5px;">
            📞 Call Employee
          </a>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #ddd;">
          <p style="margin: 5px 0;">Metro by T-Mobile Supply Order System</p>
          <p style="margin: 5px 0;">This is an automated notification. Please do not reply to this email.</p>
          <p style="margin: 5px 0;">Contact ${userName} directly at ${userEmail} for questions about this order.</p>
        </div>
      </div>
    </div>
  `;

  return emailContent;
}

module.exports = async (req, res) => {
  // Verify it's a POST request
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    // Verify Firebase Auth token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized: No authentication token provided' 
      });
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (authError) {
      console.error('Auth verification failed:', authError);
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized: Invalid authentication token' 
      });
    }

    // Extract order data
    const {
      userId,
      userName,
      userEmail,
      userPhone,
      userRole,
      store,
      orderDate,
      officeSupplies = [],
      cleaningSupplies = [],
      additionalNotes,
    } = req.body || {};

    // Verify userId matches authenticated user
    if (userId !== decodedToken.uid) {
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden: User ID mismatch' 
      });
    }

    // Validate required fields
    if (!userName || !userEmail || !store || !orderDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Create order in Firestore first
    const db = admin.firestore();
    const orderRef = await db.collection('orders').add({
      userId,
      userName,
      userEmail,
      userPhone: userPhone || '',
      userRole: userRole || 'employee',
      store,
      orderDate: admin.firestore.Timestamp.fromDate(new Date(orderDate)),
      officeSupplies,
      cleaningSupplies,
      additionalNotes: additionalNotes || '',
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pending',
      emailSent: false,
      totalItems: officeSupplies.length + cleaningSupplies.length,
      statusHistory: [
        {
          status: 'pending',
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          updatedBy: 'system'
        }
      ]
    });

    const orderId = orderRef.id;

    // Build and send email
    const transporter = buildTransporter();
    const html = buildEmailHtml({ 
      userId,
      userName, 
      userEmail, 
      userPhone, 
      userRole,
      store, 
      orderDate, 
      officeSupplies, 
      cleaningSupplies, 
      additionalNotes,
      orderId 
    });

    const mailOptions = {
      from: `"Metro Supply Orders" <${process.env.EMAIL_USER}>`,
      to: process.env.RECIPIENT_EMAIL,
      replyTo: userEmail, // Allow recipients to reply directly to employee
      subject: `Supply Order #${orderId.substring(0, 8)} - ${store} Store (${userName})`,
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    // Update order with email info
    await orderRef.update({
      emailSent: true,
      emailSentAt: admin.firestore.FieldValue.serverTimestamp(),
      emailMessageId: info.messageId
    });

    console.log(`✅ Order ${orderId} created and email sent by ${userName} (${userEmail})`);

    return res.status(200).json({
      success: true,
      message: 'Order submitted successfully! Email has been sent.',
      orderId: orderId,
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('❌ Error submitting order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit order. Please try again.',
      error: error.message,
      errorCode: error.code,
    });
  }
};
```

---

### Step 4.3: Update `server.js` with Similar Changes

Apply the same email template and authentication verification to `server.js` for local development:

```javascript
// Add Firebase Admin initialization at the top of server.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Middleware to verify Firebase token
async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized: No authentication token provided' 
    });
  }

  const idToken = authHeader.split('Bearer ')[1];
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth verification failed:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized: Invalid authentication token' 
    });
  }
}

// Apply authentication middleware to protected routes
app.post('/submit-order', verifyFirebaseToken, handleSubmit);
app.post('/api/submit-order', verifyFirebaseToken, handleSubmit);

// Update handleSubmit function with same email template as api/submit-order.js
// ... (copy the enhanced email template from above)
```

---

## Phase 5: Security Rules & Testing

### Step 5.1: Configure Firestore Security Rules

**Edit `firestore.rules`:**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    function hasRole(role) {
      return isSignedIn() && request.auth.token.role == role;
    }
    
    function isAdmin() {
      return hasRole('admin');
    }
    
    function isManager() {
      return hasRole('manager') || isAdmin();
    }
    
    function isEmployee() {
      return hasRole('employee') || isManager();
    }
    
    function getUserStore() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.store;
    }
    
    function isSameStore(store) {
      return isSignedIn() && getUserStore() == store;
    }
    
    // Users collection
    match /users/{userId} {
      // Users can read their own profile
      allow read: if isOwner(userId) || isAdmin();
      
      // Users can update their own profile (except role)
      allow update: if isOwner(userId) && 
                      !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role', 'uid']);
      
      // Only admins can create or delete users
      allow create, delete: if isAdmin();
      
      // Admins can update any user
      allow update: if isAdmin();
    }
    
    // Orders collection
    match /orders/{orderId} {
      // Employees can create orders for their store
      allow create: if isEmployee() && 
                      request.resource.data.userId == request.auth.uid &&
                      request.resource.data.store == getUserStore();
      
      // Users can read their own orders
      allow read: if isOwner(resource.data.userId);
      
      // Managers can read orders from their store
      allow read: if isManager() && isSameStore(resource.data.store);
      
      // Admins can read all orders
      allow read: if isAdmin();
      
      // Managers can update orders from their store
      allow update: if isManager() && isSameStore(resource.data.store);
      
      // Admins can update and delete any order
      allow update, delete: if isAdmin();
    }
    
    // Stores collection
    match /stores/{storeId} {
      // Everyone can read store info
      allow read: if isSignedIn();
      
      // Only admins can modify stores
      allow create, update, delete: if isAdmin();
    }
    
    // Order templates collection
    match /orderTemplates/{templateId} {
      // Everyone can read templates
      allow read: if isSignedIn();
      
      // Only managers and admins can modify templates
      allow create, update, delete: if isManager();
    }
  }
}
```

**Deploy security rules:**
```bash
firebase deploy --only firestore:rules
```

---

### Step 5.2: Create Test Users

**Create `scripts/create-test-users.js`:**
```javascript
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createTestUsers() {
  const testUsers = [
    {
      email: 'employee@metrobytmobile.com',
      password: 'Employee123!',
      displayName: 'John Employee',
      role: 'employee',
      store: 'ARCHER'
    },
    {
      email: 'manager@metrobytmobile.com',
      password: 'Manager123!',
      displayName: 'Jane Manager',
      role: 'manager',
      store: 'ARCHER'
    },
    {
      email: 'admin@metrobytmobile.com',
      password: 'Admin123!',
      displayName: 'Admin User',
      role: 'admin',
      store: null
    }
  ];

  for (const userData of testUsers) {
    try {
      // Create auth user
      const userRecord = await admin.auth().createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName,
        emailVerified: true
      });

      console.log(`✅ Created user: ${userData.email}`);

      // Set custom claims
      await admin.auth().setCustomUserClaims(userRecord.uid, { 
        role: userData.role 
      });

      console.log(`   Set role: ${userData.role}`);

      // Create Firestore profile
      await db.collection('users').doc(userRecord.uid).set({
        uid: userRecord.uid,
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        store: userData.store,
        phoneNumber: '',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true,
        metadata: {
          employeeId: '',
          department: '',
          hireDate: new Date().toISOString().split('T')[0]
        }
      });

      console.log(`   Created Firestore profile\n`);

    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log(`⚠️  User already exists: ${userData.email}\n`);
      } else {
        console.error(`❌ Error creating user ${userData.email}:`, error.message, '\n');
      }
    }
  }

  console.log('\n✅ Test user creation complete!');
  console.log('\nTest Credentials:');
  testUsers.forEach(user => {
    console.log(`\n${user.role.toUpperCase()}:`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Password: ${user.password}`);
  });

  process.exit(0);
}

createTestUsers();
```

**Run the script:**
```bash
node scripts/create-test-users.js
```

---

### Step 5.3: Testing Checklist

**Manual Testing:**
- [ ] Register new user account
- [ ] Verify email verification works
- [ ] Sign in with test employee account
- [ ] Submit order as employee
- [ ] Verify email received with user info
- [ ] Check order saved to Firestore
- [ ] Sign in as manager
- [ ] View store orders
- [ ] Update order status
- [ ] Sign in as admin
- [ ] View all orders across stores
- [ ] Manage users
- [ ] Test security rules (try accessing unauthorized data)

**Email Template Testing:**
- [ ] Verify employee name appears correctly
- [ ] Verify email address is correct
- [ ] Verify phone number displays (if provided)
- [ ] Verify role badge shows
- [ ] Verify "Reply to Employee" button works
- [ ] Verify "Call Employee" button works (on mobile)
- [ ] Test email rendering in multiple clients (Gmail, Outlook, etc.)

---

## Phase 6: Deployment Strategy

### Step 6.1: Pre-Deployment Checklist

**Environment Setup:**
- [ ] Firebase project created
- [ ] Firebase CLI installed and authenticated
- [ ] All environment variables configured
- [ ] Service account key generated
- [ ] `.gitignore` updated
- [ ] Security rules deployed
- [ ] Test users created

**Code Changes:**
- [ ] Firebase SDK integrated
- [ ] Authentication implemented
- [ ] Firestore database functions created
- [ ] Email template updated with user info
- [ ] Server-side auth verification added
- [ ] Client-side auth checks implemented

**Testing Complete:**
- [ ] Local development tested
- [ ] Firebase emulators tested
- [ ] End-to-end order submission tested
- [ ] Email notifications tested
- [ ] Security rules verified

---

### Step 6.2: Deploy to Firebase Hosting

**Step-by-step deployment:**

1. **Prepare files for deployment:**
```bash
# Create public directory if it doesn't exist
mkdir -p public

# Copy static files to public
cp index.html public/
cp auth.html public/
cp styles.css public/
cp script.js public/
cp -r src public/
```

2. **Update `firebase.json`:**
```json
{
  "hosting": {
    "public": "public",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

3. **Deploy everything:**
```bash
# Deploy all services
firebase deploy

# Or deploy individually:
firebase deploy --only hosting
firebase deploy --only firestore
firebase deploy --only functions
```

4. **Verify deployment:**
```bash
# Get hosting URL
firebase hosting:channel:list

# Test the deployed application
open https://YOUR-PROJECT-ID.web.app
```

---

### Step 6.3: Post-Deployment Verification

**Checklist:**
- [ ] Application loads correctly
- [ ] Authentication works
- [ ] Can submit orders
- [ ] Emails are sent with user info
- [ ] Firestore data is being saved
- [ ] Security rules are active
- [ ] SSL certificate is active
- [ ] Custom domain configured (if applicable)

---

## Rollback Strategy

### Emergency Rollback Procedures

**If deployment fails or issues occur:**

1. **Rollback Firebase Hosting:**
```bash
# List hosting releases
firebase hosting:channel:list

# Rollback to previous version
firebase hosting:rollback
```

2. **Rollback Firestore Rules:**
```bash
# Restore previous rules from backup
firebase deploy --only firestore:rules
```

3. **Revert to Old System:**
```bash
# Switch DNS back to old server
# Keep old server running during migration period
```

4. **Restore Environment:**
```bash
# Restore .env file
# Restart old Node.js server
npm start
```

---

## Timeline & Resources

### Estimated Timeline

| Phase | Duration | Dependencies |
|-------|----------|-------------|
| Phase 1: Firebase Setup | 2-3 hours | None |
| Phase 2: Firestore Migration | 4-6 hours | Phase 1 |
| Phase 3: Authentication | 6-8 hours | Phase 1, 2 |
| Phase 4: Email Enhancement | 3-4 hours | Phase 3 |
| Phase 5: Security & Testing | 4-6 hours | All previous |
| Phase 6: Deployment | 2-3 hours | All previous |
| **Total** | **21-30 hours** | |

### Resource Requirements

**Personnel:**
- 1 Developer (full-stack)
- 1 QA Tester (for testing phase)
- 1 System Admin (for deployment)

**Tools & Services:**
- Firebase account (Spark plan free, Blaze plan for production)
- Gmail account with App Password
- Domain name (if using custom domain)
- Development environment
- Testing devices/browsers

### Budget Considerations

**Firebase Pricing (Blaze Plan):**
- Hosting: Free up to 10GB storage, 360MB/day
- Firestore: Free up to 50K reads, 20K writes, 20K deletes per day
- Authentication: Free up to 10K verifications per month
- Functions: Free up to 2M invocations per month

**Expected Monthly Cost:** $0-25 for small to medium usage

---

## Considerations & Potential Obstacles

### Technical Considerations

1. **Data Migration:**
   - Existing localStorage data needs manual migration
   - No existing user accounts to migrate
   - Store data needs to be seeded initially

2. **Email Delivery:**
   - Gmail SMTP has daily sending limits (500 emails/day)
   - Consider using SendGrid or Firebase Extensions for production
   - Email deliverability testing required

3. **Authentication Flow:**
   - Users must create accounts (no SSO initially)
   - Password reset flow needs testing
   - Email verification required for security

4. **Browser Compatibility:**
   - Firebase SDK requires modern browsers
   - Test on IE11 if required (may need polyfills)

### Security Considerations

1. **API Security:**
   - All API routes must verify Firebase tokens
   - Never trust client-side data
   - Validate all inputs server-side

2. **Data Privacy:**
   - Store minimal PII
   - Comply with data retention policies
   - Implement data export/deletion for GDPR

3. **Access Control:**
   - Test security rules thoroughly
   - Limit admin access
   - Audit user permissions regularly

### Operational Considerations

1. **User Training:**
   - Create user guides for login/registration
   - Document order submission process
   - Provide troubleshooting guide

2. **Support:**
   - Set up help desk for user issues
   - Monitor Firebase logs for errors
   - Create escalation procedures

3. **Monitoring:**
   - Set up Firebase Alerts
   - Monitor email delivery rates
   - Track order submission success rates

### Potential Obstacles & Solutions

| Obstacle | Impact | Solution |
|----------|--------|----------|
| Users forget passwords | Medium | Implement password reset flow |
| Email delivery failures | High | Add fallback notification method |
| Firestore quota exceeded | Medium | Upgrade to Blaze plan with alerts |
| Security rule misconfiguration | High | Thoroughly test with emulator |
| Migration data loss | Low | Keep localStorage backup |
| User adoption resistance | Medium | Provide training and support |
| Performance issues | Low | Optimize queries and indexes |
| Cost overruns | Low | Set budget alerts in Firebase |

---

## Next Steps

### Immediate Actions (This Week)

1. **Set up Firebase project**
   - Create project in Firebase Console
   - Install Firebase CLI
   - Initialize project locally

2. **Create authentication UI**
   - Build login/register pages
   - Test authentication flow
   - Create test users

3. **Implement basic Firestore integration**
   - Set up collections
   - Test data creation
   - Verify security rules

### Short-term Goals (Next 2 Weeks)

1. **Complete email enhancement**
   - Update email template
   - Test with user information
   - Verify delivery

2. **Testing phase**
   - End-to-end testing
   - Security testing
   - User acceptance testing

3. **Documentation**
   - User guides
   - Admin documentation
   - API documentation

### Long-term Goals (Next Month)

1. **Production deployment**
   - Deploy to Firebase Hosting
   - Configure custom domain
   - Set up monitoring

2. **User onboarding**
   - Create user accounts
   - Conduct training sessions
   - Gather feedback

3. **Optimization**
   - Performance tuning
   - Cost optimization
   - Feature enhancements

---

## Support & Documentation

### Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Data Modeling Guide](https://firebase.google.com/docs/firestore/data-model)
- [Firebase Authentication Best Practices](https://firebase.google.com/docs/auth/security)
- [Nodemailer Documentation](https://nodemailer.com)
- [Firebase Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)

### Contact Information

**Project Team:**
- Developer: [Your contact]
- Firebase Admin: [Firebase console link]
- Support Email: support@metrobytmobile.com

---

## Appendix

### A. Environment Variables Template

```env
# Firebase Web Config (Client)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Firebase Admin SDK (Server)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# Email Configuration
EMAIL_SERVER=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=
EMAIL_PASSWORD=
RECIPIENT_EMAIL=

# Server Configuration
PORT=3000
NODE_ENV=production
```

### B. Useful Commands Reference

```bash
# Firebase CLI
firebase login
firebase init
firebase deploy
firebase deploy --only hosting
firebase deploy --only firestore
firebase emulators:start
firebase hosting:channel:deploy preview

# Project Management
npm install
npm run dev
npm start
node scripts/set-user-role.js email@example.com admin
node scripts/create-test-users.js

# Testing
curl -X POST http://localhost:3000/api/health
curl -X POST http://localhost:3000/api/test-email
```

### C. Firestore Indexes

**Edit `firestore.indexes.json`:**
```json
{
  "indexes": [
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "submittedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "store", "order": "ASCENDING" },
        { "fieldPath": "submittedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "submittedAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

**End of Migration Plan**

*This document should be reviewed and updated as the migration progresses.*
