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
    
    // Also update Firestore profile
    const db = admin.firestore();
    await db.collection('users').doc(user.uid).update({
      role: role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
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
  console.log('Usage: node scripts/set-user-role.js <email> <role>');
  console.log('Roles: employee, manager, admin');
  process.exit(1);
}

if (!['employee', 'manager', 'admin'].includes(role)) {
  console.log('❌ Invalid role. Must be: employee, manager, or admin');
  process.exit(1);
}

setUserRole(email, role);
