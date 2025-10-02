import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from './config.js';
import { createUserProfile, getUserProfile } from './firestore.js';

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

/**
 * Get current authenticated user
 */
export function getCurrentUser() {
  return auth.currentUser;
}
